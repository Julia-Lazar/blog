import React from "react";

type TimelineProps = {
  children: React.ReactNode;
  className?: string;
};

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={`relative max-w-4xl mx-auto ${className ?? ""}`.trim()}>
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-400 via-pink-400 to-purple-400"></div>
      <div className="space-y-8">{children}</div>
    </div>
  );
}
