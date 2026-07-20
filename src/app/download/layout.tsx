import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Download SerikaCord",
  description:
    "Download SerikaCord for Windows, macOS, Linux, and Android. Get the native desktop or mobile app for the best chat, voice, and community experience.",
  path: "/download",
  keywords: [
    "SerikaCord download",
    "SerikaCord desktop app",
    "SerikaCord mobile",
    "Windows download",
    "macOS download",
    "Linux download",
    "Android APK",
  ],
});

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
