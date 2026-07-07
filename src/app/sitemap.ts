import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
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
    { path: "/developers/applications", priority: 0.6 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route.priority,
  }));
}
