"use client";

import { useEffect, useMemo, useState } from "react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import Link from "next/link";

const sectionTitles: Record<string, string> = {
  privacy: "Privacy & Safety",
  apps: "Authorized Apps",
  notifications: "Notifications",
  appearance: "Appearance",
  accessibility: "Accessibility",
  voice: "Voice & Video",
  language: "Language",
  premium: "SerikaCord Premium",
  help: "Help & Support",
  "bug-report": "Report a Bug",
  feedback: "Give Feedback",
  status: "Status",
};

const statusOptions = ["online", "idle", "dnd", "offline"] as const;

type SettingsObject = Record<string, any>;

export default function MobileSettingsSectionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { applyUserSettingsPatch } = useTheme();
  const section = (params.section as string) || "privacy";

  const [settings, setSettings] = useState<SettingsObject | null>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [supportText, setSupportText] = useState("");

  const title = sectionTitles[section] || "Settings";

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, appsRes, devicesRes, connectionsRes] = await Promise.all([
        fetch("/api/users/me/settings"),
        fetch("/api/users/me/authorized-apps"),
        fetch("/api/users/me/devices"),
        fetch("/api/users/me/connections"),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings || {});
        applyUserSettingsPatch(data.settings || {});
      }
      if (appsRes.ok) {
        const data = await appsRes.json();
        setApps(data.apps || []);
      }
      if (devicesRes.ok) {
        const data = await devicesRes.json();
        setDevices(data.devices || []);
      }
      if (connectionsRes.ok) {
        const data = await connectionsRes.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error("Failed to load settings section:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [section]);

  const saveSettings = async (patch: SettingsObject) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/users/me/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: patch }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSettings((prev) => ({ ...(prev || {}), ...patch }));
      applyUserSettingsPatch(patch);
      toast.success("Settings saved");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const statusSection = useMemo(() => {
    if (section !== "status") return null;
    return (
      <div className="space-y-3">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={async () => {
              const response = await fetch("/api/users/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
              });
              if (response.ok) {
                updateUser({ status: status as any });
                toast.success(`Status set to ${status}`);
              } else {
                toast.error("Failed to update status");
              }
            }}
            className={`w-full p-4 rounded-xl border text-left capitalize ${user?.status === status ? "bg-[var(--bg-active)] border-[var(--app-accent)] text-[var(--text-primary)]" : "bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]"}`}
          >
            {status}
          </button>
        ))}
      </div>
    );
  }, [section, user?.status, updateUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--bg-app)]">
        <Loader2 className="w-8 h-8 text-[var(--app-accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] text-[var(--text-primary)]">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border-subtle)]">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-hover)]">
          <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
        </button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">{title}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {section === "privacy" && settings && (
          <div className="space-y-4">
            <ToggleRow
              label="Allow direct messages"
              checked={settings.privacy?.directMessages === "everyone"}
              onChange={(checked) =>
                saveSettings({ privacy: { ...(settings.privacy || {}), directMessages: checked ? "everyone" : "friends" } })
              }
            />
            <ToggleRow
              label="Allow friend requests"
              checked={settings.privacy?.friendRequests !== "none"}
              onChange={(checked) =>
                saveSettings({ privacy: { ...(settings.privacy || {}), friendRequests: checked ? "everyone" : "none" } })
              }
            />
            <ToggleRow
              label="Activity status"
              checked={Boolean(settings.privacy?.showActivity)}
              onChange={(checked) => saveSettings({ privacy: { ...(settings.privacy || {}), showActivity: checked } })}
            />
            <ToggleRow
              label="Crash reports"
              checked={Boolean(settings.dataPrivacy?.allowCrashReports)}
              onChange={(checked) => saveSettings({ dataPrivacy: { ...(settings.dataPrivacy || {}), allowCrashReports: checked } })}
            />
          </div>
        )}

        {section === "notifications" && settings && (
          <div className="space-y-4">
            <ToggleRow label="Desktop notifications" checked={Boolean(settings.notifications?.desktop)} onChange={(checked) => saveSettings({ notifications: { ...(settings.notifications || {}), desktop: checked } })} />
            <ToggleRow label="Sounds" checked={Boolean(settings.notifications?.sounds)} onChange={(checked) => saveSettings({ notifications: { ...(settings.notifications || {}), sounds: checked } })} />
            <ToggleRow label="Mentions" checked={Boolean(settings.notifications?.mentions)} onChange={(checked) => saveSettings({ notifications: { ...(settings.notifications || {}), mentions: checked } })} />
            <ToggleRow label="Direct messages" checked={Boolean(settings.notifications?.directMessages)} onChange={(checked) => saveSettings({ notifications: { ...(settings.notifications || {}), directMessages: checked } })} />
          </div>
        )}

        {section === "appearance" && settings && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
              <label className="text-sm text-[var(--text-secondary)]">Theme</label>
              <select
                value={settings.appearance?.theme || settings.appearance?.themeStyle || "dark"}
                onChange={(e) => saveSettings({ appearance: { ...(settings.appearance || {}), theme: e.target.value } })}
                className="mt-2 w-full h-10 rounded-md bg-[var(--bg-sidebar-elevated)] border border-[var(--border-subtle)] px-3 text-[var(--text-primary)]"
              >
                <option value="dark">Dark</option>
                <option value="midnight">Midnight</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
              <label className="text-sm text-[var(--text-secondary)]">Accent Color</label>
              <input
                type="color"
                value={settings.appearance?.accentColor || "#8B5CF6"}
                onChange={(e) => saveSettings({ appearance: { ...(settings.appearance || {}), accentColor: e.target.value } })}
                className="mt-2 h-10 w-full rounded-md bg-transparent"
              />
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-[var(--text-secondary)]">Text Color</label>
                {(settings.appearance?.textColor || "").trim() && (
                  <button
                    onClick={() => saveSettings({ appearance: { ...(settings.appearance || {}), textColor: "" } })}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Reset to default
                  </button>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1 mb-2">Override the default text color for the current theme.</p>
              <input
                type="color"
                value={settings.appearance?.textColor || "#d5d9e8"}
                onChange={(e) => saveSettings({ appearance: { ...(settings.appearance || {}), textColor: e.target.value } })}
                className="h-10 w-full rounded-md bg-transparent"
              />
            </div>
            <ToggleRow label="Compact mode" checked={Boolean(settings.appearance?.compactMode)} onChange={(checked) => saveSettings({ appearance: { ...(settings.appearance || {}), compactMode: checked } })} />
          </div>
        )}

        {section === "accessibility" && settings && (
          <div className="space-y-4">
            <ToggleRow label="Reduced motion" checked={Boolean(settings.accessibility?.reducedMotion)} onChange={(checked) => saveSettings({ accessibility: { ...(settings.accessibility || {}), reducedMotion: checked } })} />
            <ToggleRow label="High contrast" checked={Boolean(settings.accessibility?.highContrast)} onChange={(checked) => saveSettings({ accessibility: { ...(settings.accessibility || {}), highContrast: checked } })} />
            <ToggleRow label="Dyslexic font" checked={Boolean(settings.accessibility?.dyslexicFont)} onChange={(checked) => saveSettings({ accessibility: { ...(settings.accessibility || {}), dyslexicFont: checked } })} />
          </div>
        )}

        {section === "voice" && settings && (
          <div className="space-y-4">
            <ToggleRow label="Noise suppression" checked={Boolean(settings.voiceVideo?.noiseSuppression)} onChange={(checked) => saveSettings({ voiceVideo: { ...(settings.voiceVideo || {}), noiseSuppression: checked } })} />
            <ToggleRow label="Echo cancellation" checked={Boolean(settings.voiceVideo?.echoCancellation)} onChange={(checked) => saveSettings({ voiceVideo: { ...(settings.voiceVideo || {}), echoCancellation: checked } })} />
            <ToggleRow label="Push to talk" checked={Boolean(settings.voiceVideo?.pushToTalk)} onChange={(checked) => saveSettings({ voiceVideo: { ...(settings.voiceVideo || {}), pushToTalk: checked } })} />
          </div>
        )}

        {section === "language" && settings && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
              <label className="text-sm text-[var(--text-secondary)]">Language</label>
              <select
                value={settings.language?.locale || "en-US"}
                onChange={(e) => saveSettings({ language: { locale: e.target.value } })}
                className="mt-2 w-full h-10 rounded-md bg-[var(--bg-sidebar-elevated)] border border-[var(--border-subtle)] px-3 text-[var(--text-primary)]"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Español</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
                <option value="ja-JP">日本語</option>
                <option value="ko-KR">한국어</option>
                <option value="zh-CN">中文 (简体)</option>
                <option value="zh-TW">中文 (繁體)</option>
                <option value="pt-BR">Português (Brasil)</option>
                <option value="it-IT">Italiano</option>
                <option value="ru-RU">Русский</option>
              </select>
            </div>
          </div>
        )}

        {section === "apps" && (
          <div className="space-y-3">
            {apps.length === 0 ? <p className="text-[var(--text-secondary)] text-sm">No authorized apps.</p> : apps.map((app) => (
              <div key={app._id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[var(--text-primary)] font-medium">{app.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{app.description || "No description"}</p>
                </div>
                <button
                  onClick={async () => {
                    await fetch(`/api/users/me/authorized-apps/${app._id}`, { method: "DELETE" });
                    setApps((prev) => prev.filter((a) => a._id !== app._id));
                    toast.success("App access revoked");
                  }}
                  className="p-2 rounded-md hover:bg-red-500/10 text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {section === "premium" && (
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
            <p className="text-[var(--text-primary)] font-semibold">{user?.isPremium ? "Your Premium is Active" : "Premium is not active"}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">Premium unlocks profile cosmetics and extra media limits.</p>
          </div>
        )}

        {(section === "help" || section === "bug-report" || section === "feedback") && (
          <div className="space-y-3">
            <textarea
              value={supportText}
              onChange={(e) => setSupportText(e.target.value)}
              placeholder={section === "bug-report" ? "Describe the bug..." : "Write your message..."}
              className="w-full min-h-[140px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 text-[var(--text-primary)]"
            />
            <button
              onClick={() => {
                if (!supportText.trim()) return;
                localStorage.setItem(`support-${section}-${Date.now()}`, supportText.trim());
                setSupportText("");
                toast.success("Submitted. Thank you.");
              }}
              className="px-4 py-2 rounded-md bg-[var(--app-accent)] text-white hover:opacity-90 transition-opacity"
            >
              Submit
            </button>
          </div>
        )}

        {section === "status" && statusSection}

        {section === "account" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-[var(--app-accent)] text-white text-xl font-bold">
                  {(user?.displayName || user?.username || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--text-primary)] truncate">{user?.displayName || user?.username}</p>
                <p className="text-sm text-[var(--text-muted)] truncate">@{user?.username}</p>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 space-y-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Display Name</label>
                <p className="text-sm text-[var(--text-primary)] mt-0.5">{user?.displayName || "Not set"}</p>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Username</label>
                <p className="text-sm text-[var(--text-primary)] mt-0.5">@{user?.username}</p>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Email</label>
                <p className="text-sm text-[var(--text-primary)] mt-0.5">{user?.email || "Not set"}</p>
              </div>
              {user?.isPremium && (
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Premium</label>
                  <p className="text-sm text-[var(--app-accent)] mt-0.5">Active</p>
                </div>
              )}
            </div>
            <Link href="/channels/profile" className="block w-full text-center py-2.5 rounded-lg bg-[var(--app-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Edit Profile
            </Link>
          </div>
        )}

        {section === "apps" && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm text-[var(--text-secondary)]">Connected Devices</h3>
            {devices.map((device) => (
              <div key={device._id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 flex items-center justify-between">
                <div>
                  <p className="text-[var(--text-primary)] text-sm">{device.deviceName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{device.platform} • {new Date(device.lastActiveAt).toLocaleString()}</p>
                </div>
                {!device.current && (
                  <button
                    onClick={async () => {
                      await fetch(`/api/users/me/devices/${device._id}`, { method: "DELETE" });
                      setDevices((prev) => prev.filter((d) => d._id !== device._id));
                      toast.success("Device removed");
                    }}
                    className="text-red-400 text-xs"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}

            <h3 className="text-sm text-[var(--text-secondary)] pt-2">Connections</h3>
            {connections.length === 0 ? <p className="text-xs text-[var(--text-muted)]">No social connections.</p> : connections.map((connection) => (
              <div key={connection._id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 flex items-center justify-between">
                <div>
                  <p className="text-[var(--text-primary)] text-sm capitalize">{connection.provider}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{connection.displayName || connection.username || connection.accountId}</p>
                </div>
                <button
                  onClick={async () => {
                    await fetch(`/api/users/me/connections/${connection._id}`, { method: "DELETE" });
                    setConnections((prev) => prev.filter((c) => c._id !== connection._id));
                    toast.success("Disconnected");
                  }}
                  className="text-red-400 text-xs"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isSaving && (
        <div className="absolute bottom-6 right-6 px-3 py-2 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
      <span className="text-[var(--text-primary)]">{label}</span>
      <ToggleSwitch size="sm" checked={checked} onCheckedChange={(checked) => onChange(checked)} />
    </label>
  );
}
