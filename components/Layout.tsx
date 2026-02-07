"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const navLinkClass = (href: string) => {
    const isActive = pathname === href;
    return [
      "text-pink-200 font-semibold transition-all duration-300 no-underline",
      "hover:text-white hover:underline hover:scale-105",
      isActive ? "text-white underline scale-105" : "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Animated starry background */}
      <div className="background-container">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        {/* Header */}
        <header className="mb-8 sm:mb-12 text-center">
          <div className="inline-block bg-white/10 backdrop-blur-lg rounded-3xl px-8 sm:px-12 py-5 sm:py-6 shadow-2xl mb-4 sm:mb-6 border-2 border-pink-300/30">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
              ✨ Julia's Tech Blog ✨
            </h1>
          </div>
          <nav className="mt-6 text-sm sm:text-base md:text-lg flex flex-wrap justify-center gap-2 sm:gap-0">
            <Link
              href="/"
              className={`mr-3 ${navLinkClass("/")}`}
            >
              Projects
            </Link>
            <span className="text-purple-300 mx-3 sm:inline">|</span>
            <Link
              href="/learning-journey"
              className={`ml-3 ${navLinkClass("/learning-journey")}`}
            >
              Learning Journey
            </Link>
          </nav>
        </header>

        {/* Main content */}
        <main className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-8 border border-white/20">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t-2 border-pink-400/30 text-center">
          <p className="text-base text-white font-medium mb-2">
            Contact:{" "}
            <a
              href="mailto:JuliaLazar42@gmail.com"
              className="text-pink-200 hover:text-white transition-colors underline"
            >
              JuliaLazar42@gmail.com
            </a>
          </p>
          <p className="text-sm text-pink-100 font-medium">
            © {new Date().getFullYear()} Julia Lazar ✨
          </p>
        </footer>
      </div>

      {/* Jigglypuff images at bottom corners of screen */}
      <div className="absolute bottom-0 left-0 z-10 pointer-events-none hidden sm:block">
        <Image
          src="/images/jigglypuff2.png"
          alt="Jigglypuff 2"
          width={150}
          height={150}
          className="sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px]"
          style={{
            mixBlendMode: "normal",
            background: "transparent",
          }}
        />
      </div>

      <div className="absolute bottom-0 right-0 z-10 pointer-events-none hidden sm:block">
        <Image
          src="/images/jiggly.png"
          alt="Jigglypuff"
          width={150}
          height={150}
          className="sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px]"
          style={{
            mixBlendMode: "normal",
            background: "transparent",
          }}
        />
      </div>
    </div>
  );
};

export default Layout;
