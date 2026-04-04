import React from "react";

type TimelineProps = {
  children: React.ReactNode;
  className?: string;
};

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div
      className={`relative mx-auto max-w-5xl px-2 sm:px-0 [--timeline-x:1.5rem] md:[--timeline-x:50%] ${
        className ?? ""
      }`.trim()}
    >
      <div className="absolute left-[var(--timeline-x)] hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-pink-200/20 via-pink-300/70 to-rose-200/20 md:block" />
      <div className="space-y-5 md:space-y-6">{children}</div>
    </div>
  );
}
