"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  Moon,
  Volume2,
  Lock,
  Languages,
  Accessibility,
  Bug,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  description?: string;
  badge?: string;
  danger?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

export function MobileProfileView() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const statusColors: Record<string, string> = {
    online: "#8B5CF6",
    idle: "#A78BFA",
    dnd: "#EF4444",
    offline: "#555555",
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const settingsSections: SettingsSection[] = [
    {
      title: "Account",
      items: [
        { icon: User, label: "My Account", href: "/channels/settings/account" },
        { icon: Shield, label: "Privacy & Safety", href: "/channels/settings/privacy" },
        { icon: Lock, label: "Authorized Apps", href: "/channels/settings/apps" },
      ],
    },
    {
      title: "App Settings",
      items: [
        { icon: Bell, label: "Notifications", href: "/channels/settings/notifications" },
        { icon: Palette, label: "Appearance", href: "/channels/settings/appearance" },
        { icon: Accessibility, label: "Accessibility", href: "/channels/settings/accessibility" },
        { icon: Volume2, label: "Voice & Video", href: "/channels/settings/voice" },
        { icon: Languages, label: "Language", href: "/channels/settings/language" },
      ],
    },
    {
      title: "Premium",
      items: [
        {
          icon: Sparkles,
          label: "SerikaCord Premium",
          href: "/channels/settings/premium",
          badge: user?.isPremium ? "Active" : "Upgrade",
        },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help & Support", href: "/channels/settings/help" },
        { icon: Bug, label: "Report a Bug", href: "/channels/settings/bug-report" },
        { icon: MessageSquare, label: "Give Feedback", href: "/channels/settings/feedback" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)]">
      {/* Header */}
      <header className="flex-shrink-0 px-4 pt-3 pb-2 safe-area-top">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">You</h1>
          <button
            onClick={() => router.push("/channels/settings")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-card)] text-[var(--text-primary)] active:scale-95 active:bg-[var(--bg-hover)] transition-all touch-manipulation"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="pb-24">
          {/* Profile Card */}
          <div className="px-5 mb-6">
            <div className="relative rounded-3xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              {/* Banner */}
              {user?.banner ? (
                <div
                  className="h-28 bg-cover bg-center"
                  style={{ backgroundImage: `url(${user.banner})` }}
                />
              ) : (
                <div className="h-28 bg-gradient-to-br from-[var(--app-accent)] to-[var(--app-accent)] opacity-80" />
              )}

              {/* Profile Info */}
              <div className="relative px-5 pt-14 pb-5 -mt-10">
                {/* Avatar */}
                <div className="absolute -top-12 left-5">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-[6px] border-[var(--bg-card)] shadow-xl">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-[var(--app-accent)] text-white text-3xl font-bold">
                        {(user?.displayName || user?.username || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className="absolute bottom-2 right-2 w-5 h-5 rounded-full border-[4px] border-[var(--bg-card)]"
                      style={{ backgroundColor: statusColors[user?.status || "online"] }}
                    />
                  </div>
                </div>

                {/* Edit Profile Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => router.push("/channels/settings/account")}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] text-[var(--text-primary)] text-sm font-semibold transition-all active:scale-95 border border-[var(--border-subtle)]"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Name & Status */}
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] leading-tight">
                      {user?.displayName || user?.username}
                    </h2>
                    {user?.isPremium && (
                      <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                    )}
                  </div>
                  <p className="text-[var(--text-muted)] font-medium">@{user?.username}</p>
                  {user?.bio && (
                    <p className="text-[var(--text-secondary)] text-sm mt-3 leading-relaxed">{user.bio}</p>
                  )}
                </div>

                {/* Status Selector */}
                <button
                  onClick={() => router.push("/channels/settings/status")}
                  className="w-full mt-5 flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--bg-app)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-colors active:scale-95"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: statusColors[user?.status || "online"] }}
                  />
                  <span className="text-[var(--text-primary)] font-medium capitalize">{user?.status || "Online"}</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] ml-auto" />
                </button>
              </div>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="px-5 space-y-8">
            {settingsSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] mb-3 px-2 tracking-wider">
                  {section.title}
                </h3>
                <div className="rounded-2xl bg-[var(--bg-card)] overflow-hidden divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)]">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => item.onClick?.() || (item.href && router.push(item.href))}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-hover)] transition-all active:bg-[var(--bg-active)]",
                          item.danger && "text-red-500"
                        )}
                      >
                        <Icon className={cn(
                          "w-5 h-5",
                          item.danger ? "text-red-500" : "text-[var(--text-muted)]"
                        )} />
                        <span className={cn(
                          "flex-1 text-left font-medium",
                          item.danger ? "text-red-500" : "text-[var(--text-primary)]"
                        )}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-bold",
                            item.badge === "Active"
                              ? "bg-[var(--app-accent)]/20 text-[var(--app-accent)]"
                              : "bg-[#F59E0B]/20 text-[#F59E0B]"
                          )}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={cn(
                          "w-4 h-4",
                          item.danger ? "text-red-500/50" : "text-[var(--text-muted)]"
                        )} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Logout Button */}
            <div className="rounded-2xl bg-[var(--bg-card)] overflow-hidden border border-[var(--border-subtle)]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-hover)] transition-colors text-red-500 active:bg-[var(--bg-active)]"
              >
                <LogOut className="w-5 h-5" />
                <span className="flex-1 text-left font-medium">Log Out</span>
                <ChevronRight className="w-4 h-4 text-red-500/50" />
              </button>
            </div>

            {/* App Info */}
            <div className="text-center py-6">
              <p className="text-xs font-medium text-[var(--text-muted)]">SerikaCord v1.0.0 (Beta)</p>
              <p className="text-xs font-medium text-[var(--text-muted)] mt-1">Made with 💜 in Tokyo</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
