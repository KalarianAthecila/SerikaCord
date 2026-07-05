"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Settings, Trash2, Bot, Loader2, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface App {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  botPublic?: boolean;
  botId?: string;
  createdAt: string;
  serverCount?: number;
  verified?: boolean;
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await fetch("/api/developers/applications");
      if (res.ok) {
        const data = await res.json();
        setApps(data.applications || []);
      }
    } catch {
      // Demo mode — show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newAppName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/developers/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAppName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success("Application created!");
        setApps([...apps, data.application]);
        setNewAppName("");
        setShowCreate(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create application");
      }
    } catch {
      toast.error("Failed to create application");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`))
      return;
    try {
      const res = await fetch(`/api/developers/applications/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setApps(apps.filter((a) => a.id !== id));
        toast.success("Application deleted");
      } else {
        toast.error("Failed to delete application");
      }
    } catch {
      toast.error("Failed to delete application");
    }
  };

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Applications</h1>
            <p className="text-sm text-[#949ba4] mt-1">
              Develop apps to customize and extend SerikaCord for millions of users.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium rounded-lg transition-colors shrink-0"
          >
            <Plus className="size-4" /> New Application
          </button>
        </div>

        {/* Create Application */}
        {showCreate && (
          <div className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h2 className="text-base font-semibold mb-1">Create a New Application</h2>
            <p className="text-sm text-[#949ba4] mb-4">
              Applications let you build bots, integrations, and tools for SerikaCord.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Application Name"
                className="flex-1 bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
                autoFocus
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newAppName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {creating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Create
              </button>
              <button
                onClick={() => { setShowCreate(false); setNewAppName(""); }}
                className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search + View Toggle */}
        {apps.length > 0 && (
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#555]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applications..."
                className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "grid" ? "bg-white/10 text-white" : "text-[#666] hover:text-white"
                )}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "list" ? "bg-white/10 text-white" : "text-[#666] hover:text-white"
                )}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* Applications */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-[#8B5CF6]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#6366f1]/20 flex items-center justify-center mx-auto mb-4">
              <Bot className="size-8 text-[#8B5CF6]" />
            </div>
            <h3 className="text-base font-semibold mb-1">
              {apps.length === 0 ? "No applications yet" : "No results found"}
            </h3>
            <p className="text-sm text-[#777] max-w-sm mx-auto">
              {apps.length === 0
                ? "Create your first application to start building bots and integrations for SerikaCord."
                : "Try a different search term."}
            </p>
            {apps.length === 0 && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="size-4" /> Create Application
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((app) => (
              <Link
                key={app.id}
                href={`/developers/applications/${app.id}/information`}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] p-4 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366f1] flex items-center justify-center shrink-0 overflow-hidden">
                    {app.icon ? (
                      <img src={app.icon} alt="" className="size-12 rounded-xl object-cover" />
                    ) : (
                      <Bot className="size-6 text-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold truncate">{app.name}</h3>
                      {app.verified && (
                        <span className="text-[9px] bg-[#5865F2] text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                    {app.botId && (
                      <p className="text-xs text-[#555] truncate mt-0.5">Bot ID: {app.botId}</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#777] line-clamp-2 mb-3">
                  {app.description || "No description set"}
                </p>
                {app.serverCount !== undefined && (
                  <p className="text-xs text-[#555]">
                    In {app.serverCount} server{app.serverCount !== 1 ? "s" : ""}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((app) => (
              <div
                key={app.id}
                className="group flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] p-4 transition-all"
              >
                <div className="size-11 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6366f1] flex items-center justify-center shrink-0 overflow-hidden">
                  {app.icon ? (
                    <img src={app.icon} alt="" className="size-11 rounded-lg object-cover" />
                  ) : (
                    <Bot className="size-5 text-white" />
                  )}
                </div>

                <Link href={`/developers/applications/${app.id}/information`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">{app.name}</h3>
                    {app.verified && (
                      <span className="text-[10px] bg-[#5865F2] text-white px-1.5 py-0.5 rounded font-bold">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#777] truncate mt-0.5">
                    {app.description || "No description set"}
                  </p>
                  {app.serverCount !== undefined && (
                    <p className="text-xs text-[#555] mt-0.5">
                      In {app.serverCount} server{app.serverCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </Link>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/developers/applications/${app.id}/information`}
                    className="p-2 rounded-md hover:bg-white/10 text-[#888] hover:text-white transition-colors"
                    title="Settings"
                  >
                    <Settings className="size-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(app.id, app.name)}
                    className="p-2 rounded-md hover:bg-red-500/10 text-[#888] hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
