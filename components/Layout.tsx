"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteNavigation, { NavItem } from "./SiteNavigation";
import { Sakura } from "./icons";

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

// the admin panel only works while running the blog locally (npm run dev)
const adminItem: NavItem = { href: "/admin", activePath: "/admin", label: "Admin" };

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const items = process.env.NODE_ENV === "development" ? [...navItems, adminItem] : navItems;

  return (
    <div className="site">
      <div className="topbar">
        <Link href="/" className="brand">
          <Sakura size={26} />
          <span>
            Julka&apos;s <b>QA</b> Log
          </span>
          <span className="brand-jp" lang="ja">
            ユルカの日記
          </span>
        </Link>
        <SiteNavigation items={items} pathname={pathname} />
      </div>

      {/* the home page has no title tile; the heading stays for screen readers and search */}
      {isHomePage ? <h1 className="sr-only">Julia Lazar&apos;s miscellaneous blog</h1> : null}

      <main>{children}</main>

      <footer className="footer">
        <p>
          Contact: <a href="mailto:JuliaLazar42@gmail.com">JuliaLazar42@gmail.com</a>
        </p>
        <p>Copyright {new Date().getFullYear()} Julia Lazar</p>
      </footer>
    </div>
  );
};

export default Layout;
