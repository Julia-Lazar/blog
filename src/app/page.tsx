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
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="jiggly-card rounded-[1.8rem] p-6 sm:p-8">
            <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/80 sm:text-xs">
              Dreamy Dispatch
            </p>
            <h2 className="jiggly-section-title mt-4 font-pixel text-lg leading-[1.9] sm:text-3xl sm:leading-[1.7]">
              Latest Posts
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-pink-50/82 sm:text-base">
              Fresh notes from the blog, wrapped in a cleaner Jigglypuff-inspired
              layout with softer glow, better hierarchy, and easier-to-scan post
              cards.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="jiggly-chip text-sm">
                Total posts: {posts.length}
              </span>
              {newestPost ? (
                <span className="jiggly-chip text-sm">
                  Newest drop: {formatDate(newestPost.date)}
                </span>
              ) : null}
            </div>
          </div>

          <aside className="jiggly-card rounded-[1.8rem] p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-[auto_1fr] lg:grid-cols-1">
              <div className="relative mx-auto flex w-full max-w-[180px] items-center justify-center">
                <div className="absolute inset-4 rounded-full bg-pink-300/20 blur-3xl" />
                <Image
                  src="/images/jiggly.png"
                  alt="Jigglypuff singing"
                  width={190}
                  height={190}
                  className="relative h-auto w-full drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)]"
                />
              </div>

              <div className="space-y-3">
                <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/82">
                  Current Vibe
                </p>
                <p className="text-sm leading-7 text-pink-50/82">
                  Cozy frontend notes, retro-inspired typography, and candy-pink
                  highlights that make the blog feel more intentional.
                </p>
                <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-pink-50/78">
                  Pixel headings for the Pokemon mood, brighter cards for better
                  contrast, and calmer spacing so each post has more room to
                  breathe.
                </div>
              </div>
            </div>
          </aside>
        </section>

        {posts.length === 0 ? (
          <div className="jiggly-card rounded-[1.8rem] p-6 text-sm text-pink-50/80 sm:p-8 sm:text-base">
            No posts yet. This dreamy notebook is waiting for the next entry.
          </div>
        ) : (
          <ul className="space-y-4 list-none pl-0">
            {posts.map((post, index) => {
              const isFeatured = index === 0 || post.id === "boredom";
              const postTitle =
                post.id === "boredom"
                  ? "How to deal with a little boredom and lack of motivation?"
                  : post.title;

              return (
                <li key={post.id}>
                  <Link href={`/posts/${post.id}`} className="block no-underline">
                    <article className="jiggly-card group rounded-[1.7rem] p-5 sm:p-6">
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
