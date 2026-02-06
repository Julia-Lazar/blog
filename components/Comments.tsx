"use client";

import Giscus from "@giscus/react";

export default function Comments() {
  return (
    <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
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
