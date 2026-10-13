import Link from "next/link";

export interface NavItem {
  href: string;
  label: string;
  activePath?: string;
}

interface SiteNavigationProps {
  items: NavItem[];
  pathname: string;
}

export default function SiteNavigation({ items, pathname }: SiteNavigationProps) {
  return (
    <nav aria-label="Site navigation" className="nav">
      {items.map((item) => {
        const isActive = item.activePath === pathname;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={"nav-link" + (isActive ? " is-active" : "")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
