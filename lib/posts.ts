import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import readingTime from "reading-time";

export interface PostMeta {
  id: string;
  title: string;
  date: string;
  readTime: string;
  readTimeMinutes: number;
  /** 3D picture for the post card, e.g. "prop:ピザ" or "pose:read:1" */
  icon?: string;
  excerpt?: string;
}

type FrontMatter = { title?: string; date?: string; icon?: string; excerpt?: string };

type HastNode = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: HastNode[] };

/** Gives every `<pre>` a data-lang ("ts", "bash"…) so the CSS can print it in the editor-style title bar. */
function labelCodeBlocks() {
  const walk = (node: HastNode) => {
    if (node.tagName === "pre") {
      const code = node.children?.find((child) => child.tagName === "code");
      const classes = (code?.properties?.className as string[] | undefined) ?? [];
      const lang = classes.find((name) => name.startsWith("language-"))?.slice("language-".length);
      node.properties = { ...node.properties, dataLang: lang || "text" };
    }
    node.children?.forEach(walk);
  };
  return (tree: HastNode) => walk(tree);
}

const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const fileNames = fs.readdirSync(postsDirectory);

  const mdFileNames = fileNames.filter((fileName) => {
    const fullPath = path.join(postsDirectory, fileName);
    try {
      return fs.statSync(fullPath).isFile() && fileName.endsWith(".md");
    } catch {
      return false;
    }
  });

  const allPostsData: PostMeta[] = mdFileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const matterResult = matter(fileContents);
    const data = matterResult.data as FrontMatter;
    const readTime = readingTime(matterResult.content);

    return {
      id,
      title: String(data.title ?? ""),
      date: String(data.date ?? ""),
      readTime: readTime.text,
      readTimeMinutes: readTime.minutes,
      ...(data.icon ? { icon: String(data.icon) } : {}),
      ...(data.excerpt ? { excerpt: String(data.excerpt) } : {}),
    };
  });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`);

  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    throw new Error(`Post file not found: ${fullPath}`);
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);
  const data = matterResult.data as FrontMatter;

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight)
    .use(labelCodeBlocks)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(matterResult.content);
  const contentHtml = processed.toString();

  return {
    id,
    contentHtml,
    title: String(data.title ?? ""),
    date: String(data.date ?? ""),
    readTime: readingTime(matterResult.content).text,
    ...(data.icon ? { icon: String(data.icon) } : {}),
  } as { id: string; contentHtml: string; title: string; date: string; readTime: string; icon?: string };
}
