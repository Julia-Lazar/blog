import { getSortedPostsData } from "@/../lib/posts";
import Link from "next/link";
import Layout from "@/../components/Layout";
import Image from "next/image";

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
                Newest drop: {formatDate(newestPost.date)}
              </span>
            ) : null}
          </div>
        </section>

        {posts.length === 0 ? (
          <div
            id="projects"
            className="jiggly-card scroll-mt-6 rounded-[1.8rem] p-6 text-sm text-pink-50/80 sm:scroll-mt-8 sm:p-8 sm:text-base"
          >
            No posts yet. This dreamy notebook is waiting for the next entry.
          </div>
        ) : (
          <ul
            id="projects"
            className="space-y-4 list-none scroll-mt-6 pl-0 sm:scroll-mt-8"
          >
            {posts.map((post, index) => {
              const isFeatured = index === 0 || post.id === "boredom";
              const postTitle =
                post.id === "boredom"
                  ? "How to deal with a little boredom and lack of motivation?"
                  : post.title;

              return (
                <li key={post.id}>
                  <Link href={`/posts/${post.id}`} className="block no-underline">
                    <article className="jiggly-card jiggly-card-interactive group rounded-[1.7rem] p-5 sm:p-6">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="jiggly-chip text-[11px] uppercase tracking-[0.22em]">
                              {isFeatured ? "Featured Note" : "Notebook Entry"}
                            </span>
                            <span className="jiggly-chip text-sm">
                              {formatDate(post.date)}
                            </span>
                            <span className="jiggly-chip text-sm">
                              {post.readTime || "Quick read"}
                            </span>
                          </div>

                          <div className="flex items-start gap-4">
                            {post.id === "boredom" ? (
                              <Image
                                src="/images/skype-mad.gif"
                                alt="Decorative mood icon"
                                width={68}
                                height={68}
                                className="hidden rounded-2xl border border-white/10 shadow-lg sm:block"
                              />
                            ) : null}

                            <div className="min-w-0">
                              <h3 className="text-xl font-semibold tracking-tight text-white transition-colors duration-200 group-hover:text-pink-50 sm:text-2xl">
                                {postTitle}
                              </h3>
                              <p className="mt-3 max-w-2xl text-sm leading-7 text-pink-100/78 sm:text-base">
                                {post.id === "boredom"
                                  ? "A softer reset note about motivation, energy, and getting back into motion without forcing it."
                                  : "Open the entry for project notes, lessons learned, and the small details polished into each build."}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                          <span className="font-pixel text-[10px] leading-[1.8] text-pink-100/75 sm:text-xs">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-pink-50">
                            Open Post
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Layout>
  );
}
