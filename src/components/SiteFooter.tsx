import { siteConfig } from "@/config/site";

export function SiteFooter({ context }: { context?: string }) {
  return (
    <footer className="site-footer">
      <p>{context ?? siteConfig.name}</p>
      <p>{siteConfig.copyright}</p>
    </footer>
  );
}
