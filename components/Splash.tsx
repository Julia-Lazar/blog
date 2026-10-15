"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Avatar3D from "./three/Avatar3D";

const MSGS = [
  "motivation.exe is not responding",
  "Coffee not found (404)",
  "Flaky test detected",
  "Assertion failed: you're not hired YET",
  "undefined is not a function",
  "Too many tabs open",
  "Brain cache expired",
  "Element not visible: focus",
  "Merge conflict: nap vs. study",
  "Timeout: 30000ms exceeded",
  "NullPointerException in Monday",
  "Unexpected token: procrastination",
];

const SEEN_KEY = "julka-splash-seen";

// time-of-day hello + "nice to meet you, I'm Julka, please treat me well!"
const INTRO = {
  jp: ["はじめまして、", "わたしはユルカです。", "よろしく！"],
  romaji: "Hajimemashite, watashi wa Julka desu, yoroshiku!",
  en: "Nice to meet you, I'm Julka!",
};

function greeting(hour: number) {
  const hello =
    hour >= 5 && hour < 11
      ? { jp: "おはよう！", romaji: "Ohayou!", en: "Good morning!" }
      : hour >= 11 && hour < 18
        ? { jp: "こんにちは！", romaji: "Konnichiwa!", en: "Hello!" }
        : { jp: "こんばんは！", romaji: "Konbanwa!", en: "Good evening!" };
  return {
    jp: [hello.jp, ...INTRO.jp],
    romaji: `${hello.romaji} ${INTRO.romaji}`,
    en: `${hello.en} ${INTRO.en}`,
  };
}

interface Win {
  id: number;
  left: number;
  top: number;
  msg: string;
}

/** QA Quest's error pop-up intro, minus the "Let's level up" screen, plus a bow. */
export default function Splash({ spec }: { spec: Record<string, unknown> }) {
  const [phase, setPhase] = useState<"off" | "popups" | "main" | "closing" | "out">("off");
  const [wins, setWins] = useState<Win[]>([]);
  const [gone, setGone] = useState(0);
  const [greet, setGreet] = useState(() => greeting(12));
  const timers = useRef<number[]>([]);
  const okRef = useRef<HTMLButtonElement>(null);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const close = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // nothing to remember then
    }
    setPhase((p) => {
      if (p !== "popups" && p !== "main") return p;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      return "closing";
    });
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch {
      // private mode: just show it
    }
    setWins([]);
    setGreet(greeting(new Date().getHours()));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const n = reduce ? 0 : 16;
    const W = window.innerWidth;
    const H = window.innerHeight;
    setPhase("popups");
    for (let i = 0; i < n; i++) {
      later(() => {
        const cluster = i > 6;
        const x = cluster
          ? W * 0.5 - 150 + (Math.random() - 0.5) * Math.min(420, W * 0.6)
          : Math.random() * (W - 220);
        const y = cluster
          ? H * 0.5 - 40 + (Math.random() - 0.5) * Math.min(300, H * 0.4)
          : Math.random() * (H - 110);
        setWins((w) => [
          ...w,
          {
            id: i,
            left: Math.max(4, Math.min(W - 214, x)),
            top: Math.max(4, Math.min(H - 104, y)),
            msg: MSGS[i % MSGS.length],
          },
        ]);
      }, i * 75);
    }
    // no auto-close: the visitor has to press "Fix"
    later(() => setPhase("main"), n * 75 + 250);
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase === "main") okRef.current?.focus();
    if (phase !== "closing") return;
    const total = wins.length + 1;
    const ids: number[] = [];
    for (let i = 1; i <= total; i++) ids.push(window.setTimeout(() => setGone(i), i * 35));
    ids.push(window.setTimeout(() => setPhase("out"), total * 35 + 250));
    return () => ids.forEach(clearTimeout);
  }, [phase, wins.length]);

  // its own effect: switching to "out" re-runs the one above, which would cancel this timer
  useEffect(() => {
    if (phase !== "out") return;
    const t = window.setTimeout(() => setPhase("off"), 450);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === "off") return null;

  // windows disappear newest-first, the big one before them
  const mainGone = gone >= 1;
  const winGone = (i: number) => gone >= 1 + (wins.length - i);

  return (
    <div
      id="splash"
      className={phase === "out" ? "out" : ""}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      // while fading out it must not catch clicks meant for the page
      style={phase === "out" ? { pointerEvents: "none" } : undefined}
    >
      <div aria-hidden="true">
        {wins.map((w, i) => (
          <div key={w.id} className={"sp-win" + (winGone(i) ? " gone" : "")} style={{ left: w.left, top: w.top }}>
            <div className="sp-tb">
              <span>Error</span>
              <i>✕</i>
            </div>
            <div className="sp-body">
              <span className="sp-x">✕</span>
              <span>{w.msg}</span>
            </div>
            <div className="sp-btn">OK</div>
          </div>
        ))}
      </div>
      {phase !== "popups" ? (
        <div className={"sp-win sp-main" + (mainGone ? " gone" : "")}>
          <div className="sp-tb">
            <span>Julka.exe</span>
            {/* the window can be closed like a real one, too */}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              style={{
                width: 22,
                height: 22,
                display: "grid",
                placeItems: "center",
                padding: 0,
                fontSize: 13,
                color: "#fff",
                background: "#D9503F",
                border: "1px solid #fff",
                borderRadius: 3,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
          <div className="sp-body">
            <div className="sp-bow">
              <Avatar3D
                spec={spec}
                label="Julka's character bowing"
                seq={[
                  ["bow", 2.4, 2.4],
                  ["wave", 2.1, 0.7],
                ]}
              />
            </div>
            <div>
              <p className="sp-jp" lang="ja" style={{ fontSize: "clamp(16px, 4.2vw, 19px)" }}>
                {greet.jp.map((part) => (
                  <span key={part} style={{ display: "inline-block" }}>
                    {part}
                  </span>
                ))}
              </p>
              <p className="sp-romaji">{greet.romaji}</p>
              <p>
                <small>({greet.en})</small>
              </p>
              <p>Click &quot;Fix&quot; to fix error.</p>
            </div>
          </div>
          <button ref={okRef} type="button" className="sp-btn sp-fix" onClick={close}>
            Fix
          </button>
        </div>
      ) : null}
    </div>
  );
}
