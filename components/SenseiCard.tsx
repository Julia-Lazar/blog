"use client";

import { useSyncExternalStore } from "react";
import { SENSEI_LINES, SERIES, quoteIndex, type SenseiImage } from "@/../lib/catalog";
import Snap3D from "./three/Snap3D";

// re-check once a minute, so a new quote shows up when the half hour turns
const everyMinute = (onChange: () => void) => {
  const t = window.setInterval(onChange, 60000);
  return () => window.clearInterval(t);
};

/** "Sensei says": a QA Quest quote that changes every half hour, with that character's picture if one was imported. */
export default function SenseiCard({ images }: { images: SenseiImage[] }) {
  // based on the visitor's local clock, so it is only known in the browser
  const idx = useSyncExternalStore(
    everyMinute,
    () => quoteIndex(SENSEI_LINES.length),
    () => null,
  );

  const line = idx === null ? null : SENSEI_LINES[idx];
  const pics = line ? images.filter((p) => p.c === line.c) : [];
  // several pictures of the same character take turns too
  const pic = pics.length ? pics[(idx ?? 0) % pics.length] : null;

  return (
    <section className="panel" aria-label="Sensei says">
      <div className="panel-head">
        <h2>
          <Snap3D icon="sensei:happy" alt="" size={36} /> Sensei says
        </h2>
      </div>
      {line ? (
        <div className="sensei">
          <div className="sensei-img">
            {pic ? (
              // imported pictures live in /public/sensei
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pic.src} alt={line.c} />
            ) : (
              <Snap3D icon="sensei:calm" alt={line.c} size={92} />
            )}
          </div>
          <div>
            <q>{line.t}</q>
            <span className="who">
              {line.c.toUpperCase()} · {SERIES[line.s]?.n ?? ""}
            </span>
          </div>
        </div>
      ) : (
        <div className="sensei" style={{ minHeight: 96 }} />
      )}
    </section>
  );
}
