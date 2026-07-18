import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { cdnImage } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}): Promise<Metadata> {
  const { inviteCode } = await params;

  let serverName = "Join a Server on SerikaCord";
  let serverDesc = "Accept a SerikaCord invite and join a community. Chat with members, explore channels, and hang out with friends in real time.";
  let serverIcon: string | null = null;
  let serverBanner: string | null = null;
  let memberCount = 0;

  try {
    const { db, schema } = await import("@/lib/db/postgres");
    const { eq } = await import("drizzle-orm");
    const rows = await db
      .select({
        serverId: schema.invites.serverId,
      })
      .from(schema.invites)
      .where(eq(schema.invites.code, inviteCode))
      .limit(1);

    if (rows.length > 0 && rows[0].serverId) {
      const serverRows = await db
        .select({
          name: schema.servers.name,
          description: schema.servers.description,
          icon: schema.servers.icon,
          banner: schema.servers.banner,
          discoveryDescription: schema.servers.discoveryDescription,
          memberCount: schema.servers.memberCount,
        })
        .from(schema.servers)
        .where(eq(schema.servers.id, rows[0].serverId))
        .limit(1);

      if (serverRows.length > 0) {
        const s = serverRows[0];
        serverName = `${s.name} — SerikaCord`;
        serverDesc =
          s.discoveryDescription ||
          s.description ||
          `Join ${s.name} on SerikaCord. Chat, voice, and hang out with ${s.memberCount || 0} members.`;
        serverIcon = s.icon;
        serverBanner = s.banner;
        memberCount = s.memberCount || 0;
      }
    }
  } catch {
    // fall through with defaults
  }

  const ogImage = serverBanner
    ? cdnImage(serverBanner)
    : serverIcon
      ? cdnImage(serverIcon)
      : undefined;

  const descWithCount = memberCount > 0
    ? `${serverDesc} ${memberCount.toLocaleString()} members.`
    : serverDesc;

  return buildMetadata({
    title: serverName,
    description: descWithCount,
    path: `/${inviteCode}`,
    image: ogImage,
    keywords: [
      "SerikaCord invite",
      "join server",
      "SerikaCord server invite",
      "community invite",
      "chat invite",
    ],
  });
}

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
