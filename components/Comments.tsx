"use client";

import Giscus from "@giscus/react";
import type { AvailableLanguage, Mapping, Theme } from "@giscus/react";

const DEFAULT_GISCUS_REPO = "Julia-Lazar/blog";
const DEFAULT_GISCUS_REPO_ID = "R_kgDORGyF4w";
const DEFAULT_GISCUS_CATEGORY = "General";
const DEFAULT_GISCUS_MAPPING: Mapping = "pathname";
const DEFAULT_GISCUS_THEME: Theme = "preferred_color_scheme";
const DEFAULT_GISCUS_LANGUAGE: AvailableLanguage = "pl";

export default function Comments() {
  const repo =
    process.env.NEXT_PUBLIC_GISCUS_REPO?.trim() || DEFAULT_GISCUS_REPO;
  const repoId =
    process.env.NEXT_PUBLIC_GISCUS_REPO_ID?.trim() || DEFAULT_GISCUS_REPO_ID;
  const category =
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY?.trim() || DEFAULT_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID?.trim();
  const mapping =
    (process.env.NEXT_PUBLIC_GISCUS_MAPPING?.trim() as Mapping | undefined) ||
    DEFAULT_GISCUS_MAPPING;
  const theme =
    (process.env.NEXT_PUBLIC_GISCUS_THEME?.trim() as Theme | undefined) ||
    DEFAULT_GISCUS_THEME;
  const lang =
    (process.env.NEXT_PUBLIC_GISCUS_LANG?.trim() as
      | AvailableLanguage
      | undefined) || DEFAULT_GISCUS_LANGUAGE;

  return (
    <div className="jiggly-card mt-8 rounded-[1.8rem] border border-white/10 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/80">
            Community Notes
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">
            Comments
          </h2>
        </div>
        <span className="jiggly-chip text-xs uppercase tracking-[0.2em]">
          Giscus
        </span>
      </div>

      <Giscus
        id="comments"
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping={mapping}
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme={theme}
        lang={lang}
        loading="lazy"
      />
    </div>
  );
}
