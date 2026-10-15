"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Certificate } from "@/../lib/catalog";
import Pic from "./Pic";

/* pdf.js (public/vendor/pdfjs) draws the first page of a PDF certificate as its thumbnail. */
interface PdfJs {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: string) => {
    promise: Promise<{
      getPage: (n: number) => Promise<{
        getViewport: (o: { scale: number }) => { width: number; height: number };
        render: (o: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> };
      }>;
    }>;
  };
}

declare global {
  interface Window {
    pdfjsLib?: PdfJs;
  }
}

let pdfLoading: Promise<PdfJs | null> | null = null;

function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!pdfLoading) {
    pdfLoading = new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "/vendor/pdfjs/pdf.min.js";
      s.onload = () => {
        const lib = window.pdfjsLib ?? null;
        if (lib) lib.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.js";
        resolve(lib);
      };
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  }
  return pdfLoading;
}

const thumbs = new Map<string, Promise<string>>();

function pdfThumb(file: string, width: number) {
  const key = file + "|" + width;
  if (!thumbs.has(key)) {
    thumbs.set(
      key,
      loadPdfJs().then(async (lib) => {
        if (!lib) return "";
        const doc = await lib.getDocument(file).promise;
        const page = await doc.getPage(1);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: (width * 2) / base.width });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
        return canvas.toDataURL("image/png");
      }).catch(() => ""),
    );
  }
  return thumbs.get(key)!;
}

const isPdf = (f: string) => /\.pdf$/i.test(f);

function Thumb({ cert }: { cert: Certificate }) {
  const [src, setSrc] = useState("");
  const file = cert.file;

  useEffect(() => {
    if (!file || !isPdf(file)) return;
    let alive = true;
    pdfThumb(file, 96).then((url) => alive && setSrc(url));
    return () => {
      alive = false;
    };
  }, [file]);

  if (file && !isPdf(file)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="cert-thumb" src={file} alt="" />;
  }
  if (file && src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="cert-thumb" src={src} alt="" />;
  }
  if (file) return <span className="cert-thumb is-loading" />;
  return <Pic icon={cert.icon} size={56} />;
}

/** "2026-7" / "2026-07" / "2026-07-15" -> "July 2026"; anything else stays as written. */
export function formatCertDate(date?: string) {
  const m = /^(\d{4})-(\d{1,2})/.exec(date ?? "");
  if (!m) return date ?? "";
  return new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

const CSS = `
.cert-tile {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: var(--sunk);
  color: var(--ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}
.cert-tile:hover { transform: translateY(-2px); border-color: var(--neon); }
.cert-tile:hover .cert-name { text-decoration: underline; text-underline-offset: 3px; }
.cert-name { display: block; font-weight: 800; font-size: 15px; }
.cert-sub { display: block; margin-top: 2px; color: var(--muted); font-weight: 600; font-size: 13px; }
.cert-thumb {
  display: block;
  width: 72px;
  height: 52px;
  object-fit: cover;
  object-position: top;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: #fff;
}
.cert-thumb.is-loading { background: var(--neon-soft); }
.cert-modal {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(1, 6, 20, 0.82);
}
.cert-dialog {
  width: min(960px, 100%);
  max-height: calc(100vh - 32px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  border: 2px solid var(--neon);
  background: var(--surface);
  box-shadow: 0 0 40px -8px var(--glow);
}
.cert-dialog header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.cert-dialog h3 { margin: 0; font: 400 13px/1.6 var(--f-pixel); text-transform: uppercase; }
.cert-dialog iframe { width: 100%; height: min(78vh, 900px); border: 0; border-radius: 10px; background: #fff; }
.cert-dialog img { width: 100%; max-height: 78vh; object-fit: contain; border-radius: 10px; background: #fff; }
`;

/** Certificates on the home page: a small preview, click for the full certificate. */
export default function CertificateTiles({ certificates }: { certificates: Certificate[] }) {
  const [open, setOpen] = useState<Certificate | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <style>{CSS}</style>
      <div className="tiles" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
        {certificates.map((c) => {
          const sub = [c.issuer, formatCertDate(c.date)].filter(Boolean).join(" · ");
          const body = (
            <>
              <Thumb cert={c} />
              <span style={{ minWidth: 0 }}>
                <span className="cert-name">{c.name}</span>
                {sub ? <span className="cert-sub">{sub}</span> : null}
              </span>
            </>
          );
          if (c.file) {
            return (
              <button key={c.id} type="button" className="cert-tile" onClick={() => setOpen(c)} aria-haspopup="dialog">
                {body}
              </button>
            );
          }
          return c.url ? (
            <a key={c.id} className="cert-tile" href={c.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              {body}
            </a>
          ) : (
            <div key={c.id} className="cert-tile" style={{ cursor: "default" }}>
              {body}
            </div>
          );
        })}
      </div>

      {/* rendered into <body>: the panels animate with transforms, which would trap a fixed overlay */}
      {open?.file
        ? createPortal(
        <div className="cert-modal" role="dialog" aria-modal="true" aria-label={open.name} onClick={() => setOpen(null)}>
          <div className="cert-dialog" onClick={(e) => e.stopPropagation()}>
            <header>
              <h3>{open.name}</h3>
              <span className="control-row" style={{ gap: 8 }}>
                {open.url ? (
                  <a className="btn sm" href={open.url} target="_blank" rel="noreferrer">
                    Verify
                  </a>
                ) : null}
                <a className="btn sm" href={open.file} target="_blank" rel="noreferrer">
                  Open file
                </a>
                <button type="button" className="btn sm danger" onClick={() => setOpen(null)} aria-label="Close">
                  ✕
                </button>
              </span>
            </header>
            {isPdf(open.file) ? (
              <iframe src={open.file} title={open.name} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={open.file} alt={open.name} />
            )}
          </div>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}
