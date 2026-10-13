import { avatarSpec, type Profile, type Skill } from "@/../lib/catalog";
import Snap3D from "./three/Snap3D";
import Pic from "./Pic";

function SkillRow({ skill, spec }: { skill: Skill; spec: Record<string, unknown> }) {
  const cls = skill.pct >= 60 ? "lv-high" : skill.pct >= 35 ? "lv-mid" : "lv-low";
  return (
    <div className={"skill " + cls}>
      <span style={{ gridRow: "span 2", display: "grid", placeItems: "center" }}>
        <Pic icon={skill.icon} spec={spec} size={36} />
      </span>
      <div className="skill-top">
        <span>{skill.name}</span>
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
    </div>
  );
}

/** Strengths (60%+) and the stuff still leveling up, as in QA Quest. */
export default function SkillsPanel({ profile }: { profile: Profile }) {
  const strong = profile.skills.filter((s) => s.pct >= 60).sort((a, b) => b.pct - a.pct);
  const weak = profile.skills.filter((s) => s.pct < 60).sort((a, b) => b.pct - a.pct);
  const spec = avatarSpec(profile);

  return (
    <section className="panel" aria-label="Skills">
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
