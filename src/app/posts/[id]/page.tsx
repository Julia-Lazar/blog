import Link from "next/link";
import Layout from "../../../../components/Layout";
import { getPostData, getSortedPostsData } from "../../../../lib/posts";
import { notFound } from "next/navigation";
import Comments from "../../../../components/Comments";
import Snap3D from "../../../../components/three/Snap3D";

function formatDate(dateString: string) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-GB", {
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
      <div style={{ display: "grid", gap: 18 }}>
        <nav>
          <Link href="/#posts" className="pill-btn">
            Back
          </Link>
        </nav>

        <article className="panel" style={{ padding: "clamp(18px, 4vw, 40px)" }}>
          <header className="article-head" style={{ marginBottom: 28 }}>
            <div>
              <div className="post-meta">
                <span className="chip neon">Notebook Entry</span>
                <span className="chip">{formatDate(post.date)}</span>
                <span className="chip">{post.readTime || "Quick read"}</span>
              </div>
              <h1>{post.title}</h1>
            </div>
            <Snap3D icon={post.icon || "prop:ノート"} alt="" size={150} />
          </header>

          <div className="markdown prose prose-sm sm:prose lg:prose-lg max-w-none break-words overflow-x-hidden">
            <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          </div>

          <footer style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--line)", textAlign: "center" }}>
            <p className="muted">Thanks for reading. ありがとう！</p>
          </footer>
        </article>

        <Comments />
      </div>
    </Layout>
  );
}
