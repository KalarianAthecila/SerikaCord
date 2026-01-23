"use client";

import { useState, useEffect, useCallback } from "react";
import { useServer } from "@/contexts/ServerContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Settings,
  Shield,
  Users,
  Smile,
  Sticker,
  Link2,
  Ban,
  FileText,
  Bell,
  Folder,
  Sparkles,
  Camera,
  Loader2,
  Check,
  Trash2,
  Plus,
  Copy,
  ExternalLink,
  ChevronRight,
  Crown,
  Hash,
  Volume2,
  MoreHorizontal,
  UserPlus,
  RefreshCw,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  Pencil,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServerSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsTab =
  | "overview"
  | "roles"
  | "emoji"
  | "stickers"
  | "soundboard"
  | "widget"
  | "invites"
  | "bans"
  | "audit-log"
  | "integrations"
  | "moderation"
  | "safety"
  | "members"
  | "channels";

interface Role {
  id: string;
  name: string;
  color: string;
  position: number;
  permissions: string[];
  memberCount?: number;
}

interface Invite {
  code: string;
  uses: number;
  maxUses: number | null;
  expiresAt: string | null;
  createdBy: {
    id: string;
    username: string;
    avatar?: string;
  };
  channel: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface BannedUser {
  id: string;
  username: string;
  avatar?: string;
  reason?: string;
  bannedAt: string;
  bannedBy: {
    id: string;
    username: string;
  };
}

interface ServerMember {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  roles: string[];
  joinedAt: string;
  status: string;
}

export function ServerSettingsDialog({ open, onOpenChange }: ServerSettingsDialogProps) {
  const { currentServer, fetchChannels } = useServer();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Server settings state
  const [serverName, setServerName] = useState("");
  const [serverDescription, setServerDescription] = useState("");
  const [serverIcon, setServerIcon] = useState<string | null>(null);
  const [serverBanner, setServerBanner] = useState<string | null>(null);
  const [systemChannel, setSystemChannel] = useState<string | null>(null);
  const [rulesChannel, setRulesChannel] = useState<string | null>(null);
  const [afkChannel, setAfkChannel] = useState<string | null>(null);
  const [afkTimeout, setAfkTimeout] = useState(300);

  // Data state
  const [roles, setRoles] = useState<Role[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [bans, setBans] = useState<BannedUser[]>([]);
  const [members, setMembers] = useState<ServerMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with server data
  useEffect(() => {
    if (currentServer) {
      setServerName(currentServer.name);
      // Cast for optional properties
      const server = currentServer as any;
      setServerDescription(server.description || "");
      setServerIcon(server.icon || null);
      setServerBanner(server.banner || null);
    }
  }, [currentServer]);

  // Fetch data based on active tab
  useEffect(() => {
    if (!open || !currentServer) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        switch (activeTab) {
          case "roles":
            const rolesRes = await fetch(`/api/servers/${currentServer.id}/roles`);
            if (rolesRes.ok) {
              const data = await rolesRes.json();
              setRoles(data.roles || []);
            }
            break;
          case "invites":
            const invitesRes = await fetch(`/api/servers/${currentServer.id}/invites`);
            if (invitesRes.ok) {
              const data = await invitesRes.json();
              setInvites(data.invites || []);
            }
            break;
          case "bans":
            const bansRes = await fetch(`/api/servers/${currentServer.id}/bans`);
            if (bansRes.ok) {
              const data = await bansRes.json();
              setBans(data.bans || []);
            }
            break;
          case "members":
            const membersRes = await fetch(`/api/servers/${currentServer.id}/members`);
            if (membersRes.ok) {
              const data = await membersRes.json();
              setMembers(data.members || []);
            }
            break;
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, open, currentServer]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleSaveOverview = async () => {
    if (!currentServer) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/servers/${currentServer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serverName,
          description: serverDescription,
        }),
      });

      if (response.ok) {
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!currentServer) return;
    try {
      const response = await fetch(`/api/servers/${currentServer.id}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxUses: 0, // Unlimited
          maxAge: 604800, // 7 days
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInvites(prev => [data.invite, ...prev]);
      }
    } catch (error) {
      console.error("Failed to create invite:", error);
    }
  };

  const handleDeleteInvite = async (code: string) => {
    if (!currentServer) return;
    try {
      await fetch(`/api/servers/${currentServer.id}/invites/${code}`, {
        method: "DELETE",
      });
      setInvites(prev => prev.filter(i => i.code !== code));
    } catch (error) {
      console.error("Failed to delete invite:", error);
    }
  };

  const handleUnban = async (userId: string) => {
    if (!currentServer) return;
    try {
      await fetch(`/api/servers/${currentServer.id}/bans/${userId}`, {
        method: "DELETE",
      });
      setBans(prev => prev.filter(b => b.id !== userId));
    } catch (error) {
      console.error("Failed to unban user:", error);
    }
  };

  const handleDeleteServer = async () => {
    if (!currentServer) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${currentServer.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/servers/${currentServer.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onOpenChange(false);
        window.location.href = "/channels/me";
      }
    } catch (error) {
      console.error("Failed to delete server:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!open || !currentServer) return null;

  const isOwner = currentServer.ownerId === user?.id;

  const menuSections = [
    {
      title: currentServer.name,
      items: [
        { id: "overview" as SettingsTab, label: "Overview", icon: Settings },
        { id: "roles" as SettingsTab, label: "Roles", icon: Shield },
        { id: "emoji" as SettingsTab, label: "Emoji", icon: Smile },
        { id: "stickers" as SettingsTab, label: "Stickers", icon: Sticker },
        { id: "soundboard" as SettingsTab, label: "Soundboard", icon: Volume2 },
        { id: "widget" as SettingsTab, label: "Widget", icon: ExternalLink },
      ],
    },
    {
      title: "Moderation",
      items: [
        { id: "safety" as SettingsTab, label: "Safety Setup", icon: Shield },
        { id: "moderation" as SettingsTab, label: "Moderation", icon: AlertTriangle },
        { id: "audit-log" as SettingsTab, label: "Audit Log", icon: FileText },
        { id: "bans" as SettingsTab, label: "Bans", icon: Ban },
      ],
    },
    {
      title: "User Management",
      items: [
        { id: "members" as SettingsTab, label: "Members", icon: Users },
        { id: "invites" as SettingsTab, label: "Invites", icon: Link2 },
        { id: "integrations" as SettingsTab, label: "Integrations", icon: Folder },
      ],
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Server Overview</h2>
        <p className="text-sm text-[#888888]">Customize your server's identity</p>
      </div>

      {/* Server Icon & Banner */}
      <div className="flex gap-6">
        {/* Icon */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative group">
            <Avatar className="w-24 h-24 rounded-2xl">
              <AvatarImage src={serverIcon || undefined} />
              <AvatarFallback className="bg-[#8B5CF6] text-white text-3xl rounded-2xl">
                {serverName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
              <Camera className="w-8 h-8 text-white" />
            </button>
          </div>
          <span className="text-xs text-[#666666]">Server Icon</span>
        </div>

        {/* Banner */}
        <div className="flex-1">
          <div className="relative group h-24 rounded-lg overflow-hidden bg-gradient-to-r from-[#8B5CF6] to-[#6366F1]">
            {serverBanner && (
              <img src={serverBanner} alt="Banner" className="w-full h-full object-cover" />
            )}
            <button className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </button>
          </div>
          <span className="text-xs text-[#666666] mt-1 block">Server Banner</span>
        </div>
      </div>

      {/* Server Name */}
      <div>
        <label className="block text-sm font-medium text-[#888888] mb-2">
          SERVER NAME
        </label>
        <Input
          value={serverName}
          onChange={(e) => {
            setServerName(e.target.value);
            setHasChanges(true);
          }}
          className="bg-[#111111] border-[#222222] text-white"
          placeholder="Enter server name"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-[#888888] mb-2">
          SERVER DESCRIPTION
        </label>
        <Textarea
          value={serverDescription}
          onChange={(e) => {
            setServerDescription(e.target.value);
            setHasChanges(true);
          }}
          className="bg-[#111111] border-[#222222] text-white min-h-[100px]"
          placeholder="Describe what your server is about"
        />
      </div>

      {/* System Messages Channel */}
      <div>
        <label className="block text-sm font-medium text-[#888888] mb-2">
          SYSTEM MESSAGES CHANNEL
        </label>
        <select className="w-full h-10 px-3 rounded-md bg-[#111111] border border-[#222222] text-white">
          <option value="">No system messages</option>
        </select>
        <p className="text-xs text-[#666666] mt-1">
          Where system messages like welcome messages are sent
        </p>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveOverview}
            disabled={isSaving}
            className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-md flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      )}

      {/* Danger Zone */}
      {isOwner && (
        <div className="pt-6 border-t border-[#222222]">
          <h3 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h3>
          <button
            onClick={handleDeleteServer}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-md flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Server
          </button>
        </div>
      )}
    </div>
  );

  const renderRoles = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Roles</h2>
          <p className="text-sm text-[#888888]">Manage server roles and permissions</p>
        </div>
        <button className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-md flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {/* Default @everyone role */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-[#222222]">
            <GripVertical className="w-4 h-4 text-[#666666]" />
            <div className="w-3 h-3 rounded-full bg-[#888888]" />
            <span className="flex-1 text-white">@everyone</span>
            <span className="text-xs text-[#666666]">Default role</span>
            <ChevronRight className="w-4 h-4 text-[#666666]" />
          </div>

          {roles.map((role) => (
            <div
              key={role.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a] cursor-pointer transition-colors"
            >
              <GripVertical className="w-4 h-4 text-[#666666]" />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: role.color || "#888888" }}
              />
              <span className="flex-1 text-white">{role.name}</span>
              {role.memberCount !== undefined && (
                <span className="text-xs text-[#666666]">{role.memberCount} members</span>
              )}
              <ChevronRight className="w-4 h-4 text-[#666666]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInvites = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Server Invites</h2>
          <p className="text-sm text-[#888888]">Create and manage invite links</p>
        </div>
        <button
          onClick={handleCreateInvite}
          className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Invite
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
        </div>
      ) : invites.length === 0 ? (
        <div className="text-center py-12">
          <Link2 className="w-12 h-12 text-[#666666] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No invites yet</h3>
          <p className="text-[#888888] text-sm">Create an invite link to share with others</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invites.map((invite) => (
            <div
              key={invite.code}
              className="flex items-center gap-4 p-4 rounded-lg bg-[#111111] border border-[#222222]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-[#8B5CF6] font-mono">
                    serika.gg/{invite.code}
                  </code>
                  <button
                    onClick={() => copyToClipboard(`https://serika.gg/${invite.code}`)}
                    className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-[#888888]" />
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-[#666666]">
                  <span>#{invite.channel.name}</span>
                  <span>{invite.uses} uses</span>
                  {invite.expiresAt && (
                    <span>Expires {new Date(invite.expiresAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <Avatar className="w-8 h-8">
                <AvatarImage src={invite.createdBy.avatar} />
                <AvatarFallback className="bg-[#8B5CF6] text-white text-xs">
                  {invite.createdBy.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => handleDeleteInvite(invite.code)}
                className="p-2 hover:bg-red-500/10 rounded-md text-[#888888] hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBans = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Server Bans</h2>
        <p className="text-sm text-[#888888]">View and manage banned users</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
        </div>
      ) : bans.length === 0 ? (
        <div className="text-center py-12">
          <Ban className="w-12 h-12 text-[#666666] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No bans</h3>
          <p className="text-[#888888] text-sm">There are no banned users in this server</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bans.map((ban) => (
            <div
              key={ban.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-[#111111] border border-[#222222]"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={ban.avatar} />
                <AvatarFallback className="bg-[#8B5CF6] text-white">
                  {ban.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{ban.username}</p>
                {ban.reason && (
                  <p className="text-sm text-[#888888] truncate">{ban.reason}</p>
                )}
              </div>
              <button
                onClick={() => handleUnban(ban.id)}
                className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222222] text-white text-sm rounded-md transition-colors"
              >
                Revoke Ban
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMembers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Server Members</h2>
          <p className="text-sm text-[#888888]">{members.length} members</p>
        </div>
        <Input
          placeholder="Search members..."
          className="w-64 bg-[#111111] border-[#222222] text-white"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
        </div>
      ) : (
        <div className="space-y-1">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#111111] transition-colors"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="bg-[#8B5CF6] text-white">
                  {(member.displayName || member.username).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">
                    {member.displayName || member.username}
                  </span>
                  {currentServer.ownerId === member.id && (
                    <Crown className="w-4 h-4 text-[#F59E0B]" />
                  )}
                </div>
                <span className="text-sm text-[#888888]">@{member.username}</span>
              </div>
              <button className="p-2 hover:bg-[#1a1a1a] rounded-md text-[#888888] transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEmoji = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Server Emoji</h2>
          <p className="text-sm text-[#888888]">Upload custom emoji for your server</p>
        </div>
        <button className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-md flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Upload Emoji
        </button>
      </div>

      <div className="text-center py-12 border-2 border-dashed border-[#222222] rounded-lg">
        <Smile className="w-12 h-12 text-[#666666] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No custom emoji yet</h3>
        <p className="text-[#888888] text-sm mb-4">Upload emoji to use in your server</p>
        <button className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-md">
          Upload Emoji
        </button>
      </div>
    </div>
  );

  const renderWidget = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Server Widget</h2>
        <p className="text-sm text-[#888888]">Embed your server on your website</p>
      </div>

      <div className="p-4 rounded-lg bg-[#111111] border border-[#222222]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-medium">Enable Server Widget</span>
          <button className="w-12 h-6 rounded-full bg-[#222222] relative">
            <div className="w-5 h-5 rounded-full bg-white absolute left-0.5 top-0.5 transition-transform" />
          </button>
        </div>
        <p className="text-sm text-[#888888]">
          Allow people to embed your server info on their websites
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#888888] mb-2">
          INVITE CHANNEL
        </label>
        <select className="w-full h-10 px-3 rounded-md bg-[#111111] border border-[#222222] text-white">
          <option value="">Select a channel</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#888888] mb-2">
          WIDGET CODE
        </label>
        <div className="p-3 rounded-md bg-[#111111] border border-[#222222] font-mono text-sm text-[#888888]">
          {`<iframe src="https://serika.gg/widget/${currentServer.id}" width="350" height="500" />`}
        </div>
        <button className="mt-2 text-sm text-[#8B5CF6] hover:underline flex items-center gap-1">
          <Copy className="w-4 h-4" />
          Copy Code
        </button>
      </div>
    </div>
  );

  const renderAuditLog = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Audit Log</h2>
        <p className="text-sm text-[#888888]">View a record of all changes made to your server</p>
      </div>

      <div className="flex gap-4 mb-4">
        <select className="h-10 px-3 rounded-md bg-[#111111] border border-[#222222] text-white">
          <option value="">All users</option>
        </select>
        <select className="h-10 px-3 rounded-md bg-[#111111] border border-[#222222] text-white">
          <option value="">All actions</option>
          <option value="channel_create">Channel Created</option>
          <option value="channel_delete">Channel Deleted</option>
          <option value="role_create">Role Created</option>
          <option value="role_delete">Role Deleted</option>
          <option value="member_ban">Member Banned</option>
          <option value="member_kick">Member Kicked</option>
        </select>
      </div>

      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-[#666666] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No audit log entries</h3>
        <p className="text-[#888888] text-sm">Actions taken in your server will appear here</p>
      </div>
    </div>
  );

  const renderModeration = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Moderation</h2>
        <p className="text-sm text-[#888888]">Configure moderation settings for your server</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-[#111111] border border-[#222222]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Verification Level</span>
          </div>
          <select className="w-full h-10 px-3 rounded-md bg-[#0a0a0a] border border-[#222222] text-white">
            <option value="none">None - Unrestricted</option>
            <option value="low">Low - Must have verified email</option>
            <option value="medium">Medium - Registered for 5+ minutes</option>
            <option value="high">High - Member for 10+ minutes</option>
            <option value="highest">Highest - Must have verified phone</option>
          </select>
        </div>

        <div className="p-4 rounded-lg bg-[#111111] border border-[#222222]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Explicit Media Content Filter</span>
          </div>
          <select className="w-full h-10 px-3 rounded-md bg-[#0a0a0a] border border-[#222222] text-white">
            <option value="disabled">Don't scan any media content</option>
            <option value="members_without_roles">Scan content from members without roles</option>
            <option value="all_members">Scan content from all members</option>
          </select>
        </div>

        <div className="p-4 rounded-lg bg-[#111111] border border-[#222222]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">2FA Requirement</span>
              <p className="text-sm text-[#888888] mt-1">
                Require moderators to have 2FA enabled
              </p>
            </div>
            <button className="w-12 h-6 rounded-full bg-[#222222] relative">
              <div className="w-5 h-5 rounded-full bg-white absolute left-0.5 top-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "roles":
        return renderRoles();
      case "invites":
        return renderInvites();
      case "bans":
        return renderBans();
      case "members":
        return renderMembers();
      case "emoji":
        return renderEmoji();
      case "stickers":
        return renderEmoji(); // Similar to emoji for now
      case "widget":
        return renderWidget();
      case "audit-log":
        return renderAuditLog();
      case "moderation":
      case "safety":
        return renderModeration();
      default:
        return (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-[#666666] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
            <p className="text-[#888888] text-sm">This feature is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <div className="w-56 md:w-64 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col">
        <ScrollArea className="flex-1 py-4">
          <div className="space-y-6 px-2">
            {menuSections.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 mb-1 text-xs font-semibold uppercase text-[#666666] truncate">
                  {section.title}
                </h3>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                        activeTab === item.id
                          ? "bg-[#8B5CF6]/10 text-white"
                          : "text-[#888888] hover:bg-[#111111] hover:text-white"
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 flex items-center justify-end px-4 border-b border-[#1a1a1a]">
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full hover:bg-[#1a1a1a] text-[#888888] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto p-6 md:p-8">
            {renderContent()}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
