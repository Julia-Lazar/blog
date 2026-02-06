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
  try {
    const { id } = await params; // await rozpakowanie Promise
    const post = await getPostData(id);
    if (!post) return notFound();

    return (
      <Layout>
        <div className="w-full">
          <nav className="mb-4">
            <Link
              href="/"
              className="inline-block text-white hover:text-pink-100 font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-pink-300/20 text-sm sm:text-base transition-all duration-300 hover:bg-white/20 no-underline"
            >
              ← Back
            </Link>
          </nav>

          <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-pink-300/20 overflow-hidden">
            <header className="mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 flex-wrap">
                <span className="text-xl sm:text-2xl">🎀</span>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words text-white">
                  {post.title}
                </h1>
              </div>
              <p className="mt-3 text-pink-200 text-xs sm:text-sm">
                <span aria-hidden>📅</span>{" "}
                <span className="font-medium">{formatDate(post.date)}</span>
              </p>
              <p className="mt-3 text-pink-200 text-xs sm:text-sm">
                <span aria-hidden>⏰ {post.readTime}</span>{" "}
              </p>
            </header>

            <div className="markdown break-words overflow-wrap-anywhere overflow-x-hidden prose-headings:text-pink-100 prose-p:text-white prose-strong:text-purple-200 prose-code:text-pink-100 prose-a:text-pink-200 hover:prose-a:text-pink-100 prose-li:text-white prose-ul:text-white prose-ol:text-white">
              <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
            </div>

            <footer className="mt-6 sm:mt-8 text-center">
              <p className="text-xs sm:text-sm text-pink-100">
                ✨ Thank you for reading. ✨
              </p>
            </footer>
          </article>

          <Comments />
        </div>
      </Layout>
    );
  } catch (err) {
    return notFound();
  }
}
