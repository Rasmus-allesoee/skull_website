import type { ReactNode } from "react";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function MuseumShell({
  activePath,
  children,
  footerContext,
  mainClassName,
}: {
  activePath: string;
  children: ReactNode;
  footerContext?: string;
  mainClassName?: string;
}) {
  return (
    <div className="site-shell">
      <SiteHeader activePath={activePath} />
      <main id="main-content" className={mainClassName}>
        {children}
      </main>
      <SiteFooter context={footerContext} />
    </div>
  );
}
