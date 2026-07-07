import { buildMetadata } from "@/lib/seo";
import DevelopersLayoutClient from "./DevelopersLayoutClient";

export const metadata = buildMetadata({
  title: "Developer Portal",
  description:
    "Build bots, apps, and integrations for SerikaCord. Manage applications, explore API documentation, and publish to the app directory.",
  path: "/developers",
  keywords: [
    "SerikaCord developers",
    "SerikaCord API",
    "bot development",
    "app directory",
    "webhooks",
    "OAuth2",
    "slash commands",
  ],
});

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DevelopersLayoutClient>{children}</DevelopersLayoutClient>;
}
