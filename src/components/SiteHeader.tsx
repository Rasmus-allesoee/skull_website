import Link from "next/link";

import { siteConfig } from "@/config/site";

export function SiteHeader({ activePath }: { activePath: string }) {
  return (
    <header className="site-header" aria-label="Site header">
      <Link className="wordmark" href="/">
        {siteConfig.name}
      </Link>
      <DesktopNavigation activePath={activePath} />
      <details className="mobile-navigation">
        <summary>Menu</summary>
        <nav aria-label="Mobile navigation">
          <NavigationLinks activePath={activePath} />
        </nav>
      </details>
    </header>
  );
}

function DesktopNavigation({ activePath }: { activePath: string }) {
  return (
    <nav className="desktop-navigation" aria-label="Primary navigation">
      <NavigationLinks activePath={activePath} />
    </nav>
  );
}

function NavigationLinks({ activePath }: { activePath: string }) {
  return (
    <ul>
      {siteConfig.navigation.map((item) => {
        const isCurrent =
          activePath === item.href ||
          (item.href !== "/" && activePath.startsWith(`${item.href}/`));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isCurrent ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
