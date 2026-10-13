"use client";

import { useEffect, useRef } from "react";
import type { AnimDef } from "./qa3d";
import { useQA3D } from "./qa3d";

export type PoseSeq = Array<[string, number, number?]>;

/** Japanese bow, a wave, then the Michael Jackson routine from Nihongo Quest. */
export const GREETING_SEQ: PoseSeq = [
  ["bow", 2.6, 2.6],
  ["wave", 2.8, 0.7],
  ["idle", 1.4, 2.2],
  ["moonwalk", 3.4],
  ["spin", 1.2],
  ["toe", 1.3],
  ["idle", 1.0, 2.2],
  ["moonwalkL", 3.4],
  ["point", 1.6],
  ["dance", 3.2, 0.8],
  ["dab", 1.4, 2.8],
  ["idle", 2.2, 2.2],
];

interface Avatar3DProps {
  spec: Record<string, unknown>;
  seq?: PoseSeq;
  label: string;
  className?: string;
  vh?: number;
  cy?: number;
  /** a glowing 3D stage under the feet */
  podium?: boolean;
}

/** A live, animated Roblox-style character (three.js, rendered in the browser). */
export default function Avatar3D({ spec, seq = GREETING_SEQ, label, className, vh, cy, podium = false }: Avatar3DProps) {
  const api = useQA3D();
  const host = useRef<HTMLDivElement>(null);
  const key = JSON.stringify([spec, seq, vh, cy, podium]);

  useEffect(() => {
    const el = host.current;
    if (!api || !el) return;
    // a fresh stage per spec: the engine disposes renderers whose element left the DOM
    const stage = document.createElement("div");
    stage.className = "avatar3d-stage";
    el.appendChild(stage);
    const def: AnimDef = { vh, cy, podium, pitch: podium ? 0.15 : undefined, actors: [{ spec, yaw: 0, seq, keepWeapon: true }] };
    api.mountAnim(stage, def);
    return () => {
      stage.remove();
    };
    // key captures spec, seq and framing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, key]);

  return (
    <div ref={host} className={["avatar3d", className].filter(Boolean).join(" ")} role="img" aria-label={label}>
      {!api ? <div className="avatar3d-wait" aria-hidden="true" /> : null}
    </div>
  );
}
