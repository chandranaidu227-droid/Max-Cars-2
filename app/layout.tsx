import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./bmw-home.css";
import "./bmw-m8-hero.css";
import "./explorer.new.css";
import "./profile-menu.css";
import "./media-v2.css";
import "./explorer-fix.css";
import "./navbar-v2.css";
import "./sell-v2.css";
import "./sell-media.css";
import "./vehicle-image.css";
import "./vehicle-detail-v2.css";
import "./location-support-v2.css";
import "./location-v3.css";
import "./explorer-interaction-fix.css";
import "./max-3d.css";
import "./route-templates.css";
import "./checkout-v2.css";
import "./site-enhancements.css";
import "./corrections-v3.css";
import "./corrections-v4.css";
import "./service-media-v2.css";
import "./requested-fixes-v5.css";
import Shell from "./ShellV2";
import SessionGuard from "./SessionGuard";

export const metadata: Metadata = {
  metadataBase: new URL("https://max-cars-premium.chandranaidu227.chatgpt.site"),
  title: { default: "MAX CARS — Explore. Choose. Drive.", template: "%s · MAX CARS" },
  description: "A premium automotive platform to discover, compare, book and buy exceptional cars in India.",
  applicationName: "MAX CARS",
  openGraph: {
    title: "MAX CARS — Explore. Choose. Drive.",
    description: "A connected, cinematic automotive showroom.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#080a0d" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><SessionGuard><Shell>{children}</Shell></SessionGuard></body></html>;
}
