"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/#projects", activePath: "/", label: "Projects" },
  {
    href: "/learning-journey#about",
    activePath: "/learning-journey",
    label: "Learning Journey",
  },
];

const heroBadges = ["Dreamy UI", "Pink Glow", "Retro Mood"];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navLinkClass = (activePath: string) => {
    const isActive = pathname === activePath;

    return [
      "jiggly-button rounded-full px-4 py-3 text-sm font-semibold text-pink-50 no-underline sm:px-5",
      "hover:text-white",
      isActive
        ? "border-pink-100/40 bg-pink-200/15 text-white shadow-[0_14px_30px_rgba(22,0,30,0.28)]"
        : "text-pink-100/90",
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="jiggly-orb jiggly-orb-pink left-[-4rem] top-16 h-56 w-56 sm:h-72 sm:w-72" />
        <div className="jiggly-orb jiggly-orb-blush right-[-3rem] top-40 h-44 w-44 sm:h-64 sm:w-64" />
        <div className="jiggly-orb jiggly-orb-pink bottom-20 left-1/3 h-36 w-36 sm:h-48 sm:w-48" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
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
                  Julia&apos;s Tech Blog
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-pink-50/85 sm:text-base">
                  A polished little corner for projects, notes, and learning
                  milestones with the soft pink charm of Jigglypuff and a retro
                  Pokemon-inspired vibe.
                </p>
              </div>

              <nav className="flex flex-wrap gap-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={
                      pathname === item.activePath ? "page" : undefined
                    }
                    className={navLinkClass(item.activePath)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
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
                  <div className="relative rounded-full border border-white/12 bg-white/6 p-4 shadow-[0_20px_44px_rgba(11,0,16,0.3)]">
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

        <main className="jiggly-panel relative flex-1 rounded-[2rem] p-4 sm:rounded-[2.5rem] sm:p-6 md:p-8 lg:p-10">
          <div className="absolute right-4 top-4 hidden h-24 w-24 rounded-full bg-pink-200/10 blur-3xl sm:block" />
          <div className="relative z-10">{children}</div>
        </main>

        <footer className="relative mt-6 px-2 pb-4 pt-2 text-center">
          <div className="mx-auto max-w-3xl border-t border-white/10 pt-6 text-pink-100/82">
            <p className="text-sm sm:text-base">
              Contact:{" "}
              <a
                href="mailto:JuliaLazar42@gmail.com"
                className="text-pink-100 hover:text-white"
              >
                JuliaLazar42@gmail.com
              </a>
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-pink-100/60 sm:text-sm">
              Copyright {new Date().getFullYear()} Julia Lazar
            </p>
          </div>

          <div className="pointer-events-none absolute -bottom-4 right-0 hidden opacity-75 lg:block">
            <Image
              src="/images/jiggly.png"
              alt="Decorative Jigglypuff"
              width={170}
              height={170}
              className="h-auto w-[170px] rotate-[-8deg]"
            />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
