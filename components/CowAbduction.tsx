"use client";

import { useEffect, useState } from "react";
import Snap3D from "./three/Snap3D";

const ABDUCT_AFTER_MS = 2 * 60 * 1000;

/* The styles live here, next to the markup, so the scene never shows up unstyled
   (a stale global stylesheet once left the cows sitting at the top of the page). */
const CSS = `
.cow-scene {
  position: fixed;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  overflow: hidden;
}

.cow {
  position: absolute;
  bottom: 4px;
  width: 120px;
  height: 120px;
}

.cow-left { left: 6px; }

/* the right one faces left, towards the page */
.cow-right {
  right: 6px;
  transform-origin: 50% 0;
}

.cow-right .snap3d { transform: scaleX(-1); }

.moo {
  position: absolute;
  top: -6px;
  left: -34px;
  padding: 6px 8px;
  border-radius: 8px;
  background: #fff;
  color: var(--on-neon);
  font: 400 9px var(--f-pixel);
  white-space: nowrap;
  opacity: 0;
}

.ufo {
  position: absolute;
  right: -10px;
  bottom: 190px;
  width: 150px;
  height: 150px;
  opacity: 0;
}

.ufo .snap3d { position: relative !important; z-index: 1; }

.beam {
  position: absolute;
  left: 30px;
  top: 92px;
  width: 90px;
  height: 200px;
  clip-path: polygon(38% 0, 62% 0, 100% 100%, 0 100%);
  background: linear-gradient(180deg, rgba(57, 255, 20, 0.75), rgba(57, 255, 20, 0.08));
  opacity: 0;
}

@media (max-width: 720px) {
  .cow { width: 70px; height: 70px; }
  .cow .snap3d { width: 70px !important; height: 70px !important; }
  .ufo { transform: scale(0.7); transform-origin: 100% 100%; }
}

.is-abducting .ufo { animation: ufo-visit 9s ease-in-out forwards; }
.is-abducting .beam { animation: beam 9s linear forwards; }
.is-abducting .cow-right { animation: beam-up 9s ease-in forwards; }
.is-abducting .moo { animation: moo 9s linear forwards; }

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

@keyframes beam-up {
  0%, 30% { translate: 0 0; scale: 1; rotate: 0deg; opacity: 1; }
  34% { translate: 0 -6px; rotate: -6deg; }
  38% { translate: 0 0; rotate: 6deg; }
  62% { translate: -20px -190px; scale: 0.25; rotate: 25deg; opacity: 1; }
  66%, 100% { translate: -20px -200px; scale: 0.1; opacity: 0; }
}

@keyframes moo {
  0%, 29% { opacity: 0; }
  31%, 44% { opacity: 1; }
  48%, 100% { opacity: 0; }
}
`;
const SHOW_LENGTH_MS = 9000;

/* Two Roblox-style cows graze in the bottom corners. Two minutes after the page
   loads, a UFO shows up and beams the right one aboard. (?ufo in the URL: after 3 s) */
export default function CowAbduction() {
  const [phase, setPhase] = useState<"idle" | "abducting" | "gone">("idle");

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const soon = new URLSearchParams(window.location.search).has("ufo");
    const start = window.setTimeout(() => setPhase("abducting"), soon ? 3000 : ABDUCT_AFTER_MS);
    return () => window.clearTimeout(start);
  }, []);

  useEffect(() => {
    if (phase !== "abducting") return;
    const end = window.setTimeout(() => setPhase("gone"), SHOW_LENGTH_MS);
    return () => window.clearTimeout(end);
  }, [phase]);

  return (
    <div
      className={"cow-scene is-" + phase}
      aria-hidden="true"
      // the layer itself is positioned inline too: worst case it is invisible, never in the way
      style={{ position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}
    >
      <style>{CSS}</style>
      <span className="cow cow-left">
        <Snap3D icon="prop:cow" alt="" size={120} />
      </span>
      {phase !== "gone" ? (
        <span className="cow cow-right">
          <Snap3D icon="prop:cow" alt="" size={120} />
          <span className="moo">MOO?!</span>
        </span>
      ) : null}
      {/* rendered (invisible) from the start, so the saucer is drawn before it's needed */}
      {phase !== "gone" ? (
        <span className="ufo">
          <span className="beam" />
          <Snap3D icon="prop:ufo" alt="" size={150} />
        </span>
      ) : null}
    </div>
  );
}
