import React from "react";

type TimelineSide = "left" | "right";
type TimelineTone = "purple" | "pink";

export type TimelineItemProps = {
  side: TimelineSide;
  date: string;
  title: string;
  description: string;
  tone: TimelineTone;
  dotClassName?: string;
};

export function TimelineItem({
  side,
  date,
  title,
  description,
  tone,
  dotClassName,
}: TimelineItemProps) {
  const toneStyles = {
    purple: {
      date: "text-purple-300",
      title: "text-purple-200",
      card: "from-purple-500/30 to-pink-500/30 border-purple-300/30",
      dot: "bg-purple-300",
    },
    pink: {
      date: "text-pink-300",
      title: "text-pink-200",
      card: "from-pink-500/30 to-purple-500/30 border-pink-300/30",
      dot: "bg-pink-300",
    },
  } as const;

  const styles = toneStyles[tone];
  const dotClass = dotClassName ?? styles.dot;

  const card = (
    <div
      className={`bg-gradient-to-br ${styles.card} backdrop-blur-sm p-4 rounded-xl border shadow-xl hover:scale-105 transition-transform duration-300`}
    >
      <h3 className={`text-lg font-semibold mb-1 ${styles.title}`}>
        {title}
      </h3>
      <p className="text-sm text-white">{description}</p>
    </div>
  );

  return (
    <div className="relative flex items-center">
      {side === "right" ? (
        <>
          <div className="w-1/2 pr-8 text-right">
            <span className={`text-lg font-bold ${styles.date}`}>{date}</span>
          </div>
          <div
            className={`absolute left-1/2 transform -translate-x-1/2 w-6 h-6 ${dotClass} rounded-full border-4 border-white shadow-lg z-10`}
          ></div>
          <div className="w-1/2 pl-8">{card}</div>
        </>
      ) : (
        <>
          <div className="w-1/2 pr-8 text-right">{card}</div>
          <div
            className={`absolute left-1/2 transform -translate-x-1/2 w-6 h-6 ${dotClass} rounded-full border-4 border-white shadow-lg z-10`}
          ></div>
          <div className="w-1/2 pl-8">
            <span className={`text-lg font-bold ${styles.date}`}>{date}</span>
          </div>
        </>
      )}
    </div>
  );
}
