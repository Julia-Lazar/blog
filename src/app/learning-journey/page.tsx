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
      "First encounter with writing algorithms on paper in school 📝",
    tone: "purple",
    dotClassName: "bg-purple-200",
  },
  {
    id: "cs-studies",
    side: "left",
    date: "2018",
    title: "Computer Science Studies",
    description:
      "First year of computer science studies - this was when I first took coding seriously 🤓",
    tone: "pink",
    dotClassName: "bg-pink-300",
  },
  {
    id: "the-beginning",
    side: "right",
    date: "2022",
    title: "The Beginning",
    description:
      "Started my coding journey with HTML, CSS, and JavaScript. Fell in love with creating interactive web experiences.",
    tone: "purple",
    dotClassName: "bg-purple-300",
  },
  {
    id: "frontend-foundations",
    side: "left",
    date: "2023",
    title: "Frontend Foundations",
    description:
      "Mastered React and component-based architecture. Learned about state management, hooks, and building responsive user interfaces.",
    tone: "pink",
    dotClassName: "bg-pink-400",
  },
  {
    id: "advanced-web-dev",
    side: "right",
    date: "2024 - Present",
    title: "Advanced Web Development",
    description:
      "Building full-stack applications with Next.js and exploring modern web technologies. Creating this blog to share my journey and help others learn.",
    tone: "purple",
    dotClassName: "bg-purple-400",
  },
];

export default function LearningJourney() {
  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-pink-200 via-purple-200 to-pink-100 bg-clip-text text-transparent">
          My Learning Journey
        </h1>

        <section className="mb-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 className="text-2xl font-semibold mb-4 text-pink-100">
            About Me
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <p className="text-base leading-relaxed mb-4 text-white">
                Hi! 👋 I'm a passionate developer on a continuous journey of
                learning and growth. This blog is my digital garden 🌱 where I
                document my experiences, discoveries, and the lessons I've
                learned along the way in the world of web development.
              </p>
              <p className="text-base leading-relaxed mb-4 text-white">
                I believe in learning by doing 💪, sharing knowledge with the
                community 🤝, and constantly pushing the boundaries of what I
                can create with code 💻.
              </p>
              <p className="text-base leading-relaxed text-white">
                When I'm not coding, you'll find me immersed in video games 🎮
                and board games 🎲, exploring the rich world of Japanese pop
                culture 🇯🇵✨, or enjoying a good game of tennis 🎾.
              </p>
            </div>
            <div className="md:w-64 w-full flex justify-center md:justify-end">
              <Image
                src="/images/the-night-garden-makka-pakka.gif"
                alt="Makka Pakka"
                className="rounded-xl shadow-lg border-2 border-pink-300/30 max-w-full h-auto"
                width={400}
                height={400}
              />
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-pink-100">
            🧰 My Core Tech Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "React", Icon: FaReact, color: "#61DAFB" },
              { name: "Next.js", Icon: SiNextdotjs, color: "#FFFFFF" },
              { name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
              { name: "Tailwind CSS", Icon: SiTailwindcss, color: "#06B6D4" },
              { name: "Node.js", Icon: FaNode, color: "#339933" },
              { name: "Git", Icon: FaGitAlt, color: "#F05032" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm p-4 rounded-lg text-center font-semibold shadow-lg hover:shadow-pink-500/30 transition-all duration-300 border border-pink-300/20 hover:scale-105 flex items-center justify-center gap-2"
              >
                <tech.Icon className="text-2xl" style={{ color: tech.color }} />
                <span style={{ color: tech.color }}>{tech.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-pink-100">
            🛠️ Technologies I've Worked With
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "REST API", Icon: MdApi, color: "#FF6C37" },
              { name: "GraphQL", Icon: SiGraphql, color: "#E10098" },
              { name: "MySQL", Icon: TbBrandMysql, color: "#4479A1" },
              { name: "Bootstrap", Icon: FaBootstrap, color: "#7952B3" },
              { name: "Vue.js", Icon: FaVuejs, color: "#4FC08D" },
              { name: "Scrum", Icon: MdGroups, color: "#009FDA" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm p-4 rounded-lg text-center font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300 border border-purple-300/20 hover:scale-105 flex items-center justify-center gap-2"
              >
                <tech.Icon className="text-2xl" style={{ color: tech.color }} />
                <span style={{ color: tech.color }}>{tech.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 className="text-2xl font-semibold mb-6 text-pink-100 text-center">
            🛣️ My Learning Path
          </h2>
          <Timeline>
            {learningPathItems.map(({ id, ...item }) => (
              <TimelineItem key={id} {...item} />
            ))}
          </Timeline>
        </section>

        <section className="mb-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 className="text-2xl font-semibold mb-4 text-pink-100">
            🎯 Current Goals
          </h2>
          <ul className="space-y-3 list-none pl-0">
            <li className="flex items-start">
              <span className="text-purple-200 mr-2">✓</span>
              <span className="text-white">
                Build and maintain a technical blog to share knowledge
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-200 mr-2">✓</span>
              <span className="text-white">
                Contribute to open-source projects
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-200 mr-2">✓</span>
              <span className="text-white">
                Master advanced TypeScript patterns
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-200 mr-2">✓</span>
              <span className="text-white">
                Explore backend development with Node.js and databases
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-200 mr-2">✓</span>
              <span className="text-white">
                Build projects that solve real-world problems
              </span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-pink-100">
            👩🏻‍💻 What I'm Learning Now 📓✍🏻💡
          </h2>
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-pink-300/20">
            <p className="text-base mb-3 text-pink-100">
              Currently diving deep into:
            </p>
            <ul className="space-y-2 ml-0 list-disc text-white">
              <li>
                I’m shifting my focus from learning Vue to specializing fully in
                React.
              </li>
              <li>
                Server-side rendering and static site generation with Next.js
              </li>
              <li>Advanced CSS techniques and animations</li>
              <li>Writing clean, maintainable code</li>
              <li>Best practices in web performance optimization</li>
            </ul>
          </div>
        </section>

        <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 className="text-2xl font-semibold mb-4 text-pink-100">
            🤝Let's Connect
          </h2>
          <p className="text-base leading-relaxed text-white">
            I'm always excited to connect with fellow developers and learners!
            Whether you want to discuss web development, share ideas, or
            collaborate on projects, feel free to reach out. Follow my blog for
            regular updates on my learning journey and technical discoveries.
          </p>
        </section>
      </div>
    </Layout>
  );
}
