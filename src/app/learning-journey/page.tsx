import React from "react";
import Layout from "@/../components/Layout";
import {
  FaReact,
  FaNode,
  FaGitAlt,
  FaBootstrap,
  FaVuejs,
} from "react-icons/fa";
import {
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiGraphql,
} from "react-icons/si";
import { MdApi, MdGroups } from "react-icons/md";
import { TbBrandMysql } from "react-icons/tb";
import Image from "next/image";
import { Timeline } from "@/../components/Timeline";
import { TimelineItem, TimelineItemProps } from "@/../components/TimelineItem";

const learningPathItems: Array<TimelineItemProps & { id: string }> = [
  {
    id: "first-steps",
    side: "right",
    date: "~2014",
    title: "First Steps",
    description:
      "I liked the logic part first. Simple algorithm tasks felt more like little puzzle games than schoolwork.",
    tone: "rose",
    dotClassName: "bg-rose-200",
  },
  {
    id: "cs-studies",
    side: "left",
    date: "2018",
    title: "Computer Science Studies",
    description:
      "This is when coding stopped feeling like just another subject and started feeling like something I actually wanted to do.",
    tone: "pink",
    dotClassName: "bg-pink-300",
  },
  {
    id: "clean-code-principles",
    side: "right",
    date: "2021",
    title: "Clean Code Principles",
    description:
      "I also try to follow good coding practices like SOLID, DRY, and the FIRST principles in testing, because clean code matters a lot.",
    tone: "rose",
    dotClassName: "bg-rose-300",
  },
  {
    id: "the-beginning",
    side: "left",
    date: "2022",
    title: "The Beginning",
    description:
      "I graduated in Computer Science, and frontend coding seemed the easiest for me, so I started learning it more seriously.",
    tone: "pink",
    dotClassName: "bg-pink-300",
  },
  {
    id: "frontend-foundations",
    side: "right",
    date: "2023",
    title: "Frontend Foundations",
    description:
      "A lot of React, components, hooks, and slowly understanding why structure matters so much when a project grows.",
    tone: "rose",
    dotClassName: "bg-rose-400",
  },
  {
    id: "advanced-web-dev",
    side: "left",
    date: "2024 - now",
    title: "Advanced Web Development",
    description:
      "This is where Next.js, TypeScript, and bigger projects started clicking for me. Also where this blog became a real thing instead of a plan.",
    tone: "pink",
    dotClassName: "bg-pink-400",
  },
  {
    id: "qa-engineer-internship",
    side: "right",
    date: "2026",
    title: "QA Engineer Internship",
    description:
      "A newer chapter that keeps pushing me to think more about testing, edge cases, and what the product feels like when something breaks.",
    tone: "rose",
    dotClassName: "bg-rose-400",
  },
];

