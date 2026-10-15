import { avatarSpec, type Profile, type Skill } from "@/../lib/catalog";
import Snap3D from "./three/Snap3D";
import Pic from "./Pic";

/* Skills with a description show it in a little window on hover (or keyboard focus). */
const CSS = `
.skill { position: relative; }
.skill.has-about { cursor: help; border-radius: 10px; }
.skill.has-about .skill-name { text-decoration: underline dotted rgba(57, 255, 20, 0.6); text-underline-offset: 4px; }
.skill-tip {
  position: absolute;
  left: 40px;
  right: 0;
  bottom: calc(100% + 8px);
  z-index: 20;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--neon);
  background: #0a1838;
  box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.8), 0 0 18px -6px var(--glow);
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
  white-space: pre-line; /* keeps the line breaks (lists) from the description */
  opacity: 0;
  visibility: hidden;
  translate: 0 6px;
  transition: opacity 0.18s, translate 0.18s, visibility 0.18s;
  pointer-events: none;
}
.skill-tip::after {
  content: "";
  position: absolute;
  left: 18px;
  bottom: -7px;
  width: 12px;
  height: 12px;
  background: #0a1838;
  border-right: 1px solid var(--neon);
  border-bottom: 1px solid var(--neon);
  rotate: 45deg;
}
.skill-tip code {
  font: 600 12.5px/1.4 var(--f-mono);
  color: var(--neon);
  background: rgba(57, 255, 20, 0.1);
  border: 1px solid rgba(57, 255, 20, 0.25);
  border-radius: 5px;
  padding: 1px 5px;
  white-space: nowrap;
}
.skill:hover .skill-tip,
.skill:focus-visible .skill-tip { opacity: 1; visibility: visible; translate: 0 0; }
`;

/** `words in backticks` in a description become inline code, like in Markdown. */
function withCode(text: string) {
  return text.split(/(`[^`\n]+`)/g).map((part, i) =>
    part.length > 2 && part.startsWith("`") && part.endsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : part,
  );
}

function SkillRow({ skill, spec }: { skill: Skill; spec: Record<string, unknown> }) {
  const cls = skill.pct >= 60 ? "lv-high" : skill.pct >= 35 ? "lv-mid" : "lv-low";
  const tipId = skill.about ? `skill-about-${skill.id}` : undefined;
  return (
    <div
      className={"skill " + cls + (skill.about ? " has-about" : "")}
      tabIndex={skill.about ? 0 : undefined}
      aria-describedby={tipId}
    >
      <span style={{ gridRow: "span 2", display: "grid", placeItems: "center" }}>
        <Pic icon={skill.icon} spec={spec} size={36} />
      </span>
      <div className="skill-top">
        <span className="skill-name">{skill.name}</span>
        <span className="pct">{skill.pct}%</span>
      </div>
      <div
        className="sbar"
        role="progressbar"
        aria-label={skill.name}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={skill.pct}
      >
        <i style={{ width: `${skill.pct}%` }} />
      </div>
      {skill.about ? (
        <div className="skill-tip" id={tipId} role="tooltip">
          {withCode(skill.about)}
        </div>
      ) : null}
    </div>
  );
}

/** Strengths (60%+) and the stuff still leveling up, as in QA Quest. */
export default function SkillsPanel({ profile }: { profile: Profile }) {
  const strong = profile.skills.filter((s) => s.pct >= 60).sort((a, b) => b.pct - a.pct);
  const weak = profile.skills.filter((s) => s.pct < 60).sort((a, b) => b.pct - a.pct);
  const spec = avatarSpec(profile);

  return (
    // above the character card, so the description windows can overlap it
    <section className="panel" aria-label="Skills" style={{ zIndex: 2 }}>
      <style>{CSS}</style>
      <div className="skill-group">
        <h3>
          <Snap3D icon="item:h8" alt="" size={30} /> My specialization <span className="label">{strong.length}</span>
        </h3>
        <div className="skills">
          {strong.map((s) => (
            <SkillRow key={s.id} skill={s} spec={spec} />
          ))}
        </div>
      </div>
      <div className="skill-group">
        <h3>
          <Snap3D icon="prop:はな" alt="" size={30} /> Leveling up <span className="label">{weak.length}</span>
        </h3>
        <div className="skills">
          {weak.map((s) => (
            <SkillRow key={s.id} skill={s} spec={spec} />
          ))}
        </div>
      </div>
    </section>
  );
}
