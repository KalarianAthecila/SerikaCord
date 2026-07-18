import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Discover Servers — SerikaCord",
  description:
    "Explore and join public communities on SerikaCord. Browse servers by category, find your next favorite community, and connect with people who share your interests.",
  path: "/channels/explore",
  keywords: [
    "SerikaCord servers",
    "discover servers",
    "join community",
    "find servers",
    "server discovery",
    "public servers",
    "communities",
    "gaming servers",
    "chat communities",
  ],
});

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
