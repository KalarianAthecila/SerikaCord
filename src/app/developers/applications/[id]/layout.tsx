"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Info,
  Bot,
  Download,
  Smile,
  Webhook,
  KeyRound,
  Users,
  Gift,
  Activity,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useApplication } from "./useApplication";

const tabs = [
  { label: "General Information", href: "information", icon: Info },
  { label: "Bot", href: "bot", icon: Bot },
  { label: "Installation", href: "installation", icon: Download },
  { label: "OAuth2", href: "oauth2", icon: KeyRound },
  { label: "Emoji", href: "emojis", icon: Smile },
  { label: "Webhooks", href: "webhooks", icon: Webhook },
  { label: "App Directory Page", href: "directory", icon: Gift },
  { label: "Analytics", href: "analytics", icon: Activity },
  { label: "Team", href: "team", icon: Users },
];

export default function ApplicationDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const appId = params.id as string;
  const { app, loading } = useApplication(appId);

  const activeTab = pathname?.split("/").pop() || "information";

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/[0.06] bg-[#0d0d0d] flex flex-col shrink-0">
        <div className="p-4 border-b border-white/[0.06]">
          <Link
            href="/developers/applications"
            className="flex items-center gap-2 text-xs text-[#777] hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="size-3" /> All Applications
          </Link>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-[#8B5CF6]" />
              <span className="text-sm text-[#888]">Loading...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6366f1] flex items-center justify-center shrink-0">
                {app?.icon ? (
                  <img src={app.icon} alt="" className="size-10 rounded-lg object-cover" />
                ) : (
                  <Bot className="size-5 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold truncate">{app?.name || "Unnamed"}</h2>
                <p className="text-xs text-[#555] truncate">{app?.id}</p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.href;
            return (
              <Link
                key={tab.href}
                href={`/developers/applications/${appId}/${tab.href}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-0.5",
                  active
                    ? "bg-white/10 text-white"
                    : "text-[#999] hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon className="size-4 shrink-0" />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {app?.verified !== undefined && (
          <div className="p-4 border-t border-white/[0.06]">
            {app.verified ? (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <span className="size-2 rounded-full bg-green-400" /> Verified Bot
              </div>
            ) : (
              <div className="text-xs text-[#666]">
                <p>Not verified</p>
                <p className="mt-1 text-[#555]">
                  Reach 100+ servers to apply for verification.
                </p>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
