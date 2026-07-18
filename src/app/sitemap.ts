import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://serika.cc";

  const routes = [
    { path: "/", priority: 1.0 },
    { path: "/login", priority: 0.6 },
    { path: "/register", priority: 0.6 },
    { path: "/download", priority: 0.8 },
    { path: "/terms", priority: 0.4 },
    { path: "/privacy", priority: 0.4 },
    { path: "/guidelines", priority: 0.4 },
    { path: "/developers", priority: 0.7 },
    { path: "/developers/docs/intro", priority: 0.6 },
    { path: "/developers/docs/getting-started", priority: 0.6 },
    { path: "/developers/docs/bots/overview", priority: 0.6 },
    { path: "/developers/docs/bots/interactions", priority: 0.6 },
    { path: "/developers/docs/bots/slash-commands", priority: 0.6 },
    { path: "/developers/docs/topics/oauth2", priority: 0.6 },
    { path: "/developers/docs/topics/permissions", priority: 0.6 },
    { path: "/developers/docs/topics/gateway", priority: 0.6 },
    { path: "/developers/docs/topics/webhooks", priority: 0.6 },
    { path: "/developers/docs/topics/rate-limits", priority: 0.5 },
    { path: "/developers/docs/topics/threads", priority: 0.5 },
    { path: "/developers/docs/topics/stickers", priority: 0.5 },
    { path: "/developers/docs/topics/reactions", priority: 0.5 },
    { path: "/developers/docs/topics/tts", priority: 0.4 },
    { path: "/developers/applications", priority: 0.6 },
    { path: "/channels/explore", priority: 0.8 },
  ];

  const staticEntries = routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route.priority,
  }));

  // Dynamically add discoverable server pages
  const serverEntries: MetadataRoute.Sitemap = [];
  try {
    const { db, schema } = await import("@/lib/db/postgres");
    const { eq } = await import("drizzle-orm");
    const servers = await db
      .select({
        id: schema.servers.id,
        name: schema.servers.name,
        discoverableAt: schema.servers.discoverableAt,
      })
      .from(schema.servers)
      .where(eq(schema.servers.isDiscoverable, true))
      .limit(500);

    for (const s of servers) {
      serverEntries.push({
        url: `${baseUrl}/channels/${s.id}`,
        lastModified: s.discoverableAt ? new Date(s.discoverableAt) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      });
    }
  } catch {
    // If DB fails, just return static entries
  }

  return [...staticEntries, ...serverEntries];
}
