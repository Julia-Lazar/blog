"use client";

import Giscus from "@giscus/react";

export default function Comments() {
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
        repo="juliadmytrenko/my-app"
        repoId="R_kgDOQjQn-Q"
        category="General"
        categoryId="DIC_kwDOQjQn-c4CzjHv"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="dark"
        lang="pl"
        loading="lazy"
      />
    </div>
  );
}
