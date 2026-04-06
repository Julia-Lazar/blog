import Link from "next/link";

export interface NavItem {
  href: string;
  label: string;
  activePath?: string;
}

interface SiteNavigationProps {
  items: NavItem[];
  pathname: string;
  compact?: boolean;
}

function navLinkClass(isActive: boolean) {
  return [
    "jiggly-button rounded-full px-4 py-3 text-sm font-semibold text-pink-50 no-underline sm:px-5",
    "hover:text-white",
    isActive
      ? "border-pink-100/40 bg-pink-200/15 text-white shadow-[0_14px_30px_rgba(22,0,30,0.28)]"
      : "text-pink-100/90",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function SiteNavigation({
  items,
  pathname,
  compact = false,
}: SiteNavigationProps) {
  return (
    <nav
      aria-label="Site navigation"
      className={[
        "flex flex-wrap gap-3",
        compact ? "justify-center sm:justify-start" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((item) => {
        const isActive = item.activePath === pathname;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={navLinkClass(isActive)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
