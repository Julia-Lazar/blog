"use client";

import { useState } from "react";
import { ITEM, SLOTS, avatarSpec, type Profile } from "@/../lib/catalog";
import Avatar3D, { GREETING_SEQ, type PoseSeq } from "./three/Avatar3D";
import Snap3D from "./three/Snap3D";
import { Narutomaki } from "./icons";

const MOVES: Array<{ id: string; label: string; seq: PoseSeq }> = [
  { id: "all", label: "Full routine", seq: GREETING_SEQ },
  { id: "bow", label: "Ojigi (bow)", seq: [["bow", 2.6, 2.6], ["idle", 1, 2.2]] },
  {
    id: "mj",
    label: "Moonwalk",
    seq: [["moonwalk", 3.4], ["spin", 1.2], ["toe", 1.3], ["moonwalkL", 3.4], ["spin", 1.2], ["point", 1.6]],
  },
  { id: "dance", label: "Dance", seq: [["dance", 3.2, 0.8], ["dab", 1.4, 2.8], ["jump", 1.8, 0.9]] },
  { id: "dab", label: "Dab", seq: [["dab", 2.4, 2.4], ["idle", 0.8, 2.2]] },
];

export default function CharacterCard({ profile }: { profile: Profile }) {
  const [move, setMove] = useState(MOVES[0]);
  const spec = avatarSpec(profile);

  return (
    <section className="panel char-card" aria-label="My character">
      <div className="char-top">
        <div className="char-stage">
          <Avatar3D podium spec={spec} seq={move.seq} label={`${profile.name}'s Roblox-style character`} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p className="label">My character</p>
          <h2 className="char-name">{profile.name}</h2>
          <div className="lvl-row">
            <span className="lvl">LVL {profile.level}</span>
            <span className="rank">
              <Narutomaki size={26} />
              {profile.rank}
            </span>
          </div>
          <div className="pose-btns" role="group" aria-label="Pick a move">
            {MOVES.map((m) => (
              <button
                key={m.id}
                type="button"
                className="pill-btn"
                aria-pressed={move.id === m.id}
                onClick={() => setMove(m)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="worn" aria-label="What I'm wearing">
        {SLOTS.map((slot) => {
          const it = ITEM[profile.equip[slot.id] || ""];
          if (!it) return null;
          return (
            <span key={slot.id} className={"wchip t-" + it.t} title={it.fx}>
              <Snap3D icon={"item:" + it.id} alt="" size={26} />
              <span>{it.n}</span>
            </span>
          );
        })}
      </div>
    </section>
  );
}
