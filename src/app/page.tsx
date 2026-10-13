import { getSortedPostsData } from "@/../lib/posts";
import { getProfile } from "@/../lib/profile";
import { avatarSpec } from "@/../lib/catalog";
import Layout from "@/../components/Layout";
import PostsDirectory from "@/../components/PostsDirectory";
import CharacterCard from "@/../components/CharacterCard";
import SkillsPanel from "@/../components/SkillsPanel";
import SenseiCard from "@/../components/SenseiCard";
import TrainingMontage from "@/../components/TrainingMontage";
import ProfileTiles from "@/../components/ProfileTiles";

export default function Home() {
  const posts = getSortedPostsData();
  const profile = getProfile();
  const spec = avatarSpec(profile);

  return (
    <Layout>
      <div style={{ display: "grid", gap: 18 }}>
        <div className="hero">
          <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
            <CharacterCard profile={profile} />
            <SkillsPanel profile={profile} />
          </div>
          <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
            <SenseiCard images={profile.sensei} />
            <TrainingMontage spec={spec} />
            <ProfileTiles profile={profile} />
          </div>
        </div>

        {posts.length === 0 ? (
          <div id="posts" className="panel">
            No posts yet. I still need to stop overthinking and publish one.
          </div>
        ) : (
          <PostsDirectory posts={posts} spec={spec} />
        )}
      </div>
    </Layout>
  );
}
