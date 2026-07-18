import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { cdnImage } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serverId: string }>;
}): Promise<Metadata> {
  const { serverId } = await params;

  let serverName = "Server";
  let serverDesc = "Join this community on SerikaCord — chat, voice, and hang out.";
  let serverIcon: string | null = null;
  let serverBanner: string | null = null;
  let memberCount = 0;
  let isDiscoverable = false;
  let joinMode = "discoverable";

  try {
    const { db, schema } = await import("@/lib/db/postgres");
    const { eq } = await import("drizzle-orm");
    const rows = await db
      .select({
        name: schema.servers.name,
        description: schema.servers.description,
        icon: schema.servers.icon,
        banner: schema.servers.banner,
        discoveryDescription: schema.servers.discoveryDescription,
        memberCount: schema.servers.memberCount,
        isDiscoverable: schema.servers.isDiscoverable,
        joinMode: schema.servers.joinMode,
      })
      .from(schema.servers)
      .where(eq(schema.servers.id, serverId))
      .limit(1);

    if (rows.length > 0) {
      const s = rows[0];
      serverName = s.name;
      serverDesc =
        s.discoveryDescription ||
        s.description ||
        `${s.name} is a community on SerikaCord. Join to chat, voice, and hang out with ${s.memberCount || 0} members.`;
      serverIcon = s.icon;
      serverBanner = s.banner;
      memberCount = s.memberCount || 0;
      isDiscoverable = s.isDiscoverable ?? false;
      joinMode = s.joinMode || "discoverable";
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

  const keywords = [
    serverName,
    "SerikaCord",
    "SerikaCord server",
    "community",
    "chat",
    "voice chat",
    "join server",
  ];

  return buildMetadata({
    title: `${serverName} — SerikaCord`,
    description: descWithCount,
    path: `/channels/${serverId}`,
    image: ogImage,
    keywords,
    type: "website",
  });
}

export default function ServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
