"use client";

import { useEffect, useState } from "react";
import Snap3D from "./three/Snap3D";

export interface Frame {
  icon: string;
  ms: number;
}

/** A flip-book of 3D renders: all frames are drawn once, then shown one after another. */
export default function FrameAnim({
  frames,
  spec,
  size,
}: {
  frames: Frame[];
  spec?: Record<string, unknown>;
  size: number;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setI((n) => (n + 1) % frames.length), frames[i].ms);
    return () => window.clearTimeout(t);
  }, [i, frames]);

  // one render per distinct frame, stacked; only the current one is visible
  const icons = [...new Set(frames.map((f) => f.icon))];
  return (
    <span className="frame-anim" style={{ width: size, height: size }} aria-hidden="true">
      {icons.map((icon) => (
        <Snap3D
          key={icon}
          icon={icon}
          spec={spec}
          alt=""
          size={size}
          className={icon === frames[i].icon ? "is-on" : ""}
        />
      ))}
    </span>
  );
}
