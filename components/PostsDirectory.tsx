"use client";

import { useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/../lib/posts";
import Snap3D from "./three/Snap3D";

type SortOption = "date-desc" | "date-asc" | "read-asc" | "read-desc";

type FilterOption = "all" | "featured" | "notebook";

const sortOptions: Array<{ id: SortOption; label: string }> = [
  { id: "date-desc", label: "Newest First" },
  { id: "date-asc", label: "Oldest First" },
  { id: "read-asc", label: "Quickest Read" },
  { id: "read-desc", label: "Longest Read" },
];

const filterOptions: Array<{ id: FilterOption; label: string }> = [
  { id: "all", label: "All Entries" },
  { id: "featured", label: "Featured Notes" },
  { id: "notebook", label: "Notebook Entries" },
];

function formatDate(dateString: string) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPostDateValue(post: Pick<PostMeta, "date">) {
  const time = new Date(post.date).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function pillClass(isActive: boolean) {
  return "pill-btn" + (isActive ? " is-active" : "");
}

export default function PostsDirectory({
  posts,
  spec,
}: {
  posts: PostMeta[];
  /** the character, for posts whose picture is a pose */
  spec?: Record<string, unknown>;
}) {
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");

  const featuredPostIds = [posts[0]?.id, "boredom"].filter(Boolean);
  const isFeaturedPost = (post: PostMeta) => featuredPostIds.includes(post.id);

  const filteredPosts = posts.filter((post) => {
    const isFeatured = isFeaturedPost(post);

    switch (filterOption) {
      case "featured":
        return isFeatured;
      case "notebook":
        return !isFeatured;
      case "all":
      default:
        return true;
    }
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const dateDelta = getPostDateValue(b) - getPostDateValue(a);
    const readDelta = b.readTimeMinutes - a.readTimeMinutes;

    switch (sortOption) {
      case "date-asc":
        return -dateDelta;
      case "read-asc":
        return -readDelta || dateDelta;
      case "read-desc":
        return readDelta || dateDelta;
      case "date-desc":
      default:
        return dateDelta;
    }
  });

  return (
    <section id="posts" className="panel" style={{ scrollMarginTop: 16 }} aria-label="Posts">
      <div className="panel-head">
        <h2>
          <Snap3D icon="prop:ほん" alt="" size={36} /> Sort through the posts
        </h2>
        <span className="label">quest log · {posts.length} entries</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="control-row">
          <span className="label">Sort</span>
          {sortOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={sortOption === option.id}
              className={pillClass(sortOption === option.id)}
              onClick={() => setSortOption(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="control-row">
          <span className="label">Filter</span>
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filterOption === option.id}
              className={pillClass(filterOption === option.id)}
              onClick={() => setFilterOption(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {sortedPosts.length === 0 ? (
        <p className="empty-note">Nothing matches this filter yet.</p>
      ) : (
        <ul className="post-list">
          {sortedPosts.map((post, index) => {
            const isFeatured = isFeaturedPost(post);
            const postTitle =
              post.id === "boredom"
                ? "How to deal with a little boredom and lack of motivation?"
                : post.title;

            return (
              <li key={post.id}>
                <Link href={`/posts/${post.id}`} className="post-card">
                  <Snap3D icon={post.icon || "prop:ノート"} spec={spec} alt="" size={72} />
                  <div style={{ minWidth: 0 }}>
                    <div className="post-meta">
                      <span className={"chip" + (isFeatured ? " neon" : "")}>
                        {isFeatured ? "Featured Note" : "Notebook Entry"}
                      </span>
                      <span className="chip">{formatDate(post.date)}</span>
                      <span className="chip">{post.readTime || "Quick read"}</span>
                    </div>
                    <h3>{postTitle}</h3>
                    <p>{post.excerpt || "Build notes, small lessons, and the parts I know I will want to remember later."}</p>
                  </div>
                  <span className="num">{String(index + 1).padStart(2, "0")}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
