import React from "react";
import type { IconType } from "react-icons";
import Layout from "@/../components/Layout";
import {
  FaReact,
  FaNode,
  FaGitAlt,
  FaBootstrap,
  FaVuejs,
  FaTheaterMasks,
} from "react-icons/fa";
import {
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiGraphql,
  SiPostman,
  SiGithubactions,
  SiJenkins,
  SiCypress,
  SiCucumber,
  SiSass,
  SiNuxtdotjs,
  SiPostgresql,
  SiMysql,
  SiDocker,
  SiHtml5,
  SiCss3,
  SiJavascript,
} from "react-icons/si";
import { MdApi, MdGroups } from "react-icons/md";
import { TbBrandMysql } from "react-icons/tb";
import { Timeline } from "@/../components/Timeline";
import { TimelineItem, TimelineItemProps } from "@/../components/TimelineItem";
import Snap3D from "@/../components/three/Snap3D";
import { getProfile } from "@/../lib/profile";
import { ITEM, avatarSpec } from "@/../lib/catalog";
import Avatar3D from "@/../components/three/Avatar3D";

type PathItem = Omit<TimelineItemProps, "spec"> & {
  id: string;
  /** the icon shows my character: as she is, with the "well actually" glasses, or graduating */
  avatar?: "me" | "nerd" | "grad";
};

const learningPathItems: PathItem[] = [
  {
    id: "first-steps",
    side: "right",
    date: "~2014",
    title: "First Steps",
    description:
      "I liked the logic part first. Simple algorithm tasks felt more like little puzzle games than schoolwork.",
    icon: "anim:baby",
    iconSize: 100,
  },
  {
    id: "cs-studies",
    side: "left",
    date: "2018",
    title: "Computer Science Studies",
    description:
      "This is when coding stopped feeling like just another subject and started feeling like something I actually wanted to do.",
    icon: "head",
    iconSize: 68,
    avatar: "nerd",
  },
  {
    id: "clean-code-principles",
    side: "right",
    date: "2021",
    title: "Clean Code Principles",
    description:
      "Learning SOLID principles, DRY, and the FIRST principles in testing showed me how much clean code matters.",
    icon: "prop:duck",
  },
  {
    id: "the-beginning",
    side: "left",
    date: "2022",
    title: "The Beginning",
    description:
      "I graduated in Computer Science and went for frontend: it felt the most intuitive to learn, and it was fun, because I could see the results of my work right away.",
    icon: "head",
    iconSize: 68,
    avatar: "grad",
  },
  {
    id: "frontend-foundations",
    side: "right",
    date: "2023",
    title: "Frontend Foundations",
    description:
      "A lot of React, components, hooks, and slowly understanding why structure matters so much when a project grows.",
    icon: "prop:パソコン",
  },
  {
    id: "testing-internship",
    side: "left",
    date: "2026",
    title: "9-Month Software Testing Internship",
    description:
      "Nine months of testing real applications: test cases, bug reports, automation, and thinking about what the product feels like when something breaks.",
    icon: "anim:lift",
    avatar: "me",
    current: true,
  },
];

interface Tech {
  name: string;
  Icon: IconType | ((props: { className?: string }) => React.ReactNode);
  color: string;
}

const testAutomationTech: Tech[] = [
  { name: "Playwright", Icon: FaTheaterMasks, color: "#2EAD33" },
  { name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
  { name: "Postman", Icon: SiPostman, color: "#FF6C37" },
  { name: "REST API", Icon: MdApi, color: "#FF8A5C" },
  { name: "GitHub Actions", Icon: SiGithubactions, color: "#2088FF" },
  { name: "Git", Icon: FaGitAlt, color: "#F05032" },
];

const testingWorkedWith: Tech[] = [
  { name: "Jenkins", Icon: SiJenkins, color: "#D24939" },
  { name: "Cypress", Icon: SiCypress, color: "#69D3A7" },
  { name: "Cucumber", Icon: SiCucumber, color: "#23D96C" },
];

/** HTML, CSS and JS logos overlapping, like a little Venn diagram */
function WebBasicsIcon({ className }: { className?: string }) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center" }} aria-hidden="true">
      <SiHtml5 style={{ color: "#E34F26" }} />
      <SiCss3 style={{ color: "#1572B6", marginLeft: "-0.3em" }} />
      <SiJavascript style={{ color: "#F7DF1E", marginLeft: "-0.3em", borderRadius: 3 }} />
    </span>
  );
}

