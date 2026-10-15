"use client";

import { useEffect, useRef } from "react";
import { useQA3D } from "./qa3d";

interface LivePropProps {
  name: string;
  /** seconds: lets two copies move out of step */
  offset?: number;
  /** spin around its own axis (the cow being beamed up) */
  spin?: boolean;
  /** radians per second while spinning */
  spinSpeed?: number;
  /** swap to another model without remounting (the cow turning into a mooshroom) */
  variant?: string;
  className?: string;
}

/** A 3D prop rendered live in its own canvas (instead of a still Snap3D picture). */
export default function LiveProp({ name, offset, spin = false, spinSpeed, variant, className }: LivePropProps) {
  const api = useQA3D();
  const host = useRef<HTMLSpanElement>(null);
  const handle = useRef<{ setSpin: (on: boolean, speed?: number) => void; setProp: (name: string) => void } | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!api || !el) return;
    // a fresh stage each time: the engine stops and disposes it once it leaves the DOM
    const stage = document.createElement("span");
    stage.style.cssText = "position:absolute;inset:0;display:block";
    el.appendChild(stage);
    handle.current = api.mountProp(stage, name, { offset });
    return () => {
      stage.remove();
      handle.current = null;
    };
  }, [api, name, offset]);

  useEffect(() => {
    handle.current?.setSpin(spin, spinSpeed);
  }, [spin, spinSpeed, api]);

  useEffect(() => {
    if (variant) handle.current?.setProp(variant);
  }, [variant, api]);

  return <span ref={host} className={className} style={{ position: "absolute", inset: 0, display: "block" }} aria-hidden="true" />;
}
