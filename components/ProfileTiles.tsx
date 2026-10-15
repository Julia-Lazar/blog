import type { Profile } from "@/../lib/catalog";
import Snap3D from "./three/Snap3D";
import Pic from "./Pic";
import CertificateTiles from "./CertificateTiles";

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
          <CertificateTiles certificates={profile.certificates} />
        ) : (
          <p className="empty-note">Slot unlocked, loot pending. The first certificate is somewhere in the next dungeon.</p>
        )}
      </section>

      <section className="panel" aria-label="Interests">
        <div className="panel-head">
          <h2>
            <span aria-hidden="true" style={{ fontSize: 28, lineHeight: 1 }}>
              🎯
            </span>{" "}
            Side quests
          </h2>
          <span className="label">interests</span>
        </div>
        <div className="tiles" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
          {profile.interests.map((it) => (
            <div key={it.id} className="tile" style={{ padding: "8px 12px" }}>
              <Pic icon={it.icon} size={it.icon === "prop:monopoly-bust" ? 80 : 64} />
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
