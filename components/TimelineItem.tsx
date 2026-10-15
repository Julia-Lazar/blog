import React from "react";
import Pic from "./Pic";

type TimelineSide = "left" | "right";

export type TimelineItemProps = {
  side: TimelineSide;
  date: string;
  title: string;
  description: string;
  /** picture, see Pic: "prop:…", "item:…", "head" (my character), "anim:lift"… */
  icon: string;
  /** my character, for icons that show her */
  spec?: Record<string, unknown>;
  /** some pictures have a lot of empty space around them (the falling baby) */
  iconSize?: number;
  /** the chapter I'm in right now */
  current?: boolean;
  /** an aside that only shows when the card is hovered (or focused) */
  hoverNote?: string;
};

/** One stop on the quest line: a diamond on the line and a card on one side. */
export function TimelineItem({ side, date, title, description, icon, spec, iconSize, current = false, hoverNote }: TimelineItemProps) {
  return (
    <li className={`quest-step is-${side}${current ? " is-current" : ""}`}>
      <span className="quest-node" aria-hidden="true" />
      <article className={"quest-card" + (hoverNote ? " has-note" : "")} tabIndex={hoverNote ? 0 : undefined}>
        <header className="quest-card-head">
          <Pic icon={icon} spec={spec} size={iconSize ?? (icon.startsWith("anim:") ? 72 : 56)} />
          <div>
            <p className="quest-date">{date}</p>
            <h3 className="quest-title">{title}</h3>
          </div>
        </header>
        <p className="quest-text">{description}</p>
        {hoverNote ? <p className="quest-note">{hoverNote}</p> : null}
        {current ? <span className="quest-now">Now playing</span> : null}
      </article>
    </li>
  );
}
