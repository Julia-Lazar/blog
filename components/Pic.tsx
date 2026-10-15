import type { IconType } from "react-icons";
import { FaGitAlt, FaTheaterMasks } from "react-icons/fa";
import {
  SiCypress,
  SiDocker,
  SiJavascript,
  SiJenkins,
  SiNextdotjs,
  SiNuxtdotjs,
  SiPostgresql,
  SiPostman,
  SiReact,
  SiSass,
  SiTypescript,
} from "react-icons/si";
import { TbBrandMysql } from "react-icons/tb";
import Snap3D from "./three/Snap3D";
import FrameAnim, { type Frame } from "./FrameAnim";
import { HelloKitty } from "./icons";

/* One naming scheme for every little picture on the blog:
   "brand:<name>"  a technology logo, e.g. brand:playwright
   "anim:<name>"   a short 3D flip-book: anim:run, anim:lift, anim:baby
   "svg:<name>"    a flat drawing: svg:hellokitty
   anything else   a 3D render (prop:…, item:…, head, pose:…), see Snap3D */

export const BRANDS: Record<string, { Icon: IconType; color: string; label: string }> = {
  playwright: { Icon: FaTheaterMasks, color: "#2EAD33", label: "Playwright" },
  typescript: { Icon: SiTypescript, color: "#3178C6", label: "TypeScript" },
  javascript: { Icon: SiJavascript, color: "#F7DF1E", label: "JavaScript" },
  git: { Icon: FaGitAlt, color: "#F05032", label: "Git" },
  mysql: { Icon: TbBrandMysql, color: "#6DA7D9", label: "MySQL" },
  postgresql: { Icon: SiPostgresql, color: "#699ECA", label: "PostgreSQL" },
  docker: { Icon: SiDocker, color: "#2496ED", label: "Docker" },
  sass: { Icon: SiSass, color: "#CC6699", label: "Sass" },
  postman: { Icon: SiPostman, color: "#FF6C37", label: "Postman" },
  cypress: { Icon: SiCypress, color: "#69D3A7", label: "Cypress" },
  jenkins: { Icon: SiJenkins, color: "#D24939", label: "Jenkins" },
  react: { Icon: SiReact, color: "#61DAFB", label: "React" },
  nextjs: { Icon: SiNextdotjs, color: "#FFFFFF", label: "Next.js" },
  nuxt: { Icon: SiNuxtdotjs, color: "#00DC82", label: "Nuxt.js" },
};

const ANIMS: Record<string, Frame[]> = {
  run: [
    { icon: "pose:run:0", ms: 220 },
    { icon: "pose:run:1", ms: 220 },
  ],
  lift: [
    { icon: "pose:lift:0", ms: 450 },
    { icon: "pose:lift:1", ms: 450 },
  ],
  // two wobbly steps… and a faceplant, then up again
  baby: [
    { icon: "prop:baby-step1", ms: 380 },
    { icon: "prop:baby-step2", ms: 380 },
    { icon: "prop:baby-step1", ms: 380 },
    { icon: "prop:baby-step2", ms: 380 },
    { icon: "prop:baby-wobble", ms: 420 },
    { icon: "prop:baby-fall", ms: 1600 },
    { icon: "prop:baby", ms: 700 },
  ],
};

const SVGS: Record<string, (p: { size: number }) => React.ReactNode> = {
  hellokitty: HelloKitty,
};

export const PIC_EXTRAS = [
  ...Object.keys(SVGS).map((k) => "svg:" + k),
  ...Object.keys(BRANDS).map((b) => "brand:" + b),
  ...Object.keys(ANIMS).map((a) => "anim:" + a),
];

export function picLabel(icon: string) {
  if (icon.startsWith("brand:")) return BRANDS[icon.slice(6)]?.label ?? icon;
  return icon.replace(/^(prop|item|anim|svg):/, "");
}

export default function Pic({
  icon,
  size = 48,
  spec,
  alt = "",
}: {
  icon: string;
  size?: number;
  spec?: Record<string, unknown>;
  alt?: string;
}) {
  if (icon.startsWith("brand:")) {
    const b = BRANDS[icon.slice(6)];
    if (b) {
      return (
        <span className="pic-brand" style={{ width: size, height: size, color: b.color }} role={alt ? "img" : undefined} aria-label={alt || undefined}>
          <b.Icon className="tech-icon" style={{ width: size * 0.78, height: size * 0.78 }} aria-hidden="true" />
        </span>
      );
    }
  }
  if (icon.startsWith("svg:") && SVGS[icon.slice(4)]) {
    const Draw = SVGS[icon.slice(4)];
    return (
      <span className="pic-brand" style={{ width: size, height: size }} role={alt ? "img" : undefined} aria-label={alt || undefined}>
        <Draw size={size} />
      </span>
    );
  }
  if (icon.startsWith("anim:") && ANIMS[icon.slice(5)]) {
    return <FrameAnim frames={ANIMS[icon.slice(5)]} spec={spec} size={size} />;
  }
  return <Snap3D icon={icon} spec={spec} alt={alt} size={size} />;
}
