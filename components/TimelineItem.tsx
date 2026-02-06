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
    <div className="relative flex flex-col md:flex-row md:items-center">
      <div
        className={`absolute left-[var(--timeline-x)] -translate-x-1/2 w-6 h-6 ${dotClass} rounded-full border-4 border-white shadow-lg z-10 hidden md:block`}
      ></div>
      {side === "right" ? (
        <>
          <div className="w-full md:w-1/2 md:pr-8 md:text-right min-w-0">
            <span className={`hidden md:inline text-lg font-bold ${styles.date}`}>
              {date}
            </span>
          </div>
          <div className="w-full md:w-1/2 md:pl-8 min-w-0">
            <span className={`md:hidden block mb-2 text-lg font-bold ${styles.date}`}>
              {date}
            </span>
            {card}
          </div>
        </>
      ) : (
        <>
          <div className="w-full md:w-1/2 md:pr-8 md:text-right min-w-0">
            <span className={`md:hidden block mb-2 text-lg font-bold ${styles.date}`}>
              {date}
            </span>
            {card}
          </div>
          <div className="w-full md:w-1/2 md:pl-8 min-w-0">
            <span className={`hidden md:inline text-lg font-bold ${styles.date}`}>
              {date}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
