"use client";

import { useEffect, useState } from "react";

/* The Roblox-style 3D engine shared with QA Quest / Nihongo Quest lives in
   public/vendor (three.js r128 + qa3d.js). It is loaded lazily, once, in the browser. */

type Spec = Record<string, unknown>;

export interface AnimDef {
  vh?: number;
  cy?: number;
  gap?: number;
  podium?: boolean;
  pitch?: number;
  actors: Array<{
    spec: Spec;
    yaw?: number;
    mirror?: boolean;
    offset?: number;
    seq: Array<[string, number, number?]>;
    keepWeapon?: boolean;
  }>;
}

export interface QA3DApi {
  ok: boolean;
  props: string[];
  snap: (spec: Spec, view: string, yaw?: number) => string;
  mountAnim: (el: HTMLElement, def: AnimDef) => unknown;
}

declare global {
  interface Window {
    QA3D?: QA3DApi;
  }
}

let loading: Promise<QA3DApi | null> | null = null;

function addScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

export function loadQA3D(): Promise<QA3DApi | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.QA3D) return Promise.resolve(window.QA3D.ok ? window.QA3D : null);
  if (!loading) {
    loading = addScript("/vendor/three-r128.min.js")
      .then(() => addScript("/vendor/qa3d.js?v=16"))
      .then(() => (window.QA3D && window.QA3D.ok ? window.QA3D : null))
      .catch(() => null);
  }
  return loading;
}

export function useQA3D() {
  const [api, setApi] = useState<QA3DApi | null>(null);
  useEffect(() => {
    let alive = true;
    loadQA3D().then((a) => {
      if (alive) setApi(a);
    });
    return () => {
      alive = false;
    };
  }, []);
  return api;
}

/* Snapshots (PNG data URLs) are rendered one by one with a small time budget per
   frame so a grid of 3D icons doesn't freeze the page. */
const cache = new Map<string, string>();
const waiting = new Map<string, Array<(url: string) => void>>();
const queue: Array<{ key: string; spec: Spec; view: string }> = [];
let raf = 0;

function flush(api: QA3DApi) {
  raf = 0;
  const t0 = performance.now();
  while (queue.length && performance.now() - t0 < 40) {
    const job = queue.shift()!;
    let url = "";
    try {
      url = api.snap(job.spec, job.view);
    } catch {
      url = "";
    }
    cache.set(job.key, url);
    (waiting.get(job.key) || []).forEach((cb) => cb(url));
    waiting.delete(job.key);
  }
  if (queue.length) raf = requestAnimationFrame(() => flush(api));
}

export function requestSnap(
  api: QA3DApi,
  key: string,
  spec: Spec,
  view: string,
  cb: (url: string) => void,
) {
  const hit = cache.get(key);
  if (hit !== undefined) {
    cb(hit);
    return () => {};
  }
  const list = waiting.get(key);
  if (list) list.push(cb);
  else {
    waiting.set(key, [cb]);
    queue.push({ key, spec, view });
  }
  if (!raf) raf = requestAnimationFrame(() => flush(api));
  return () => {
    const l = waiting.get(key);
    if (l) waiting.set(key, l.filter((f) => f !== cb));
  };
}
