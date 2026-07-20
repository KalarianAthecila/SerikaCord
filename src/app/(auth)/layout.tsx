import { buildMetadata } from "@/lib/seo";
import AuthLayoutClient from "./AuthLayoutClient";

export const metadata = buildMetadata({
  title: "Sign In to SerikaCord",
  description:
    "Log in or create your SerikaCord account. Join communities, chat with friends, and discover new servers on a modern, free messaging platform.",
  path: "/login",
  keywords: [
    "SerikaCord login",
    "SerikaCord sign in",
    "SerikaCord register",
    "create account",
    "chat app login",
  ],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
