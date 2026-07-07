import { buildMetadata } from "@/lib/seo";
import ChannelsLayoutClient from "./ChannelsLayoutClient";

export const metadata = buildMetadata({
  title: "App — SerikaCord",
  description:
    "Open the SerikaCord app. Chat with friends, join servers, explore communities, manage settings, and stay connected in real time.",
  path: "/channels/me",
  keywords: [
    "SerikaCord app",
    "chat app",
    "messaging",
    "servers",
    "direct messages",
    "community",
  ],
});

export default function ChannelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChannelsLayoutClient>{children}</ChannelsLayoutClient>;
}
