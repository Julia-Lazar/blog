import React from "react";

type TimelineProps = {
  children: React.ReactNode;
  className?: string;
};

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div
      className={`relative max-w-4xl mx-auto px-4 sm:px-0 [--timeline-x:1.5rem] md:[--timeline-x:50%] ${
        className ?? ""
      }`.trim()}
    >
      <div className="absolute left-[var(--timeline-x)] -translate-x-1/2 h-full w-0.5 md:w-1 bg-gradient-to-b from-purple-400 via-pink-400 to-purple-400 hidden md:block"></div>
      <div className="space-y-10 md:space-y-8">{children}</div>
    </div>
  );
}
