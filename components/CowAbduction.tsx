"use client";

import { useEffect, useRef, useState } from "react";
import Snap3D from "./three/Snap3D";
import LiveProp from "./three/LiveProp";

const ABDUCT_AFTER_MS = 60 * 1000;
const MUNCH_LENGTH_MS = 2400;
// after turning into a mooshroom: talk for a bit, then float up and away
const GOD_TALK_MS = 2500;
const ASCEND_MS = 6000;

/* The styles live here, next to the markup, so the scene never shows up unstyled
   (a stale global stylesheet once left the cows sitting at the top of the page). */
const CSS = `
.cow-scene {
  position: fixed;
  inset: 0;
  z-index: 0; /* behind the page content: the panels cover them where they overlap */
  pointer-events: none;
  overflow: hidden;
}

.cow {
  position: absolute;
  bottom: -18px; /* the render has empty space under the hooves */
  width: 320px;
  height: 320px;
}

/* the render has empty space around the cow, so the boxes stick out past the screen edges */
.cow-left { left: -75px; }

/* the right one faces left, towards the page */
.cow-right {
  /* where the beam pulls the cow: measured from the page, see aimBeam() */
  --lift-x: -20px;
  --lift-y: -260px;
  right: -75px;
  transform-origin: 50% 55%; /* the middle of the cow's body in the render */
}

.cow-right .cow-live { transform: scaleX(-1); }

.moo {
  position: absolute;
  top: 70px;
  left: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #fff;
  color: var(--on-neon);
  font: 400 12px var(--f-pixel);
  white-space: nowrap;
  opacity: 0;
}

.ufo {
  position: absolute;
  right: 0;
  bottom: 380px;
  width: 220px;
  height: 220px;
  opacity: 0;
}

.ufo .snap3d { position: relative !important; z-index: 1; }

.beam {
  position: absolute;
  left: 40px;
  top: 135px;
  width: 140px;
  height: 330px;
  clip-path: polygon(38% 0, 62% 0, 100% 100%, 0 100%);
  background: linear-gradient(180deg, rgba(255, 214, 0, 0.8), rgba(255, 214, 0, 0.1));
  opacity: 0;
}

/* above the cow and towards the screen edge, where the page content doesn't cover it */
.me-too {
  position: absolute;
  top: 10px;
  left: 95px;
  width: 190px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #fff;
  color: var(--on-neon);
  font: 400 10px/1.6 var(--f-pixel);
  opacity: 0;
  transform-origin: 0 100%;
}

.me-too::after {
  content: "";
  position: absolute;
  left: 14px;
  bottom: -8px;
  border: 8px solid transparent;
  border-bottom: 0;
  border-top-color: #fff;
}

/* the left cow, a mushroom, and what happens when one eats the other */
.cow-body { position: absolute; inset: 0; transform-origin: 30% 90%; }
.mushroom {
  position: absolute;
  left: 236px;
  bottom: 34px;
  width: 64px;
  height: 64px;
  transform-origin: 50% 100%;
}
.mushroom .snap3d { width: 100% !important; height: 100% !important; }
.left-eating .cow-body { animation: munch 2.4s ease-in-out; }
.left-eating .mushroom { animation: eaten 2.4s ease-in forwards; }
.left-moo .cow-body { animation: poof 0.7s ease-out; }
/* "WoW I am a god": then it floats slowly up, out of the screen */
.left-moo .cow-left { animation: ascend 6s ease-in 2.5s forwards; }
.left-moo .god { animation: god-talk 12.5s linear forwards; }
.god {
  position: absolute;
  top: 10px;
  left: 95px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #fff;
  color: var(--on-neon);
  font: 400 11px/1.6 var(--f-pixel);
  white-space: nowrap;
  opacity: 0;
}
.god::after {
  content: "";
  position: absolute;
  left: 14px;
  bottom: -8px;
  border: 8px solid transparent;
  border-bottom: 0;
  border-top-color: #fff;
}
@keyframes ascend {
  from { translate: 0 0; }
  to { translate: 0 -130vh; }
}
@keyframes god-talk {
  0%, 4% { opacity: 0; scale: 0.6; }
  8%, 55% { opacity: 1; scale: 1; }
  62%, 100% { opacity: 0; scale: 1; }
}
/* the mooshroom glows like an RGB graphics card */
.left-moo .cow-body canvas { animation: rgb 4s linear infinite; }

@keyframes munch {
  0% { rotate: 0deg; }
  15%, 45%, 75% { rotate: 7deg; }
  30%, 60% { rotate: 3deg; }
  100% { rotate: 0deg; }
}
@keyframes eaten {
  0%, 20% { scale: 1; opacity: 1; }
  45% { scale: 0.7 0.55; }
  70% { scale: 0.35 0.25; opacity: 1; }
  90%, 100% { scale: 0; opacity: 0; }
}
@keyframes poof {
  0% { scale: 0.6; filter: brightness(3); }
  60% { scale: 1.12; }
  100% { scale: 1; filter: none; }
}
@keyframes rgb {
  0% { filter: hue-rotate(0deg) drop-shadow(0 0 12px #ff1744); }
  20% { filter: hue-rotate(72deg) drop-shadow(0 0 16px #ffd600); }
  40% { filter: hue-rotate(144deg) drop-shadow(0 0 16px #39ff14); }
  60% { filter: hue-rotate(216deg) drop-shadow(0 0 16px #00e5ff); }
  80% { filter: hue-rotate(288deg) drop-shadow(0 0 16px #d500f9); }
  100% { filter: hue-rotate(360deg) drop-shadow(0 0 12px #ff1744); }
}

@media (max-width: 720px) {
  .mushroom { left: 140px; bottom: 20px; width: 42px; height: 42px; }
  .god { left: 55px; top: -24px; font-size: 9px; }
  .me-too { left: 55px; top: -24px; width: 150px; font-size: 8px; }
  .cow { width: 190px; height: 190px; bottom: -10px; }
  .cow-left { left: -45px; }
  .cow-right { right: -45px; }
  .ufo { bottom: 260px; transform: scale(0.7); transform-origin: 100% 100%; }
  .moo { top: 36px; left: 0; font-size: 10px; }
}

.is-abducting .ufo { animation: ufo-visit 9s ease-in-out forwards; }
.is-abducting .beam { animation: beam 9s linear forwards; }
.is-abducting .cow-right { animation: beam-up 9s ease-in forwards; }
.is-abducting .moo { animation: moo 9s linear forwards; }
.is-abducting .cow-left { animation: jealous-hop 9s ease-in-out forwards; }
.is-abducting .me-too { animation: me-too 9s linear forwards; }

/* the left cow wants in on it: a few hops while the beam is on */
@keyframes jealous-hop {
  0%, 41% { translate: 0 0; }
  44% { translate: 0 -40px; }
  47% { translate: 0 0; }
  51% { translate: 0 -48px; }
  54% { translate: 0 0; }
  58% { translate: 0 -40px; }
  61% { translate: 0 0; }
  65% { translate: 0 -30px; }
  68%, 100% { translate: 0 0; }
}

/* starts ~4 s into the 9 s show and stays fully visible for 4 s (45% -> 89%) */
@keyframes me-too {
  0%, 42% { opacity: 0; scale: 0.6; }
  45%, 89% { opacity: 1; scale: 1; }
  92%, 100% { opacity: 0; scale: 1; }
}

@keyframes ufo-visit {
  0% { opacity: 0; translate: -70vw -70vh; scale: 0.3; }
  20% { opacity: 1; translate: 0 0; scale: 1; }
  25%, 65% { translate: 0 0; rotate: 0deg; }
  35% { rotate: -4deg; }
  45% { rotate: 4deg; }
  55% { rotate: -3deg; }
  72% { translate: 0 -10px; opacity: 1; scale: 1; }
  100% { translate: 30vw -90vh; scale: 0.2; opacity: 0; }
}

@keyframes beam {
  0%, 24% { opacity: 0; }
  28%, 62% { opacity: 1; }
  68%, 100% { opacity: 0; }
}

/* the cow shrinks on the way up and ends exactly on the saucer, where it disappears */
@keyframes beam-up {
  0%, 30% { translate: 0 0; scale: 1; rotate: 0deg; opacity: 1; }
  34% { translate: 0 -6px; rotate: -6deg; }
  38% { translate: 0 0; rotate: 6deg; scale: 1; }
  58% { translate: var(--lift-x) var(--lift-y); scale: 0.18; rotate: 12deg; opacity: 1; }
  63%, 100% { translate: var(--lift-x) var(--lift-y); scale: 0.02; rotate: 12deg; opacity: 0; }
}

@keyframes moo {
  0%, 29% { opacity: 0; }
  31%, 44% { opacity: 1; }
  48%, 100% { opacity: 0; }
}
`;
const SHOW_LENGTH_MS = 9000;

