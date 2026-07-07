import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/channels/",
        "/dm/",
        "/_next/",
        "/invite/",
        "/widget/",
      ],
    },
    sitemap: "https://serika.cc/sitemap.xml",
  };
}
