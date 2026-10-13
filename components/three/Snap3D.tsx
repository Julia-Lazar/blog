"use client";

import { useEffect, useState } from "react";
import { ITEM } from "@/../lib/catalog";
import { requestSnap, useQA3D } from "./qa3d";

interface Snap3DProps {
  /** "prop:<name>", "item:<gear id>", "sensei:<mood>" or "pose:<name>:<frame>" (needs spec) */
  icon: string;
  alt: string;
  size?: number;
  spec?: Record<string, unknown>;
  className?: string;
}

function resolve(icon: string, spec?: Record<string, unknown>) {
  if (icon.startsWith("item:")) {
    const it = ITEM[icon.slice(5)];
    if (!it) return null;
    return { spec: { hair: "#39FF14", [it.s]: it }, view: "item:" + it.s };
  }
  return { spec: spec || { hair: "#39FF14" }, view: icon };
}

/** A Roblox-style 3D render of a prop, gear item or pose, drawn once and cached as a PNG. */
export default function Snap3D({ icon, alt, size = 48, spec, className }: Snap3DProps) {
  const api = useQA3D();
  const [url, setUrl] = useState("");
  const job = resolve(icon, spec);
  const key = job ? icon + "|" + JSON.stringify(job.spec) : "";

  useEffect(() => {
    if (!api || !job) return;
    return requestSnap(api, key, job.spec, job.view, setUrl);
    // key captures everything job depends on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, key]);

  return (
    <span
      className={["snap3d", url ? "" : "is-loading", className].filter(Boolean).join(" ")}
      style={{ width: size, height: size, position: "relative" }}
    >
      {url ? (
        // data: URLs rendered on the fly; next/image adds nothing here
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          width={size}
          height={size}
          draggable={false}
          // fills the box whatever the render's own ratio (poses are 4:5)
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <span className="sr-only">{alt}</span>
      )}
    </span>
  );
}