/* Two Minecraft cows graze in the bottom corners. A minute after the page loads, a UFO
   beams the right one aboard; the left one wants in too, eats the mushroom next to it and
   turns into a glowing, spinning mooshroom. (?ufo or ?moo in the URL: it all starts after 3 s) */
export default function CowAbduction() {
  const [phase, setPhase] = useState<"idle" | "abducting" | "gone">("idle");
  const [spinning, setSpinning] = useState(false);
  const [left, setLeft] = useState<"grazing" | "eating" | "moo" | "gone">("grazing");
  const munchTimer = useRef<number | undefined>(undefined);
  const cowRef = useRef<HTMLSpanElement>(null);
  const ufoRef = useRef<HTMLSpanElement>(null);
  const beamRef = useRef<HTMLSpanElement>(null);

  // Before the show starts (the saucer still sits invisibly in its parking spot),
  // measure where it is, so the beam reaches the cow and the cow ends up inside the saucer.
  const aimBeam = () => {
    const cow = cowRef.current, ufo = ufoRef.current, beam = beamRef.current;
    if (!cow || !ufo || !beam) return;
    const c = cow.getBoundingClientRect(), u = ufo.getBoundingClientRect(), b = beam.getBoundingClientRect();
    const scale = u.width / 220; // the saucer is shrunk on small screens
    // the cow shrinks around the middle of its body (transform-origin 50% 55%):
    // move that point onto the saucer's disc, a bit below the middle of the render
    cow.style.setProperty("--lift-x", `${Math.round(u.left + u.width / 2 - (c.left + c.width / 2))}px`);
    cow.style.setProperty("--lift-y", `${Math.round(u.top + u.height * 0.66 - (c.top + c.height * 0.55))}px`);
    // the beam reaches down to the cow's back
    beam.style.height = `${Math.max(80, Math.round((c.top + c.height * 0.55 - b.top) / scale))}px`;
  };

  useEffect(() => {
    if (left === "eating") {
      const t = window.setTimeout(() => setLeft("moo"), MUNCH_LENGTH_MS);
      return () => window.clearTimeout(t);
    }
    if (left === "moo") {
      // once it has floated off the screen, stop drawing it
      const t = window.setTimeout(() => setLeft("gone"), GOD_TALK_MS + ASCEND_MS + 200);
      return () => window.clearTimeout(t);
    }
  }, [left]);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const q = new URLSearchParams(window.location.search);
    const soon = q.has("ufo") || q.has("moo");
    const start = window.setTimeout(() => {
      aimBeam();
      setPhase("abducting");
    }, soon ? 3000 : ABDUCT_AFTER_MS);
    return () => window.clearTimeout(start);
  }, []);

  useEffect(() => {
    if (phase !== "abducting") return;
    // the cow starts spinning when the beam grabs it (30% into the show)
    const spin = window.setTimeout(() => setSpinning(true), SHOW_LENGTH_MS * 0.3);
    const end = window.setTimeout(() => setPhase("gone"), SHOW_LENGTH_MS);
    return () => {
      window.clearTimeout(spin);
      window.clearTimeout(end);
    };
  }, [phase]);

  // the left cow shouts "me too!" (at ~42% of the show) and 5 s later decides to eat the mushroom;
  // this timer outlives the abduction show, so it has its own effect
  useEffect(() => {
    if (phase !== "abducting") return;
    munchTimer.current = window.setTimeout(() => setLeft("eating"), SHOW_LENGTH_MS * 0.42 + 5000);
  }, [phase]);

  useEffect(() => () => window.clearTimeout(munchTimer.current), []);

  return (
    <div
      className={"cow-scene is-" + phase + " left-" + left}
      aria-hidden="true"
      // the layer itself is positioned inline too: worst case it is invisible, never in the way
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      <style>{CSS}</style>
      {left !== "gone" ? (
      <span className="cow cow-left">
        <span className="cow-body">
          <LiveProp
            name="cow"
            className="cow-live"
            offset={0}
            variant={left === "moo" ? "mooshroom" : undefined}
            spin={left === "moo"}
            spinSpeed={2.2}
          />
        </span>
        {left !== "moo" ? (
          <span className="mushroom">
            <Snap3D icon="prop:mc-mushroom" alt="" size={64} />
          </span>
        ) : null}
        <span className="me-too">Hey, I want to meet the aliens too!</span>
        <span className="god">WoW I am a god</span>
      </span>
      ) : null}
      {phase !== "gone" ? (
        <span className="cow cow-right" ref={cowRef}>
          <LiveProp name="cow" className="cow-live" offset={3.2} spin={spinning} />
          <span className="moo">MOO?!</span>
        </span>
      ) : null}
      {/* rendered (invisible) from the start, so the saucer is drawn before it's needed */}
      {phase !== "gone" ? (
        <span className="ufo" ref={ufoRef}>
          <span className="beam" ref={beamRef} />
          <Snap3D icon="prop:ufo" alt="" size={220} />
        </span>
      ) : null}
    </div>
  );
}
