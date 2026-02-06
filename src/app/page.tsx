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

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-200 via-purple-200 to-pink-100 bg-clip-text text-transparent mb-8">
          Latest Posts
        </h2>
        <ul className="space-y-4 list-none pl-0">
          {posts.map((post) => (
            <li
              key={post.id}
              className="border-l-4 border-pink-400/40 bg-white/5 backdrop-blur-sm hover:bg-white/10 rounded-xl px-4 sm:px-6 py-4 transition-all duration-300 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-500/20"
            >
              {post.id == "boredom" ? (
                <div className="">
                  <div className="flex flex-wrap items-center">
                    <div>
                      <Image
                        src="/images/skype-mad.gif"
                        alt="skype-mad.gif"
                        width={60}
                        height={60}
                        className="rounded mr-2 h-full"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/posts/${post.id}`}
                        className="text-white hover:text-pink-100 text-base sm:text-lg transition-colors break-words no-underline"
                      >
                        <h3 className="d-flex flex-wrap m-0 font-semibold">
                          How to deal with a little{"  "}
                          <span className="mx-1 ">boredom</span> and lack of{" "}
                          <span className="mx-1 ">motivation?</span>
                        </h3>
                      </Link>
                    </div>
                  </div>
                  <div className="flex flex-wrap flex-1 gap-3 mt-2 text-pink-200 text-sm">
                    <span>📅 {formatDate(post.date)}</span>
                    <span>⏰ {post.readTime}</span>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-white hover:text-pink-100 font-semibold text-base sm:text-lg transition-colors break-words no-underline"
                  >
                    <h3 className="m-0 font-semibold">{post.title}</h3>
                  </Link>
                  <div className="flex flex-wrap gap-3 mt-2 text-pink-200 text-sm">
                    <span>📅 {formatDate(post.date)}</span>
                    <span>⏰ {post.readTime}</span>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
