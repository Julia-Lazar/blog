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
    "transition-all duration-200 hover:text-white",
    isActive
      ? "translate-y-[-2px] scale-[1.03] border-pink-50/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.26),transparent_55%),linear-gradient(135deg,rgba(255,188,222,0.76),rgba(176,51,111,0.98))] text-white shadow-[0_18px_36px_rgba(28,0,36,0.42)] ring-2 ring-pink-100/45"
      : "text-pink-100/90 hover:scale-[1.01]",
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
