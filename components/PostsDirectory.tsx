"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PostMeta } from "@/../lib/posts";

type SortOption =
  | "date-desc"
  | "date-asc"
  | "read-asc"
  | "read-desc";

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
  return d.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPostDateValue(post: Pick<PostMeta, "date">) {
  const time = new Date(post.date).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortButtonClass(isActive: boolean) {
  return [
    "jiggly-button rounded-full px-4 py-3 text-sm font-semibold text-pink-50",
    "transition-transform duration-200",
    isActive
      ? "border-pink-100/40 bg-pink-200/15 text-white shadow-[0_14px_30px_rgba(22,0,30,0.28)]"
      : "text-pink-100/90",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function PostsDirectory({ posts }: { posts: PostMeta[] }) {
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
    <div id="posts" className="space-y-6 scroll-mt-6 sm:scroll-mt-8">
      <section className="jiggly-card rounded-[1.8rem] border-pink-200/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_28%),linear-gradient(145deg,rgba(255,152,210,0.34),rgba(117,24,77,0.9))] shadow-[0_22px_54px_rgba(32,0,36,0.34)] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/80">
              Posts
            </p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Sort through the posts
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-pink-50/78 sm:text-base">
              Sort by date or reading time, or filter the posts.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-pink-100/70">
              Sort
            </p>
            <div className="flex flex-wrap gap-3">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={sortOption === option.id}
                  className={sortButtonClass(sortOption === option.id)}
                  onClick={() => setSortOption(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-pink-100/70">
              Filter
            </p>
            <div className="flex flex-wrap gap-3">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={filterOption === option.id}
                  className={sortButtonClass(filterOption === option.id)}
                  onClick={() => setFilterOption(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {sortedPosts.length === 0 ? (
        <section className="jiggly-card rounded-[1.8rem] p-6 text-sm leading-7 text-pink-50/80 sm:p-8 sm:text-base">
          Nothing matches this filter yet.
        </section>
      ) : (
        <ul className="space-y-4 list-none pl-0">
          {sortedPosts.map((post, index) => {
            const isFeatured = isFeaturedPost(post);
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
                                ? "A very honest post about feeling sick of the screen and trying to get my motivation back without forcing it."
                                : "Build notes, small lessons, and the parts I know I will want to remember later."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:items-end">
                        <span className="font-pixel text-[10px] leading-[1.8] text-pink-100/75 sm:text-xs">
                          {String(index + 1).padStart(2, "0")}
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
  );
}
