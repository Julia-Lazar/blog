import type { Profile } from "@/../lib/catalog";
import Snap3D from "./three/Snap3D";
import Pic from "./Pic";

/** Certificates and interests, both edited in the admin panel. */
export default function ProfileTiles({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="panel" aria-label="Certificates">
        <div className="panel-head">
          <h2>
            <Snap3D icon="item:rq2" alt="" size={36} /> Certificates
          </h2>
          <span className="label">{profile.certificates.length}</span>
        </div>
        {profile.certificates.length ? (
          <div className="tiles">
            {profile.certificates.map((c) => {
              const body = (
                <>
                  <Pic icon={c.icon} size={40} />
                  <span style={{ minWidth: 0 }}>
                    {c.name}
                    {c.issuer || c.date ? <small>{[c.issuer, c.date].filter(Boolean).join(" · ")}</small> : null}
                  </span>
                </>
              );
              const href = c.url || c.file;
              return href ? (
                <a key={c.id} className="tile" href={href} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>
                  {body}
                </a>
              ) : (
                <div key={c.id} className="tile">
                  {body}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-note">Slot unlocked, loot pending. The first certificate is somewhere in the next dungeon.</p>
        )}
      </section>

      <section className="panel" aria-label="Interests">
        <div className="panel-head">
          <h2>
            <Snap3D icon="prop:ゲーム" alt="" size={36} /> Side quests
          </h2>
          <span className="label">interests</span>
        </div>
        <div className="tiles">
          {profile.interests.map((it) => (
            <div key={it.id} className="tile">
              <Pic icon={it.icon} size={40} />
              <span style={{ minWidth: 0 }}>
                {it.name}
                {it.extra?.length ? (
                  <span className="tile-extra">
                    {it.extra.map((x) => (
                      <Pic key={x} icon={x} size={30} />
                    ))}
                  </span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
