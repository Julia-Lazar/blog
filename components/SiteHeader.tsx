import Image from "next/image";
import SiteNavigation, { NavItem } from "./SiteNavigation";

interface SiteHeaderProps {
  pathname: string;
  navItems: NavItem[];
}

const heroBadges = ["Dreamy UI", "Pink Glow", "Retro Mood"];

export default function SiteHeader({
  pathname,
  navItems,
}: SiteHeaderProps) {
  return (
    <header className="jiggly-shell jiggly-grid mb-6 rounded-[2rem] sm:mb-8 sm:rounded-[2.5rem]">
      <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {heroBadges.map((badge) => (
              <span
                key={badge}
                className="jiggly-chip text-[11px] uppercase tracking-[0.22em] text-pink-100/90"
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="space-y-4">
            <p className="font-pixel text-[10px] leading-[1.9] text-pink-100/85 sm:text-xs">
              Jigglypuff Mode On
            </p>
            <h1 className="jiggly-section-title font-pixel text-lg leading-[1.9] sm:text-3xl sm:leading-[1.75] lg:text-[2.55rem] lg:leading-[1.55]">
              Julia Lazar&apos;s miscellaneous blog
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-pink-50/85 sm:text-base">
              A polished little corner for projects, notes, and learning
              milestones with the soft pink charm of Jigglypuff and a retro
              Pokemon-inspired vibe.
            </p>
          </div>

          <SiteNavigation items={navItems} pathname={pathname} />
        </div>

        <div className="jiggly-panel rounded-[1.8rem] p-4 sm:p-5">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-1">
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                <p className="font-pixel text-[10px] leading-[1.8] text-pink-100/85">
                  Pokedex Entry
                </p>
                <p className="mt-3 text-sm leading-7 text-pink-50/85">
                  Building frontend stories that feel warm, clear, and a bit
                  playful without losing structure or readability.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
                <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-pink-100/70">
                    Palette
                  </p>
                  <p className="mt-2 font-medium text-white">Jiggly Pink</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-pink-100/70">
                    Mood
                  </p>
                  <p className="mt-2 font-medium text-white">Cozy Retro</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-pink-100/70">
                    Energy
                  </p>
                  <p className="mt-2 font-medium text-white">Soft Glow</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-[230px] items-center justify-center">
              <div className="absolute inset-6 rounded-full bg-pink-300/25 blur-3xl" />
              <div className="relative">
                <Image
                  src="/images/jiggly.png"
                  alt="Jigglypuff"
                  width={240}
                  height={240}
                  priority
                  className="h-auto w-full drop-shadow-[0_20px_28px_rgba(0,0,0,0.35)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
