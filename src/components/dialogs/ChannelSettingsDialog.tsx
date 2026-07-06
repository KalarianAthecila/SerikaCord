"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useServer } from "@/contexts/ServerContext";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hash, Volume2, X, Settings, Trash2, Shield, Clock, Plus, Check, Minus } from "lucide-react";
import { toast } from "sonner";
import { CHANNEL_PERMISSIONS } from "@/lib/constants/channels";
import { parsePermissionBitfield, stringifyPermissionBitfield } from "@/lib/roles/bitfield";

interface ServerRole {
  id: string;
  name: string;
  color?: string;
  isDefault?: boolean;
}

interface PermissionOverwrite {
  id: string;
  type: 'role' | 'member';
  allow: string;
  deny: string;
}

interface ChannelSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
}

export function ChannelSettingsDialog({
  open,
  onOpenChange,
  channelId,
}: ChannelSettingsDialogProps) {
  const { channels, updateChannel, deleteChannel, currentServer } = useServer();

  const channel = useMemo(
    () => channels.find((c) => c.id === channelId),
    [channels, channelId]
  );

  const categories = useMemo(
    () => channels.filter((c) => c.type === "category"),
    [channels]
  );

  const [activeTab, setActiveTab] = useState<"overview" | "permissions" | "delete">("overview");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [nsfw, setNsfw] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [slowmode, setSlowmode] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [roles, setRoles] = useState<ServerRole[]>([]);
  const [overwrites, setOverwrites] = useState<PermissionOverwrite[]>([]);
  const [hasPermChanges, setHasPermChanges] = useState(false);
  const [showAddRoleMenu, setShowAddRoleMenu] = useState(false);

  // Populate form when channel data loads
  useEffect(() => {
    if (channel && open) {
      setName(channel.name);
      setTopic(channel.topic || "");
      setNsfw(channel.isNsfw || false);
      setParentId(channel.parentId || null);
      setSlowmode(channel.rateLimitPerUser || 0);
      setActiveTab("overview");
      setHasChanges(false);
      setDeleteConfirmText("");
      setOverwrites((channel.permissionOverwrites || []).map(o => ({
        id: o.id,
        type: o.type,
        allow: o.allow || "0",
        deny: o.deny || "0",
      })));
      setHasPermChanges(false);
      setShowAddRoleMenu(false);
    }
  }, [channel, open]);

  // Fetch server roles when dialog opens
  useEffect(() => {
    if (!open || !currentServer) return;
    let active = true;
    fetch(`/api/servers/${currentServer.id}/roles`)
      .then(r => r.json())
      .then(data => {
        if (!active) return;
        const nextRoles = (data.roles || []).map((r: any) => ({
          id: r._id || r.id,
          name: r.name,
          color: r.color,
          isDefault: r.isDefault,
        }));
        setRoles(nextRoles);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [open, currentServer]);

  // Track overview changes
  useEffect(() => {
    if (!channel) return;
    const changed =
      name !== channel.name ||
      topic !== (channel.topic || "") ||
      nsfw !== (channel.isNsfw || false) ||
      parentId !== (channel.parentId || null) ||
      slowmode !== (channel.rateLimitPerUser || 0);
    setHasChanges(changed);
  }, [name, topic, nsfw, parentId, slowmode, channel]);

  // Track permission changes
  useEffect(() => {
    if (!channel) return;
    const original = JSON.stringify(
      (channel.permissionOverwrites || []).map(o => ({ id: o.id, type: o.type, allow: o.allow || "0", deny: o.deny || "0" }))
    );
    const current = JSON.stringify(overwrites);
    setHasPermChanges(original !== current);
  }, [overwrites, channel]);

  const getRoleName = useCallback((roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || "Unknown";
  }, [roles]);

  const getRoleColor = useCallback((roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.color || null;
  }, [roles]);

  const addRoleOverwrite = useCallback((roleId: string) => {
    if (overwrites.some(o => o.id === roleId)) return;
    setOverwrites(prev => [...prev, { id: roleId, type: 'role', allow: '0', deny: '0' }]);
    setShowAddRoleMenu(false);
  }, [overwrites]);

  const removeOverwrite = useCallback((id: string) => {
    setOverwrites(prev => prev.filter(o => o.id !== id));
  }, []);

  const cyclePermission = useCallback((overwriteId: string, permKey: keyof typeof CHANNEL_PERMISSIONS) => {
    const flag = BigInt(CHANNEL_PERMISSIONS[permKey].flag);
    setOverwrites(prev => prev.map(o => {
      if (o.id !== overwriteId) return o;
      const allowBits = parsePermissionBitfield(o.allow);
      const denyBits = parsePermissionBitfield(o.deny);
      const isAllowed = (allowBits & flag) === flag;
      const isDenied = (denyBits & flag) === flag;
      if (isAllowed) {
        // allowed -> denied
        return {
          ...o,
          allow: stringifyPermissionBitfield(allowBits & ~flag),
          deny: stringifyPermissionBitfield(denyBits | flag),
        };
      } else if (isDenied) {
        // denied -> neutral
        return {
          ...o,
          deny: stringifyPermissionBitfield(denyBits & ~flag),
        };
      } else {
        // neutral -> allowed
        return {
          ...o,
          allow: stringifyPermissionBitfield(allowBits | flag),
        };
      }
    }));
  }, []);

  const getPermState = useCallback((overwrite: PermissionOverwrite, permKey: keyof typeof CHANNEL_PERMISSIONS): 'allow' | 'deny' | 'neutral' => {
    const flag = BigInt(CHANNEL_PERMISSIONS[permKey].flag);
    const allowBits = parsePermissionBitfield(overwrite.allow);
    const denyBits = parsePermissionBitfield(overwrite.deny);
    if ((allowBits & flag) === flag) return 'allow';
    if ((denyBits & flag) === flag) return 'deny';
    return 'neutral';
  }, []);

  const handleSavePermissions = async () => {
    if (!channel || !hasPermChanges) return;
    setIsSaving(true);
    try {
      await updateChannel(channel.id, { permissionOverwrites: overwrites } as any);
      toast.success("Channel permissions saved");
      setHasPermChanges(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!channel || !hasChanges) return;
    setIsSaving(true);
    try {
      const updates: Record<string, unknown> = {};
      if (name !== channel.name) updates.name = name.trim();
      if (topic !== (channel.topic || "")) updates.topic = topic;
      if (nsfw !== (channel.isNsfw || false)) updates.nsfw = nsfw;
      if (parentId !== (channel.parentId || null)) updates.parentId = parentId;
      if (slowmode !== (channel.rateLimitPerUser || 0)) updates.rateLimitPerUser = slowmode;

      await updateChannel(channel.id, updates as any);
      toast.success("Channel settings saved");
      setHasChanges(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!channel || deleteConfirmText !== channel.name) return;
    try {
      await deleteChannel(channel.id);
      toast.success(`Channel #${channel.name} deleted`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete channel");
    }
  };

  if (!channel) return null;

  const isVoice = channel.type === "voice";
  const isCategory = channel.type === "category";

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Settings },
    ...(isCategory ? [] : [{ id: "permissions" as const, label: "Permissions", icon: Shield }]),
    { id: "delete" as const, label: "Delete", icon: Trash2 },
  ];

  const slowmodeOptions = [
    { value: 0, label: "Off" },
    { value: 5, label: "5s" },
    { value: 10, label: "10s" },
    { value: 15, label: "15s" },
    { value: 30, label: "30s" },
    { value: 60, label: "1m" },
    { value: 120, label: "2m" },
    { value: 300, label: "5m" },
    { value: 600, label: "10m" },
    { value: 900, label: "15m" },
    { value: 1800, label: "30m" },
    { value: 3600, label: "1h" },
    { value: 7200, label: "2h" },
    { value: 21600, label: "6h" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-none !w-screen !h-screen !rounded-none p-0 bg-[var(--bg-primary)] border-none overflow-hidden flex !translate-x-[-50%] !translate-y-[-50%]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Sidebar Navigation */}
        <div className="w-[220px] shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col">
          <div className="px-4 pt-5 pb-3">
            <h2 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
              {isVoice ? "Voice" : isCategory ? "Category" : "Text"} Channel
            </h2>
            <p className="text-sm text-[var(--text-primary)] font-medium truncate mt-1 flex items-center gap-1.5">
              {isVoice ? <Volume2 className="w-3.5 h-3.5" /> : !isCategory ? <Hash className="w-3.5 h-3.5" /> : null}
              {channel.name}
            </p>
          </div>

          <nav className="flex-1 px-2 space-y-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                    : tab.id === "delete"
                    ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-sidebar-elevated)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* ESC close hint */}
          <div className="px-4 py-3 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors w-full"
            >
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-active)] text-[10px] font-mono">ESC</kbd>
              Close
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {activeTab === "overview" ? "Overview" : activeTab === "permissions" ? "Permissions" : "Delete Channel"}
            </h1>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {activeTab === "overview" && (
              <>
                {/* Channel Name */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                    Channel Name
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    className="bg-[var(--bg-sidebar)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--app-accent)] h-10"
                  />
                </div>

                {/* Channel Topic (not for voice or category) */}
                {!isVoice && !isCategory && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                      Channel Topic
                    </Label>
                    <Textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      maxLength={1024}
                      placeholder="Set a topic to let everyone know what this channel is about"
                      className="bg-[var(--bg-sidebar)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--app-accent)] min-h-[80px] resize-none"
                    />
                    <p className="text-xs text-[var(--text-muted)]">
                      {topic.length}/1024
                    </p>
                  </div>
                )}

                {/* Slowmode (text only) */}
                {!isVoice && !isCategory && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Slowmode
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={slowmodeOptions.length - 1}
                        value={slowmodeOptions.findIndex((o) => o.value === slowmode)}
                        onChange={(e) => setSlowmode(slowmodeOptions[parseInt(e.target.value)].value)}
                        className="flex-1 accent-[var(--app-accent)]"
                      />
                      <span className="text-sm text-[var(--text-secondary)] min-w-[40px] text-right font-medium">
                        {slowmodeOptions.find((o) => o.value === slowmode)?.label || "Off"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      Members can only send one message per slowmode interval.
                    </p>
                  </div>
                )}

                {/* Category */}
                {!isCategory && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                      Category
                    </Label>
                    <Select value={parentId || "__none__"} onValueChange={(v) => setParentId(v === "__none__" ? null : v)}>
                      <SelectTrigger className="bg-[var(--bg-sidebar)] border-[var(--border-subtle)] text-[var(--text-primary)] h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--bg-sidebar-elevated)] border-[var(--border-subtle)]">
                        <SelectItem value="__none__" className="text-[var(--text-secondary)]">
                          No Category
                        </SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-[var(--text-secondary)]">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* NSFW Toggle (not for category) */}
                {!isCategory && (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-sidebar)] border border-[var(--border-subtle)]">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        Age-Restricted Channel
                      </span>
                      <p className="text-xs text-[var(--text-muted)] max-w-sm">
                        Users must verify their age to view content in this channel. This channel will be marked with an age-restricted badge.
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={nsfw}
                      onCheckedChange={setNsfw}
                      aria-label="Toggle NSFW"
                    />
                  </div>
                )}
              </>
            )}

            {activeTab === "permissions" && (
              <div className="space-y-4">
                {/* Add role / member */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Permission Overwrites
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Add roles or members to override their default permissions for this channel.
                    </p>
                  </div>
                  <div className="relative">
                    <Button
                      onClick={() => setShowAddRoleMenu(!showAddRoleMenu)}
                      className="bg-[var(--bg-sidebar)] hover:bg-[var(--bg-sidebar-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-sm h-8 px-3"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                    {showAddRoleMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowAddRoleMenu(false)} />
                        <div className="absolute right-0 top-full mt-1 z-50 w-56 max-h-64 overflow-y-auto bg-[var(--bg-sidebar-elevated)] border border-[var(--border-subtle)] rounded-lg shadow-xl py-1">
                          {roles
                            .filter(r => !overwrites.some(o => o.id === r.id))
                            .map(role => (
                              <button
                                key={role.id}
                                onClick={() => addRoleOverwrite(role.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-active)] hover:text-[var(--text-primary)] transition-colors text-left"
                              >
                                <div
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: role.color || "#888" }}
                                />
                                <span className="truncate">{role.name}</span>
                                {role.isDefault && <span className="text-[10px] text-[var(--text-muted)] ml-auto">@everyone</span>}
                              </button>
                            ))}
                          {roles.filter(r => !overwrites.some(o => o.id === r.id)).length === 0 && (
                            <div className="px-3 py-2 text-xs text-[var(--text-muted)] text-center">
                              All roles already added
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Overwrites list */}
                {overwrites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Shield className="w-10 h-10 text-[var(--text-muted)] mb-3" />
                    <p className="text-sm text-[var(--text-muted)] max-w-sm">
                      No permission overwrites configured. All server members use their default role permissions for this channel.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overwrites.map((overwrite) => {
                      const roleName = getRoleName(overwrite.id);
                      const roleColor = getRoleColor(overwrite.id);
                      const relevantPerms = isVoice
                        ? (['VIEW_CHANNEL', 'CONNECT', 'SPEAK', 'STREAM', 'USE_VOICE_ACTIVITY', 'PRIORITY_SPEAKER', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_PERMISSIONS'] as const)
                        : (['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'ADD_REACTIONS', 'ATTACH_FILES', 'EMBED_LINKS', 'USE_EXTERNAL_EMOJI', 'MENTION_EVERYONE', 'MANAGE_MESSAGES', 'MANAGE_CHANNELS', 'MANAGE_PERMISSIONS'] as const);

                      return (
                        <div
                          key={overwrite.id}
                          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-sidebar)] overflow-hidden"
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: roleColor || "#888" }}
                              />
                              <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                {roleName}
                              </span>
                            </div>
                            <button
                              onClick={() => removeOverwrite(overwrite.id)}
                              className="p-1 rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Permission grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 px-4 py-3">
                            {relevantPerms.map(permKey => {
                              const state = getPermState(overwrite, permKey);
                              return (
                                <div
                                  key={permKey}
                                  className="flex items-center justify-between py-1.5"
                                >
                                  <span className="text-xs text-[var(--text-secondary)]">
                                    {CHANNEL_PERMISSIONS[permKey].name}
                                  </span>
                                  <button
                                    onClick={() => cyclePermission(overwrite.id, permKey)}
                                    className={
                                      "w-7 h-5 rounded flex items-center justify-center transition-colors " +
                                      (state === 'allow'
                                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                        : state === 'deny'
                                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                        : "bg-[var(--bg-active)] text-[var(--text-muted)] hover:bg-[var(--bg-sidebar-elevated)]")
                                    }
                                    title={state === 'allow' ? 'Allowed' : state === 'deny' ? 'Denied' : 'Inherit (default)'}
                                  >
                                    {state === 'allow' && <Check className="w-3 h-3" />}
                                    {state === 'deny' && <X className="w-3 h-3" />}
                                    {state === 'neutral' && <Minus className="w-3 h-3" />}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-4 rounded bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-400" />
                    </span>
                    Allow
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-4 rounded bg-red-500/20 flex items-center justify-center">
                      <X className="w-3 h-3 text-red-400" />
                    </span>
                    Deny
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-4 rounded bg-[var(--bg-active)] flex items-center justify-center">
                      <Minus className="w-3 h-3 text-[var(--text-muted)]" />
                    </span>
                    Inherit
                  </span>
                </div>
              </div>
            )}

            {activeTab === "delete" && (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <h3 className="text-base font-semibold text-red-400 mb-2">
                    Delete #{channel.name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Are you sure you want to delete <span className="font-semibold text-[var(--text-primary)]">#{channel.name}</span>?
                    This action is irreversible. All messages, attachments, and data in this channel will be permanently lost.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                    Type <span className="text-[var(--text-primary)]">{channel.name}</span> to confirm
                  </Label>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={channel.name}
                    className="bg-[var(--bg-sidebar)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-red-500 h-10"
                  />
                </div>

                <Button
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== channel.name}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white font-medium w-full"
                >
                  Delete Channel
                </Button>
              </div>
            )}
          </div>

          {/* Unsaved Changes Bar */}
          {hasChanges && activeTab === "overview" && (
            <>
            <div className="shrink-0 px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)] flex items-center justify-between animate-in slide-in-from-bottom-2">
              <span className="text-sm text-[var(--text-secondary)]">
                Careful — you have unsaved changes!
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (channel) {
                      setName(channel.name);
                      setTopic(channel.topic || "");
                      setNsfw(channel.isNsfw || false);
                      setParentId(channel.parentId || null);
                      setSlowmode(channel.rateLimitPerUser || 0);
                    }
                  }}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline transition-colors"
                >
                  Reset
                </button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                  className="bg-[var(--app-accent)] hover:opacity-90 text-[var(--text-on-accent)] text-sm px-5 h-8"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
            </>
          )}
          {hasPermChanges && activeTab === "permissions" && (
            <div className="shrink-0 px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)] flex items-center justify-between animate-in slide-in-from-bottom-2">
              <span className="text-sm text-[var(--text-secondary)]">
                You have unsaved permission changes!
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (channel) {
                      setOverwrites((channel.permissionOverwrites || []).map(o => ({
                        id: o.id,
                        type: o.type,
                        allow: o.allow || "0",
                        deny: o.deny || "0",
                      })));
                    }
                  }}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline transition-colors"
                >
                  Reset
                </button>
                <Button
                  onClick={handleSavePermissions}
                  disabled={isSaving}
                  className="bg-[var(--app-accent)] hover:opacity-90 text-[var(--text-on-accent)] text-sm px-5 h-8"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
