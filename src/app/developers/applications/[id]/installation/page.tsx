"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useApplication } from "../useApplication";
import { Loader2, Copy, Check, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const allScopes = [
  "bot", "applications.commands", "applications.commands.permissions.update",
  "identify", "email", "connections", "guilds", "guilds.join",
  "guilds.members.read", "messages.read", "rpc", "rpc.notifications.read",
  "webhook.incoming", "dm_channels.read", "voice", "activity.read", "activity.write",
];

const permissions = [
  { name: "Create Invite", value: "CREATE_INSTANT_INVITE" },
  { name: "Kick Members", value: "KICK_MEMBERS" },
  { name: "Ban Members", value: "BAN_MEMBERS" },
  { name: "Administrator", value: "ADMINISTRATOR" },
  { name: "Manage Channels", value: "MANAGE_CHANNELS" },
  { name: "Manage Server", value: "MANAGE_GUILD" },
  { name: "Add Reactions", value: "ADD_REACTIONS" },
  { name: "View Audit Log", value: "VIEW_AUDIT_LOG" },
  { name: "View Server Insights", value: "VIEW_GUILD_INSIGHTS" },
  { name: "Send Messages", value: "SEND_MESSAGES" },
  { name: "Send TTS Messages", value: "SEND_TTS_MESSAGES" },
  { name: "Manage Messages", value: "MANAGE_MESSAGES" },
  { name: "Embed Links", value: "EMBED_LINKS" },
  { name: "Attach Files", value: "ATTACH_FILES" },
  { name: "Read Message History", value: "READ_MESSAGE_HISTORY" },
  { name: "Mention Everyone", value: "MENTION_EVERYONE" },
  { name: "Use External Emojis", value: "USE_EXTERNAL_EMOJIS" },
  { name: "View Server Events", value: "VIEW_GUILD_EVENTS" },
  { name: "Connect", value: "CONNECT" },
  { name: "Speak", value: "SPEAK" },
  { name: "Mute Members", value: "MUTE_MEMBERS" },
  { name: "Deafen Members", value: "DEAFEN_MEMBERS" },
  { name: "Move Members", value: "MOVE_MEMBERS" },
  { name: "Use Voice Activity", value: "USE_VAD" },
  { name: "Priority Speaker", value: "PRIORITY_SPEAKER" },
  { name: "Change Nickname", value: "CHANGE_NICKNAME" },
  { name: "Manage Nicknames", value: "MANAGE_NICKNAMES" },
  { name: "Manage Roles", value: "MANAGE_ROLES" },
  { name: "Manage Webhooks", value: "MANAGE_WEBHOOKS" },
  { name: "Manage Emojis", value: "MANAGE_EMOJIS_AND_STICKERS" },
  { name: "Use Application Commands", value: "USE_APPLICATION_COMMANDS" },
  { name: "Request to Speak", value: "REQUEST_TO_SPEAK" },
  { name: "Manage Events", value: "MANAGE_EVENTS" },
  { name: "Manage Threads", value: "MANAGE_THREADS" },
  { name: "Create Public Threads", value: "CREATE_PUBLIC_THREADS" },
  { name: "Create Private Threads", value: "CREATE_PRIVATE_THREADS" },
  { name: "Use External Stickers", value: "USE_EXTERNAL_STICKERS" },
  { name: "Send Messages in Threads", value: "SEND_MESSAGES_IN_THREADS" },
  { name: "Use Embedded Activities", value: "USE_EMBEDDED_ACTIVITIES" },
  { name: "Moderate Members", value: "MODERATE_MEMBERS" },
];

export default function InstallationPage() {
  const params = useParams();
  const appId = params.id as string;
  const { app, loading, saving, saveApp } = useApplication(appId);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["bot"]);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [customInstallUrl, setCustomInstallUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (app) {
      setSelectedScopes(app.installParams?.scopes || ["bot"]);
      setCustomInstallUrl(app.customInstallUrl || "");
    }
  }, [app]);

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const installLink = `https://serika.dev/api/oauth2/authorize?client_id=${appId}&scope=${selectedScopes.join("+")}${selectedPerms.length > 0 ? `&permissions=${selectedPerms.join(",")}` : ""}`;

  const handleSave = async () => {
    await saveApp({
      installParams: { scopes: selectedScopes, permissions: selectedPerms.join(",") },
      customInstallUrl,
    });
    toast.success("Installation settings saved");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(customInstallUrl || installLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Installation</h1>

      {/* Install Link */}
      <div className="mb-8">
        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-2">
          Install Link
        </label>
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2.5">
          <code className="text-sm text-[#ccc] flex-1 truncate font-mono">
            {customInstallUrl || installLink}
          </code>
          <button
            onClick={copyLink}
            className="p-1.5 rounded hover:bg-white/10 text-[#888] hover:text-white transition-colors"
          >
            {copied ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>

      {/* Custom Install URL */}
      <div className="mb-8">
        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-2">
          Custom Install URL (Optional)
        </label>
        <input
          type="text"
          value={customInstallUrl}
          onChange={(e) => setCustomInstallUrl(e.target.value)}
          placeholder="https://your-site.com/install"
          className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#8B5CF6]/50"
        />
        <p className="text-xs text-[#666] mt-1.5">
          Override the default install link with your own.
        </p>
      </div>

      {/* OAuth2 Scopes */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-3">Authorization Scopes</h3>
        <p className="text-xs text-[#666] mb-3">
          Select the scopes your app requests during installation.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {allScopes.map((scope) => (
            <label
              key={scope}
              className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2 cursor-pointer hover:bg-white/[0.04] transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedScopes.includes(scope)}
                onChange={() => toggleScope(scope)}
                className="accent-[#8B5CF6]"
              />
              <span className="text-xs font-mono text-[#ccc]">{scope}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bot Permissions */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-3">Bot Permissions</h3>
        <p className="text-xs text-[#666] mb-3">
          Select the permissions your bot needs. These are requested during installation.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {permissions.map((perm) => (
            <label
              key={perm.value}
              className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2 cursor-pointer hover:bg-white/[0.04] transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedPerms.includes(perm.value)}
                onChange={() => togglePerm(perm.value)}
                className="accent-[#8B5CF6]"
              />
              <span className="text-xs text-[#ccc]">{perm.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white text-sm font-medium rounded-md transition-colors"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
