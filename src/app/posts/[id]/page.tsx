import Link from "next/link";
import Layout from "../../../../components/Layout";
import { getPostData, getSortedPostsData } from "../../../../lib/posts";
import { notFound } from "next/navigation";
import Comments from "../../../../components/Comments";

function formatDate(dateString: string) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface Params {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({ id: post.id }));
}

export default async function Post({ params }: Params) {
  const { id } = await params;

  let post;

  try {
    post = await getPostData(id);
  } catch {
    return notFound();
  }

  if (!post) return notFound();

  return (
    <Layout>
      <div className="w-full">
        <nav className="mb-6">
          <Link
            href="/"
            className="jiggly-button inline-flex rounded-full px-4 py-3 text-sm font-semibold text-pink-50 no-underline sm:px-5"
          >
            Back
          </Link>
        </nav>

        <article className="jiggly-card relative overflow-hidden rounded-[1.9rem] p-5 sm:p-8 md:p-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-pink-300/10 blur-3xl" />
          <header className="relative mb-8 space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="jiggly-chip text-[11px] uppercase tracking-[0.22em]">
                Notebook Entry
              </span>
              <span className="jiggly-chip text-sm">{formatDate(post.date)}</span>
              <span className="jiggly-chip text-sm">
                {post.readTime || "Quick read"}
              </span>
            </div>

            <div className="space-y-4">
              <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/80">
                Post View
              </p>
              <h1 className="jiggly-section-title font-pixel text-lg leading-[1.9] sm:text-3xl sm:leading-[1.7] lg:text-[2.3rem] lg:leading-[1.55]">
                {post.title}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-pink-50/82 sm:text-base">
                Usually a mix of build notes, mistakes, and the things I want
                to remember next time.
              </p>
            </div>
          </header>

          <div className="markdown prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none break-words overflow-wrap-anywhere overflow-x-hidden">
            <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          </div>

          <footer className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-pink-100/75">Thanks for reading.</p>
          </footer>
        </article>

        <Comments />
      </div>
    </Layout>
  );
}