const coreTech: Tech[] = [
  { name: "HTML / CSS / JS", Icon: WebBasicsIcon, color: "#F7DF1E" },
  { name: "React", Icon: FaReact, color: "#61DAFB" },
  { name: "Next.js", Icon: SiNextdotjs, color: "#FFFFFF" },
  { name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
  { name: "Tailwind CSS", Icon: SiTailwindcss, color: "#06B6D4" },
  { name: "SCSS / Sass", Icon: SiSass, color: "#CC6699" },
  { name: "Node.js", Icon: FaNode, color: "#63B65A" },
  { name: "Git", Icon: FaGitAlt, color: "#F05032" },
];

const workedWith: Tech[] = [
  { name: "GraphQL", Icon: SiGraphql, color: "#E10098" },
  { name: "MySQL", Icon: TbBrandMysql, color: "#6DA7D9" },
  { name: "MySQL Workbench", Icon: SiMysql, color: "#00A6C0" },
  { name: "PostgreSQL", Icon: SiPostgresql, color: "#699ECA" },
  { name: "Bootstrap", Icon: FaBootstrap, color: "#9A70FF" },
  { name: "Vue.js", Icon: FaVuejs, color: "#63D0A0" },
  { name: "Nuxt.js", Icon: SiNuxtdotjs, color: "#00DC82" },
  { name: "Scrum", Icon: MdGroups, color: "#4BC2E6" },
];

const currentGoals: Array<string | { text: string; Icon: IconType; color: string }> = [
  { text: "Learn Docker.", Icon: SiDocker, color: "#2496ED" },
  "Keep this blog alive and keep posting when I learn something worth sharing.",
  "Get better at TypeScript without turning everything into overkill.",
  "Build projects that feel useful, not just nice in screenshots.",
  "Get more confident with backend basics and databases.",
  "Keep leveling up in QA and testing, not only frontend.",
  "Contribute to open source once I stop overthinking it.",
];

const learningNow = [
  { text: "CI/CD: pipelines, GitHub Actions, and tests that run on every push instead of when I remember.", icon: "item:s7" },
  { text: "Advanced testing techniques: test design, risk-based testing, and not trusting a green build blindly.", icon: "item:r7" },
  { text: "How much I can actually do with AI, and how to check what it gives me.", icon: "prop:でんき" },
  { text: "Writing cleaner tests and thinking more like a QA engineer.", icon: "item:wq2" },
  { text: "CSS details, motion, and making interfaces feel less generic.", icon: "prop:はな" },
];

const kicker = "kicker font-pixel text-[10px] leading-[1.8] text-pink-100/80";
const title = "jiggly-section-title mt-3 font-pixel text-base leading-[1.8] sm:text-xl sm:leading-[1.7]";

function TechSection({
  id,
  label,
  heading,
  note,
  items,
}: {
  id?: string;
  label: string;
  heading: string;
  note: string;
  items: Tech[];
}) {
  return (
    <section
      id={id}
      className="jiggly-card scroll-mt-6 rounded-[1.8rem] p-6 sm:scroll-mt-8 sm:p-8"
    >
      <header className="tech-head">
        <p className={kicker}>{label}</p>
        <h2 className="tech-title jiggly-section-title font-pixel">{heading}</h2>
        <p className="tech-note">{note}</p>
      </header>

      <ul className="tech-grid">
        {items.map((tech) => (
          <li key={tech.name} className="tech-tile" style={{ color: tech.color }}>
            <tech.Icon className="tech-icon" aria-hidden="true" />
            <span>{tech.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function LearningJourney() {
  const spec = avatarSpec(getProfile());
  const specFor = (avatar?: PathItem["avatar"]) =>
    // the "well actually" face: no hat, sword or snack in the way of the glasses
    avatar === "nerd"
      ? { hair: spec.hair, body: spec.body, face: ITEM.f3 }
      : avatar === "grad"
        ? { hair: spec.hair, body: spec.body, face: spec.face, head: ITEM.h4 }
        : avatar === "me"
          ? spec
          : undefined;

  return (
    <Layout>
      <div className="space-y-8">
        <section className="jiggly-card grid items-center gap-6 rounded-[1.8rem] p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <p className={kicker}>Journey Log</p>
            <h1 className="jiggly-section-title mt-4 font-pixel text-lg leading-[1.9] sm:text-3xl sm:leading-[1.7]">
              My Learning Journey
            </h1>
            <p className="mt-6 text-sm leading-7 text-pink-50/84 sm:text-base">
              This is the short version of how I got into programming, what I
              keep coming back to, and what I&apos;m trying to get better at
              right now.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="arc-chip is-cleared">Frontend arc · cleared</span>
              <span className="arc-chip is-now">QA era · now playing</span>
            </div>
          </div>

          <div className="journey-avatar">
            <Snap3D icon="pose:read:1:m" spec={spec} alt="My character reading a book" size={230} />
          </div>
        </section>

        <TechSection
          id="tech-stack"
          label="Main Quest"
          heading="The stack I use the most in test automation"
          note="What I reach for when something needs to be tested, automated, and run again tomorrow."
          items={testAutomationTech}
        />

        <TechSection
          label="Side Quests"
          heading="Stuff I've worked with related to testing software"
          note="Tools from projects and the internship."
          items={testingWorkedWith}
        />

        <TechSection
          label="Core Party"
          heading="The stack I use the most in frontend"
          note="These are the tools I keep coming back to and the ones I feel the most comfortable in."
          items={coreTech}
        />

        <TechSection
          label="Expanded Toolkit"
          heading="Stuff I've worked with"
          note="Tools and workflows I've used in the past."
          items={workedWith}
        />

        <section className="jiggly-card rounded-[1.8rem] p-6 sm:p-8">
          <div className="mb-6 text-center">
            <p className={kicker}>Milestones</p>
            <h2 className={title}>My Learning Path</h2>
          </div>

          <Timeline>
            {learningPathItems.map(({ id, avatar, ...item }) => (
              <TimelineItem key={id} spec={specFor(avatar)} {...item} />
            ))}
          </Timeline>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <section className="jiggly-card rounded-[1.8rem] p-6 sm:p-8">
            <p className={kicker}>Quest Board</p>
            <h2 className={title}>Current Goals</h2>
            <ol className="goal-list">
              {currentGoals.map((goal, i) => {
                const g = typeof goal === "string" ? { text: goal } : goal;
                return (
                  <li key={g.text}>
                    <span className="goal-box" aria-hidden="true" />
                    <span className="goal-no" aria-hidden="true">
                      Q{i + 1}
                    </span>
                    <span className="goal-text">
                      {"Icon" in g ? <g.Icon className="tech-icon goal-icon" style={{ color: g.color }} aria-hidden="true" /> : null}
                      {g.text}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="jiggly-card rounded-[1.8rem] p-6 sm:p-8">
            <p className={kicker}>Training Arc</p>
            <h2 className={title}>What I&apos;m Learning Now</h2>
            <ul className="training-list">
              {learningNow.map((item) => (
                <li key={item.text}>
                  <Snap3D icon={item.icon} alt="" size={44} />
                  <div>
                    <span>{item.text}</span>
                    <span className="training-bar" aria-hidden="true" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </section>

        <section className="jiggly-card connect rounded-[1.8rem] p-6 sm:p-8">
          <div className="connect-avatar">
            <Avatar3D
              spec={spec}
              label="My character waving"
              seq={[
                ["wave", 2.8, 0.7],
                ["idle", 1.2, 2.2],
              ]}
            />
          </div>
          <div>
            <p className={kicker}>Party Invite</p>
            <h2 className={title}>Let&apos;s Connect</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-pink-50/82 sm:text-base">
              If you&apos;re also learning, testing or building frontend stuff,
              feel free to look around. I&apos;ll keep posting what I&apos;m
              working through.
            </p>
            <a className="connect-mail" href="mailto:JuliaLazar42@gmail.com">
              <Snap3D icon="prop:てがみ" alt="" size={48} />
              <span>JuliaLazar42@gmail.com</span>
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
}