const coreTech = [
  { name: "React", Icon: FaReact, color: "#61DAFB" },
  { name: "Next.js", Icon: SiNextdotjs, color: "#FFFFFF" },
  { name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
  { name: "Tailwind CSS", Icon: SiTailwindcss, color: "#06B6D4" },
  { name: "Node.js", Icon: FaNode, color: "#63B65A" },
  { name: "Git", Icon: FaGitAlt, color: "#F05032" },
];

const workedWith = [
  { name: "REST API", Icon: MdApi, color: "#FF8A5C" },
  { name: "GraphQL", Icon: SiGraphql, color: "#E10098" },
  { name: "MySQL", Icon: TbBrandMysql, color: "#6DA7D9" },
  { name: "Bootstrap", Icon: FaBootstrap, color: "#9A70FF" },
  { name: "Vue.js", Icon: FaVuejs, color: "#63D0A0" },
  { name: "Scrum", Icon: MdGroups, color: "#4BC2E6" },
];

const currentGoals = [
  "Keep this blog alive and keep posting when I learn something worth sharing.",
  "Get better at TypeScript without turning everything into overkill.",
  "Build projects that feel useful, not just nice in screenshots.",
  "Get more confident with backend basics and databases.",
  "Keep leveling up in QA and testing, not only frontend.",
  "Contribute to open source once I stop overthinking it.",
];

const learningNow = [
  "React patterns I actually understand and can reuse later.",
  "Next.js routing, rendering, and all the small App Router details.",
  "Writing cleaner tests and thinking more like a QA engineer.",
  "CSS details, motion, and making interfaces feel less generic.",
  "Performance stuff I used to ignore.",
  "Backend basics whenever my frontend curiosity spills over.",
];

export default function LearningJourney() {
  return (
    <Layout>
      <div className="space-y-8">
        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="jiggly-card rounded-[1.8rem] p-6 sm:p-8">
            <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/80 sm:text-xs">
              Journey Log
            </p>
            <h1 className="jiggly-section-title mt-4 font-pixel text-lg leading-[1.9] sm:text-3xl sm:leading-[1.7]">
              My Learning Journey
            </h1>
            <p className="mt-6 text-sm leading-7 text-pink-50/84 sm:text-base">
              This is the short version of how I got into programming, what I
              keep coming back to, and what I&apos;m trying to get better at
              right now.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="jiggly-chip text-sm">Frontend</span>
              <span className="jiggly-chip text-sm">QA era</span>
              <span className="jiggly-chip text-sm">Pink blog</span>
            </div>

            <div className="relative mt-6 mx-auto w-full max-w-[320px] overflow-hidden rounded-[1.6rem]">
              <div className="absolute inset-4 rounded-full bg-pink-300/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5 p-3">
                <Image
                  src="/images/JigglyStudy.jpg"
                  alt="JigglyStudy"
                  className="block h-auto w-full rounded-[1.2rem] object-contain shadow-lg [transform:scaleX(-1)]"
                  width={520}
                  height={520}
                />
              </div>
            </div>
          </div>

          <section
            id="about"
            className="jiggly-card scroll-mt-6 rounded-[1.8rem] p-6 sm:scroll-mt-8 sm:p-8"
          >
            <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/80">
              About Me
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
              About Me
            </h2>
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <p className="text-sm leading-7 text-pink-50/84 sm:text-base">
                  Hi, I&apos;m Julia. I mostly write about frontend, the
                  projects I&apos;m building, and the stuff I&apos;m figuring
                  out as I go.
                </p>
                <p className="text-sm leading-7 text-pink-50/84 sm:text-base">
                  I learn best by making real things and then working out what
                  could be better. This blog is where I keep the useful parts.
                </p>
                <p className="text-sm leading-7 text-pink-50/84 sm:text-base">
                  When I&apos;m not coding, I&apos;m usually playing video games
                  or board games, falling into a Japanese pop culture rabbit
                  hole, or playing tennis.
                </p>
              </div>

              <div className="relative mx-auto w-full max-w-[220px] overflow-hidden rounded-[1.6rem]">
                <div className="absolute inset-4 rounded-full bg-pink-300/20 blur-3xl" />
                <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5 p-3">
                  <Image
                    src="/images/the-night-garden-makka-pakka.gif"
                    alt="Makka Pakka"
                    className="block h-auto w-full rounded-[1.2rem] object-contain shadow-lg"
                    width={400}
                    height={400}
                  />
                </div>
              </div>
            </div>
          </section>
        </section>

        <section
          id="tech-stack"
          className="jiggly-card scroll-mt-6 rounded-[1.8rem] p-6 sm:scroll-mt-8 sm:p-8"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/80">
                Core Party
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                The stack I use the most
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-pink-50/74">
              These are the tools I keep coming back to and the ones I feel the
              most comfortable in.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {coreTech.map((tech) => (
              <div
                key={tech.name}
                className="flex min-h-[76px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/5 p-3 shadow-lg"
              >
                <div className="flex items-center justify-center gap-3 text-center">
                  <tech.Icon
                    className="text-3xl"
                    style={{ color: tech.color }}
                  />
                  <div className="text-center">
                    <p
                      className="text-lg font-semibold"
                      style={{ color: tech.color }}
                    >
                      {tech.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="jiggly-card rounded-[1.8rem] p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/80">
                Expanded Toolkit
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                Stuff I&apos;ve worked with
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-pink-50/74">
              Tools and workflows I&apos;ve used enough to have at least a few
              opinions about.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workedWith.map((tech) => (
              <div
                key={tech.name}
                className="flex min-h-[76px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/5 p-3 shadow-lg"
              >
                <div className="flex items-center justify-center gap-3 text-center">
                  <tech.Icon
                    className="text-3xl"
                    style={{ color: tech.color }}
                  />
                  <div className="text-center">
                    <p
                      className="text-lg font-semibold"
                      style={{ color: tech.color }}
                    >
                      {tech.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="jiggly-card rounded-[1.8rem] p-6 sm:p-8">
          <div className="mb-6 text-center">
            <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/80">
              Milestones
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              My Learning Path
            </h2>
          </div>

          <Timeline>
            {learningPathItems.map(({ id, ...item }) => (
              <TimelineItem key={id} {...item} />
            ))}
          </Timeline>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <section className="jiggly-card rounded-[1.8rem] p-6 sm:p-8">
            <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/80">
              Current Goals
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
              Current Goals
            </h2>
            <ul className="mt-6 space-y-3 list-none pl-0">
              {currentGoals.map((goal) => (
                <li
                  key={goal}
                  className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-pink-50/82 sm:text-base"
                >
                  {goal}
                </li>
              ))}
            </ul>
          </section>

          <section className="jiggly-card rounded-[1.8rem] p-6 sm:p-8">
            <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/80">
              What I&apos;m Learning Now
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
              What I&apos;m Learning Now
            </h2>
            <ul className="mt-6 space-y-3 list-none pl-0">
              {learningNow.map((item) => (
                <li
                  key={item}
                  className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-pink-50/82 sm:text-base"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </section>

        <section className="jiggly-card rounded-[1.8rem] p-6 sm:p-8">
          <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/80">
            Let&apos;s Connect
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
            Let&apos;s Connect
          </h2>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-pink-50/82 sm:text-base">
            If you&apos;re also learning, building frontend stuff, or you just
            like this weird pink corner of the internet, feel free to look
            around. I&apos;ll keep posting what I&apos;m working through.
          </p>
        </section>
      </div>
    </Layout>
  );
}
