import React from "react";

type TimelineProps = {
  children: React.ReactNode;
  className?: string;
};

/** The quest line: a dim track with a neon line that fills up as you scroll. */
export function Timeline({ children, className }: TimelineProps) {
  return <ol className={["quest-line", className].filter(Boolean).join(" ")}>{children}</ol>;
}
