import fs from "fs";
import path from "path";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { getProfile, saveProfile } from "@/../lib/profile";
import { ITEM, SENSEI_LINES, SLOTS, type Profile } from "@/../lib/catalog";

/* The blog has no database: the admin panel edits content/profile.json (and puts
   imported sensei pictures in public/sensei) on your own machine. Commit + push to publish.
   On the deployed site the files are read-only, so every write is refused there. */

export const dynamic = "force-dynamic";

const isLocal = () => process.env.NODE_ENV === "development";

function denied() {
  return NextResponse.json(
    { error: "The admin panel only works locally (npm run dev). Edit, then commit and push." },
    { status: 403 },
  );
}

function clean(input: Profile, current: Profile): Profile {
  const equip: Profile["equip"] = {};
  for (const slot of SLOTS) {
    const id = input.equip?.[slot.id];
    if (id && ITEM[id] && ITEM[id].s === slot.id) equip[slot.id] = id;
  }
  const str = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);
  return {
    name: str(input.name, 40) || current.name,
    level: Math.max(1, Math.min(999, Math.round(Number(input.level) || current.level))),
    rank: str(input.rank, 60) || current.rank,
    hair: /^#[0-9a-f]{6}$/i.test(input.hair) ? input.hair : current.hair,
    equip,
    owned: Array.isArray(input.owned) ? input.owned.filter((id) => ITEM[id]) : current.owned,
    skills: (input.skills || []).map((s) => ({
      id: str(s.id, 40),
      name: str(s.name),
      pct: Math.max(0, Math.min(100, Math.round(Number(s.pct) || 0))),
      icon: str(s.icon, 60),
    })).filter((s) => s.id && s.name),
    certificates: (input.certificates || []).map((c) => ({
      id: str(c.id, 40),
      name: str(c.name),
      issuer: str(c.issuer) || undefined,
      date: str(c.date, 20) || undefined,
      url: /^https?:\/\//.test(str(c.url, 500)) ? str(c.url, 500) : undefined,
      file: /^\/certificates\/[a-z0-9-]+\.(pdf|png|jpg|webp)$/.test(str(c.file, 200)) ? str(c.file, 200) : undefined,
      icon: str(c.icon, 60),
    })).filter((c) => c.id && c.name),
    interests: (input.interests || []).map((i) => ({
      id: str(i.id, 40),
      name: str(i.name),
      icon: str(i.icon, 60),
      extra: Array.isArray(i.extra) && i.extra.length ? i.extra.slice(0, 4).map((x) => str(x, 60)) : undefined,
    })).filter((i) => i.id && i.name),
    // pictures are only added through the import below, never through a plain save
    sensei: (input.sensei || []).filter((p) => current.sensei.some((c) => c.src === p.src)),
  };
}

export async function GET() {
  return NextResponse.json({ profile: getProfile(), local: isLocal() });
}

export async function PUT(req: Request) {
  if (!isLocal()) return denied();
  const current = getProfile();
  const next = clean((await req.json()) as Profile, current);
  // pictures removed in the panel are deleted from disk too
  for (const p of current.sensei) {
    if (!next.sensei.some((n) => n.src === p.src) && p.src.startsWith("/sensei/")) {
      fs.rmSync(path.join(process.cwd(), "public", p.src), { force: true });
    }
  }
  // certificate files nobody points to any more are deleted too
  for (const c of current.certificates) {
    if (c.file && !next.certificates.some((n) => n.file === c.file)) {
      fs.rmSync(path.join(process.cwd(), "public", c.file), { force: true });
    }
  }
  saveProfile(next);
  return NextResponse.json({ profile: next });
}

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };
const CERT_EXT: Record<string, string> = { "application/pdf": "pdf", "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/** Stores an uploaded certificate (PDF or image). The panel then links it from the certificate. */
async function addCertificateFile(body: { name?: string; src?: string }) {
  const m = /^data:(application\/pdf|image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(body.src || ""));
  if (!m) return NextResponse.json({ error: "Only PDF, PNG, JPG or WebP files" }, { status: 400 });
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.length > 15 * 1024 * 1024) return NextResponse.json({ error: "File is bigger than 15 MB" }, { status: 400 });
  const hash = crypto.createHash("sha1").update(bytes).digest("hex").slice(0, 10);
  const slug =
    String(body.name || "certificate")
      .replace(/\.[a-z0-9]+$/i, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "certificate";
  const rel = `/certificates/${slug}-${hash}.${CERT_EXT[m[1]]}`;
  fs.mkdirSync(path.join(process.cwd(), "public", "certificates"), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), "public", rel), bytes);
  return NextResponse.json({ file: rel });
}

/** Adds one sensei picture (a data: URL taken from a QA Quest save file), or a certificate file. */
export async function POST(req: Request) {
  if (!isLocal()) return denied();
  const body = (await req.json()) as { kind?: string; c?: string; src?: string; name?: string };
  if (body.kind === "certificate") return addCertificateFile(body);
  const { c, src } = body;
  if (!c || !SENSEI_LINES.some((l) => l.c === c)) {
    return NextResponse.json({ error: "Unknown sensei: " + c }, { status: 400 });
  }
  const m = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(String(src || ""));
  if (!m) return NextResponse.json({ error: "Not an image data URL" }, { status: 400 });

  const bytes = Buffer.from(m[2], "base64");
  const hash = crypto.createHash("sha1").update(bytes).digest("hex").slice(0, 10);
  const slug = c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const rel = `/sensei/${slug}-${hash}.${EXT[m[1]]}`;
  const dir = path.join(process.cwd(), "public", "sensei");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), "public", rel), bytes);

  const profile = getProfile();
  const added = !profile.sensei.some((p) => p.src === rel);
  if (added) {
    profile.sensei.push({ c, src: rel });
    saveProfile(profile);
  }
  return NextResponse.json({ profile, added });
}
