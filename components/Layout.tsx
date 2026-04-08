"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SiteHeader from "./SiteHeader";
import SiteNavigation, { NavItem } from "./SiteNavigation";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: "/", activePath: "/", label: "Home" },
  { href: "/#posts", label: "Posts" },
  {
    href: "/learning-journey",
    activePath: "/learning-journey",
    label: "Learning Journey",
  },
  { href: "/learning-journey#tech-stack", label: "Tech Stack" },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className="relative min-h-screen text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="jiggly-orb jiggly-orb-pink left-[-4rem] top-16 h-56 w-56 sm:h-72 sm:w-72" />
        <div className="jiggly-orb jiggly-orb-blush right-[-3rem] top-40 h-44 w-44 sm:h-64 sm:w-64" />
        <div className="jiggly-orb jiggly-orb-pink bottom-20 left-1/3 h-36 w-36 sm:h-48 sm:w-48" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {isHomePage ? (
          <SiteHeader pathname={pathname} navItems={navItems} />
        ) : (
          <header className="jiggly-shell mb-6 rounded-[2rem] sm:mb-8 sm:rounded-[2.5rem]">
            <div className="px-5 py-4 sm:px-8 sm:py-6">
              <SiteNavigation compact items={navItems} pathname={pathname} />
            </div>
          </header>
        )}

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
              src="/images/jigglypuff2.png"
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
