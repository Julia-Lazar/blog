"use client";

import { useEffect, useMemo, useState } from "react";
import {
  HAIRS,
  ITEM,
  ITEMS,
  PROPS,
  SENSEI_LINES,
  SLOTS,
  TIERS,
  avatarSpec,
  type Profile,
  type SlotId,
} from "@/../lib/catalog";
import Avatar3D from "./three/Avatar3D";
import Snap3D from "./three/Snap3D";
import Pic, { PIC_EXTRAS, picLabel } from "./Pic";

const newId = (p: string) => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

const ICONS = [...PIC_EXTRAS, ...PROPS.map((p) => "prop:" + p), ...ITEMS.map((it) => "item:" + it.id)];

function IconPicker({ value, onPick, label }: { value: string; onPick: (icon: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        className="icon-btn"
        aria-label={`Change picture for ${label}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Pic icon={value} size={38} />
      </button>
      {open ? (
        <div className="icon-picker" role="listbox" aria-label={`Pictures for ${label}`} style={{ position: "relative", zIndex: 5, width: "min(560px, 80vw)" }}>
          {ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              role="option"
              aria-selected={ic === value}
              title={ic.startsWith("item:") ? ITEM[ic.slice(5)]?.n : picLabel(ic)}
              onClick={() => {
                onPick(ic);
                setOpen(false);
              }}
            >
              <Pic icon={ic} alt={picLabel(ic)} size={48} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface SaveFile {
  app?: string;
  state?: { equip?: Record<string, string>; look?: { hair?: string }; inv?: Record<string, number> };
  img?: { sensei?: Array<{ c?: string; src?: string }> };
}

export default function AdminPanel() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [local, setLocal] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [slot, setSlot] = useState<SlotId>("head");
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [save, setSave] = useState<SaveFile | null>(null);
  const [importPics, setImportPics] = useState(true);
  const [importGear, setImportGear] = useState(false);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.profile);
        setLocal(d.local);
      })
      .catch(() => setMsg({ ok: false, text: "Couldn't load the profile." }));
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const spec = useMemo(() => (profile ? avatarSpec(profile) : null), [profile]);

  if (!profile || !spec) {
    return <section className="panel">{msg ? msg.text : "Loading the character…"}</section>;
  }

  const edit = (fn: (p: Profile) => Profile) => {
    setProfile((p) => (p ? fn(p) : p));
    setDirty(true);
    setMsg(null);
  };

  const saveAll = async () => {
    setBusy("Saving…");
    try {
      const r = await fetch("/api/admin", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setProfile(d.profile);
      setDirty(false);
      setMsg({ ok: true, text: "Saved to content/profile.json. Commit and push it to update the live blog." });
    } catch (e) {
      setMsg({ ok: false, text: "Not saved: " + (e as Error).message });
    }
    setBusy("");
  };

  const uploadCertificate = (file: File, done: (path: string) => void) => {
    if (file.size > 15 * 1024 * 1024) {
      setMsg({ ok: false, text: "That file is bigger than 15 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      setBusy("Uploading the certificate…");
      try {
        const r = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "certificate", name: file.name, src: reader.result }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        done(d.file);
        setMsg({ ok: true, text: "File attached. Press Save to keep it on the certificate." });
      } catch (e) {
        setMsg({ ok: false, text: "Upload failed: " + (e as Error).message });
      }
      setBusy("");
    };
    reader.readAsDataURL(file);
  };

  // the home page shows certificates in this order
  const moveCert = (i: number, by: -1 | 1) =>
    edit((p) => {
      const list = [...p.certificates];
      const j = i + by;
      if (j < 0 || j >= list.length) return p;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...p, certificates: list };
    });

  const toggleItem = (id: string) =>
    edit((p) => {
      const s = ITEM[id].s;
      const equip = { ...p.equip };
      if (equip[s] === id) delete equip[s];
      else equip[s] = id;
      return { ...p, equip };
    });

  const readSave = async (file: File) => {
    try {
      const d = JSON.parse(await file.text()) as SaveFile;
      if (d.app !== "qa-quest" || !d.state) throw new Error("This doesn't look like a QA Quest save file.");
      setSave(d);
      setMsg(null);
    } catch (e) {
      setSave(null);
      setMsg({ ok: false, text: (e as Error).message });
    }
  };

  const savePics = (save?.img?.sensei || []).filter(
    (p) => p.c && p.src && SENSEI_LINES.some((l) => l.c === p.c) && /^data:image\//.test(p.src),
  );

  const runImport = async () => {
    if (!save) return;
    let next = profile;
    let added = 0;
    let failed = 0;
    if (importPics) {
      for (let i = 0; i < savePics.length; i++) {
        setBusy(`Importing picture ${i + 1} of ${savePics.length}…`);
        try {
          const r = await fetch("/api/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ c: savePics[i].c, src: savePics[i].src }),
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          if (d.added) added++;
          next = { ...next, sensei: d.profile.sensei };
        } catch {
          failed++;
        }
      }
    }
    if (importGear && save.state) {
      const st = save.state;
      const equip: Profile["equip"] = {};
      for (const s of SLOTS) {
        const id = st.equip?.[s.id];
        if (id && ITEM[id]) equip[s.id] = id;
      }
      next = {
        ...next,
        equip,
        hair: st.look?.hair || next.hair,
        owned: Object.keys(st.inv || {}).filter((id) => ITEM[id]),
      };
      setDirty(true);
    }
    setProfile(next);
    setBusy("");
    setMsg({
      ok: failed === 0,
      text:
        (importPics ? `${added} new sensei picture${added === 1 ? "" : "s"} imported${failed ? `, ${failed} failed` : ""}. ` : "") +
        (importGear ? "Gear and hair copied from the save: press Save to keep them." : ""),
    });
  };

  const items = ITEMS.filter((it) => it.s === slot && (!ownedOnly || profile.owned.includes(it.id)));

  return (
    <div className="admin-grid">
      <aside className="admin-sticky">
        <section className="panel" aria-label="Preview">
          <div className="char-stage" style={{ aspectRatio: "4 / 5" }}>
            <Avatar3D podium spec={spec} label="Character preview" seq={[["idle", 2.2, 2.2], ["wave", 1.4, 0.7]]} />
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            <label className="field">
              Name
              <input className="inp" value={profile.name} onChange={(e) => edit((p) => ({ ...p, name: e.target.value }))} />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 8 }}>
              <label className="field">
                Level
                <input
                  className="inp"
                  type="number"
                  min={1}
                  value={profile.level}
                  onChange={(e) => edit((p) => ({ ...p, level: Number(e.target.value) }))}
                />
              </label>
              <label className="field">
                Rank
                <input className="inp" value={profile.rank} onChange={(e) => edit((p) => ({ ...p, rank: e.target.value }))} />
              </label>
            </div>
            <div className="field">
              Hair
              <div className="hair-row" role="group" aria-label="Hair colour">
                {HAIRS.map(([c, n]) => (
                  <button
                    key={c}
                    type="button"
                    className="hair"
                    style={{ background: c }}
                    title={n}
                    aria-label={n}
                    aria-pressed={profile.hair.toLowerCase() === c.toLowerCase()}
                    onClick={() => edit((p) => ({ ...p, hair: c }))}
                  />
                ))}
              </div>
            </div>
            <button type="button" className="btn primary" disabled={!local || !dirty || !!busy} onClick={saveAll}>
              {busy || (dirty ? "Save changes" : "All saved")}
            </button>
            {msg ? <p className={"notice" + (msg.ok ? " ok" : "")}>{msg.text}</p> : null}
            {!local ? (
              <p className="notice">Read-only here. Run the blog locally (npm run dev) and open /admin to edit.</p>
            ) : null}
          </div>
        </section>
      </aside>

      <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
        <section className="panel" aria-label="Gear">
          <div className="panel-head">
            <h2>
              <Snap3D icon="item:hl1" alt="" size={36} /> Gear
            </h2>
            <label className="chip" style={{ cursor: "pointer" }}>
              <input type="checkbox" checked={ownedOnly} onChange={(e) => setOwnedOnly(e.target.checked)} /> Only what I own in QA Quest
            </label>
          </div>
          <div className="slot-tabs" role="tablist" aria-label="Slots">
            {SLOTS.map((s) => {
              const on = profile.equip[s.id];
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={slot === s.id}
                  className="pill-btn"
                  onClick={() => setSlot(s.id)}
                >
                  {s.n}
                  {on ? " ✓" : ""}
                </button>
              );
            })}
          </div>
          <p className="muted" style={{ margin: "0 0 10px", fontSize: 14 }}>
            Click to put an item on, click it again to take it off.
          </p>
          <div className="gear-grid">
            {items.map((it) => {
              const on = profile.equip[slot] === it.id;
              return (
                <button key={it.id} type="button" className={"gear" + (on ? " on" : "")} aria-pressed={on} onClick={() => toggleItem(it.id)} title={it.fx}>
                  <Snap3D icon={"item:" + it.id} alt="" size={56} />
                  <span style={{ minWidth: 0 }}>
                    <span className="tier">{TIERS[it.t]?.n}</span>
                    <b>{it.n}</b>
                    <small>{it.fx}</small>
                    {profile.owned.includes(it.id) ? null : <small style={{ color: "var(--peach)" }}>not unlocked in QA Quest</small>}
                  </span>
                </button>
              );
            })}
            {items.length === 0 ? <p className="empty-note">Nothing owned in this slot yet.</p> : null}
          </div>
        </section>

        <section className="panel" aria-label="Skills">
          <div className="panel-head">
            <h2>
              <Snap3D icon="item:w7" alt="" size={36} /> Skills
            </h2>
            <button
              type="button"
              className="btn sm"
              onClick={() => edit((p) => ({ ...p, skills: [...p.skills, { id: newId("skill"), name: "New skill", pct: 30, icon: "prop:ノート" }] }))}
            >
              + Add skill
            </button>
          </div>
          {profile.skills.map((s, i) => (
            <div key={s.id} style={{ borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
            <div className="edit-row" style={{ borderBottom: 0 }}>
              <IconPicker
                value={s.icon}
                label={s.name}
                onPick={(icon) => edit((p) => ({ ...p, skills: p.skills.map((x, j) => (j === i ? { ...x, icon } : x)) }))}
              />
              <input
                className="inp"
                aria-label="Skill name"
                value={s.name}
                onChange={(e) => edit((p) => ({ ...p, skills: p.skills.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) }))}
              />
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={s.pct}
                  aria-label={`${s.name} percent`}
                  style={{ flex: 1, minWidth: 0, accentColor: "var(--neon)" }}
                  onChange={(e) => edit((p) => ({ ...p, skills: p.skills.map((x, j) => (j === i ? { ...x, pct: Number(e.target.value) } : x)) }))}
                />
                <span style={{ width: 40, textAlign: "right" }}>{s.pct}%</span>
              </label>
              <button type="button" className="btn sm danger" aria-label={`Remove ${s.name}`} onClick={() => edit((p) => ({ ...p, skills: p.skills.filter((_, j) => j !== i) }))}>
                ✕
              </button>
            </div>
            <textarea
              className="inp"
              aria-label={`What I can do with ${s.name}`}
              placeholder="Shown when someone hovers this skill: what I know and how I used it (optional)"
              rows={2}
              value={s.about || ""}
              style={{ marginLeft: 52, width: "calc(100% - 52px)", resize: "vertical", fontWeight: 600 }}
              onChange={(e) => edit((p) => ({ ...p, skills: p.skills.map((x, j) => (j === i ? { ...x, about: e.target.value } : x)) }))}
            />
            </div>
          ))}
        </section>

        <section className="panel" aria-label="Certificates">
          <div className="panel-head">
            <h2>
              <Snap3D icon="item:rq2" alt="" size={36} /> Certificates
            </h2>
            <button
              type="button"
              className="btn sm"
              onClick={() => edit((p) => ({ ...p, certificates: [...p.certificates, { id: newId("cert"), name: "New certificate", icon: "prop:てがみ" }] }))}
            >
              + Add certificate
            </button>
          </div>
          {profile.certificates.length === 0 ? <p className="empty-note">No certificates yet.</p> : null}
          {profile.certificates.map((c, i) => {
            const set = (patch: Partial<typeof c>) =>
              edit((p) => ({ ...p, certificates: p.certificates.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
            return (
              <div key={c.id} style={{ display: "grid", gap: 8, padding: "8px 0", borderBottom: "1px dashed var(--line)" }}>
                <div className="edit-row" style={{ borderBottom: 0, padding: 0 }}>
                  <IconPicker value={c.icon} label={c.name} onPick={(icon) => set({ icon })} />
                  <input className="inp" aria-label="Certificate name" value={c.name} onChange={(e) => set({ name: e.target.value })} />
                  <input className="inp" aria-label="Issuer" placeholder="Issuer (e.g. ISTQB)" value={c.issuer || ""} onChange={(e) => set({ issuer: e.target.value })} />
                  <span style={{ display: "flex", gap: 4 }}>
                    <button type="button" className="btn sm" aria-label={`Move ${c.name} up`} disabled={i === 0} onClick={() => moveCert(i, -1)}>
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      aria-label={`Move ${c.name} down`}
                      disabled={i === profile.certificates.length - 1}
                      onClick={() => moveCert(i, 1)}
                    >
                      ↓
                    </button>
                    <button type="button" className="btn sm danger" aria-label={`Remove ${c.name}`} onClick={() => edit((p) => ({ ...p, certificates: p.certificates.filter((_, j) => j !== i) }))}>
                      ✕
                    </button>
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "140px minmax(0, 1fr)", gap: 8, paddingLeft: 52 }}>
                  <input className="inp" aria-label="Date" placeholder="Date (2026-10)" value={c.date || ""} onChange={(e) => set({ date: e.target.value })} />
                  <input className="inp" aria-label="Link" placeholder="https://… (optional)" value={c.url || ""} onChange={(e) => set({ url: e.target.value })} />
                </div>
                <div className="control-row" style={{ paddingLeft: 52 }}>
                  <label className="btn sm" style={{ cursor: local ? "pointer" : "not-allowed" }}>
                    {c.file ? "Replace file" : "Attach file (PDF / image)"}
                    <input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/webp"
                      style={{ display: "none" }}
                      disabled={!local || !!busy}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadCertificate(f, (file) => set({ file }));
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {c.file ? (
                    <>
                      <a className="chip neon" href={c.file} target="_blank" rel="noreferrer">
                        {c.file.split("/").pop()}
                      </a>
                      <button type="button" className="btn sm danger" onClick={() => set({ file: undefined })}>
                        Remove file
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </section>

        <section className="panel" aria-label="Interests">
          <div className="panel-head">
            <h2>
              <Snap3D icon="prop:ゲーム" alt="" size={36} /> Interests
            </h2>
            <button
              type="button"
              className="btn sm"
              onClick={() => edit((p) => ({ ...p, interests: [...p.interests, { id: newId("int"), name: "New interest", icon: "prop:はな" }] }))}
            >
              + Add interest
            </button>
          </div>
          {profile.interests.map((it, i) => (
            <div key={it.id} className="edit-row" style={{ gridTemplateColumns: "44px minmax(0, 1fr) auto" }}>
              <IconPicker
                value={it.icon}
                label={it.name}
                onPick={(icon) => edit((p) => ({ ...p, interests: p.interests.map((x, j) => (j === i ? { ...x, icon } : x)) }))}
              />
              <input
                className="inp"
                aria-label="Interest"
                value={it.name}
                onChange={(e) => edit((p) => ({ ...p, interests: p.interests.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) }))}
              />
              <button type="button" className="btn sm danger" aria-label={`Remove ${it.name}`} onClick={() => edit((p) => ({ ...p, interests: p.interests.filter((_, j) => j !== i) }))}>
                ✕
              </button>
            </div>
          ))}
        </section>

        <section className="panel" aria-label="Import from QA Quest">
          <div className="panel-head">
            <h2>
              <Snap3D icon="sensei:happy" alt="" size={36} /> Import from a QA Quest save
            </h2>
          </div>
          <p className="muted" style={{ marginTop: 0, fontSize: 14 }}>
            In QA Quest: Save &amp; Style → download the save (qa-quest-save-….json), then pick it here. The sensei pictures you
            added there show up next to their quotes in “Sensei says”.
          </p>
          <div className="control-row">
            <label className="btn" style={{ cursor: "pointer" }}>
              Choose save file
              <input
                type="file"
                accept="application/json,.json"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) readSave(f);
                  e.target.value = "";
                }}
              />
            </label>
            {save ? (
              <span className="chip neon">
                {savePics.length} sensei picture{savePics.length === 1 ? "" : "s"} · {Object.keys(save.state?.equip || {}).length} worn items
              </span>
            ) : null}
          </div>
          {save ? (
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              <label style={{ fontWeight: 700 }}>
                <input type="checkbox" checked={importPics} onChange={(e) => setImportPics(e.target.checked)} /> Sensei pictures (avatars)
              </label>
              <label style={{ fontWeight: 700 }}>
                <input type="checkbox" checked={importGear} onChange={(e) => setImportGear(e.target.checked)} /> Gear, hair and unlocked items (replaces what&apos;s worn now)
              </label>
              <button type="button" className="btn primary" style={{ justifySelf: "start" }} disabled={!local || !!busy || (!importPics && !importGear)} onClick={runImport}>
                {busy || "Import"}
              </button>
            </div>
          ) : null}

          <h3 style={{ font: "600 17px var(--f-display)", margin: "18px 0 10px" }}>Sensei pictures ({profile.sensei.length})</h3>
          {profile.sensei.length === 0 ? (
            <p className="empty-note">None yet: quotes use the 3D sensei until you import some.</p>
          ) : (
            <div className="gallery">
              {profile.sensei.map((p) => (
                <figure key={p.src}>
                  {/* local files in /public/sensei */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.c} />
                  <figcaption>{p.c}</figcaption>
                  <button
                    type="button"
                    className="btn sm danger"
                    aria-label={`Remove picture of ${p.c}`}
                    onClick={() => edit((x) => ({ ...x, sensei: x.sensei.filter((s) => s.src !== p.src) }))}
                  >
                    ✕
                  </button>
                </figure>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
