import { getSortedPostsData } from "@/../lib/posts";
import Layout from "@/../components/Layout";
import PostsDirectory from "@/../components/PostsDirectory";

function formatDate(dateString: string) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Home() {
  const posts = getSortedPostsData();
  const newestPost = posts[0];

  return (
    <Layout>
      <div className="space-y-8">
        <section className="rounded-[1.8rem] bg-white/5 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="jiggly-chip text-sm">Total posts: {posts.length}</span>
            {newestPost ? (
              <span className="jiggly-chip text-sm">
                Latest post: {formatDate(newestPost.date)}
              </span>
            ) : null}
          </div>
        </section>

        {posts.length === 0 ? (
          <div
            id="posts"
            className="jiggly-card scroll-mt-6 rounded-[1.8rem] p-6 text-sm text-pink-50/80 sm:scroll-mt-8 sm:p-8 sm:text-base"
          >
            No posts yet. I still need to stop overthinking and publish one.
          </div>
        ) : (
          <PostsDirectory posts={posts} />
        )}
      </div>
    </Layout>
  );
}
