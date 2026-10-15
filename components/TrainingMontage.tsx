"use client";

import { useEffect, useState } from "react";
import { ITEM } from "@/../lib/catalog";
import Snap3D from "./three/Snap3D";
import { Tick } from "./icons";

/* QA Quest's training montage: the character posed in 3D, two frames flip-booked by CSS. */
const MONTAGE = [
  { k: "limit", cap: "PUSH IT TO THE LIMIT", t: "Reps today: as many as it takes. Rest: when the build is green." },
  { k: "tiger", cap: "EYE OF THE TIGER", t: "Rising up to the challenge of my rival: one tiny bug." },
  { k: "just", cap: "JUST DO IT", t: "Don't think. Tick. Then think about why the tick matters." },
  { k: "party", cap: "ALL TESTS PASSED", t: "Future me, after the interview. Dress code: sunglasses." },
  { k: "rest", cap: "RECHARGING", t: "Even a test-nin needs a nap between pipelines." },
] as const;

const POSE = { limit: "lift", tiger: "punch", just: "run", party: "dance", rest: "sleep" } as const;
const CONFETTI = ["#39FF14", "#FFC2D4", "#5E8BFF", "#FFC93C", "#3FD0FF", "#FF8FB1", "#2BF07A", "#FFFFFF"];

function Actor({ spec, pose }: { spec: Record<string, unknown>; pose: string }) {
  return (
    <span className="actor">
      <Snap3D icon={`pose:${pose}:0`} spec={spec} alt="" size={136} className="fA" />
      <Snap3D icon={`pose:${pose}:1`} spec={spec} alt="" size={136} className="fB" />
    </span>
  );
}

function Scene({ k, spec }: { k: (typeof MONTAGE)[number]["k"]; spec: Record<string, unknown> }) {
  const cap = MONTAGE.find((m) => m.k === k)!.cap;
  const sp = k === "party" && !spec.face ? { ...spec, face: ITEM.f1 } : spec;
  return (
    <div className={"scene sc-" + k} role="img" aria-label={`My character: ${cap.toLowerCase()}`}>
      <div className="floor" />
      {k === "limit" ? (
        <>
          <div className="meter">
            <span>MOTIVATION</span>
            <div>
              <i />
            </div>
            <em>110%</em>
          </div>
          <span className="drop d1" />
          <span className="drop d2" />
        </>
      ) : null}
      {k === "tiger" ? (
        <>
          {/* the tiger is her corner coach: on the floor next to her, cheering */}
          <span
            className="tiger"
            style={{ left: "4%", right: "auto", top: "auto", bottom: 34, width: 112, height: 112, transformOrigin: "50% 100%" }}
          >
            <Snap3D icon="prop:tiger" alt="" size={112} />
          </span>
          {/* speech bubble right above the tiger's head, with a little tail pointing at it */}
          <span
            style={{
              position: "absolute",
              left: "calc(4% + 22px)",
              bottom: 128,
              padding: "6px 9px",
              borderRadius: 8,
              background: "#FF8F00",
              color: "#1B1B1B",
              font: "400 9px/1.5 var(--f-pixel)",
              whiteSpace: "nowrap",
              zIndex: 2,
            }}
          >
            RAWR! GO JULKA!
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 46,
                bottom: -7,
                borderLeft: "7px solid transparent",
                borderRight: "7px solid transparent",
                borderTop: "8px solid #FF8F00",
              }}
            />
          </span>
          {/* the rival: a ladybug, Biedronka-logo style */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/biedronka.png" alt="" className="bug" style={{ width: 42, height: 59, objectFit: "contain" }} />
          <span className="fixed">BUG FIXED</span>
        </>
      ) : null}
      {k === "just" ? (
        <>
          <span className="speed" style={{ top: 40, left: "10%", right: "10%" }} />
          <span className="speed" style={{ top: 62, left: "30%", right: "10%" }} />
          <span className="speed" style={{ top: 84, left: "18%", right: "40%" }} />
          <Tick className="tick c1" />
          <Tick className="tick c2" />
          <Tick className="tick c3" />
        </>
      ) : null}
      {k === "party"
        ? CONFETTI.map((c, i) => (
            <span
              key={c}
              className="confetti"
              style={{ left: `${6 + i * 12}%`, background: c, animationDelay: `${(i * 0.27).toFixed(2)}s` }}
            />
          ))
        : null}
      {k === "rest" ? <span className="zzz">Zzz</span> : null}
      <Actor spec={sp} pose={POSE[k]} />
      <div className="cap">{cap}</div>
    </div>
  );
}

export default function TrainingMontage({ spec }: { spec: Record<string, unknown> }) {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % MONTAGE.length), 7000);
    return () => window.clearInterval(t);
  }, [auto]);

  return (
    <section className="panel" aria-label="Training montage">
      <div className="panel-head">
        <h2>
          <Snap3D icon="prop:boxing-gloves" alt="" size={40} /> Training montage
        </h2>
        <span className="label">cue the 80s synth</span>
      </div>
      <Scene k={MONTAGE[i].k} spec={spec} />
      <div className="montage-dots" role="group" aria-label="Choose a scene">
        {MONTAGE.map((m, n) => (
          <button
            key={m.k}
            type="button"
            aria-pressed={n === i}
            aria-label={`Scene ${n + 1}`}
            onClick={() => {
              setI(n);
              setAuto(false);
            }}
          />
        ))}
      </div>
      <p className="muted" style={{ textAlign: "center", fontWeight: 700, margin: "8px 0 0" }}>
        {MONTAGE[i].t}
      </p>
    </section>
  );
}
