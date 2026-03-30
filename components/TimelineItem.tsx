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
      date: "text-purple-100/80",
      title: "text-purple-100",
      card:
        "border-purple-200/15 bg-[linear-gradient(145deg,rgba(209,177,255,0.12),rgba(53,17,65,0.78))]",
      dot: "bg-purple-200",
    },
    pink: {
      date: "text-pink-100/80",
      title: "text-pink-50",
      card:
        "border-pink-200/15 bg-[linear-gradient(145deg,rgba(255,178,223,0.14),rgba(58,17,61,0.8))]",
      dot: "bg-pink-300",
    },
  } as const;

  const styles = toneStyles[tone];
  const dotClass = dotClassName ?? styles.dot;

  const card = (
    <div
      className={`jiggly-card rounded-[1.55rem] border p-5 sm:p-6 ${styles.card}`}
    >
      <p className={`font-pixel text-[10px] leading-[1.8] ${styles.date}`}>
        {date}: {title}
      </p>
      <h3 className={`mt-4 text-xl font-semibold ${styles.title}`}>{title}</h3>
      <p className="mt-3 text-sm leading-7 text-pink-50/82">{description}</p>
    </div>
  );

  return (
    <div className="relative flex flex-col md:flex-row md:items-stretch">
      <div
        className={`absolute left-[var(--timeline-x)] top-8 z-10 hidden h-5 w-5 -translate-x-1/2 rounded-full border-4 border-[rgba(30,10,35,0.95)] shadow-lg md:block ${dotClass}`}
      />
      {side === "right" ? (
        <>
          <div className="hidden w-full md:block md:w-1/2 md:pr-10" />
          <div className="w-full min-w-0 md:w-1/2 md:pl-10">
            {card}
          </div>
        </>
      ) : (
        <>
          <div className="w-full min-w-0 md:w-1/2 md:pr-10">
            {card}
          </div>
          <div className="hidden w-full md:block md:w-1/2 md:pl-10" />
        </>
      )}
    </div>
  );
}
