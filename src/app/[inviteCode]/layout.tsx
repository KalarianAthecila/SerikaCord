import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Join a Server on SerikaCord",
  description:
    "Accept a SerikaCord invite and join a community. Chat with members, explore channels, and hang out with friends in real time.",
  path: "/invite",
  keywords: [
    "SerikaCord invite",
    "join server",
    "SerikaCord server invite",
    "community invite",
    "chat invite",
  ],
});

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
