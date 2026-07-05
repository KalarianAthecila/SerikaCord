"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Settings, Trash2, Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Applications</h1>
            <p className="text-sm text-[#888] mt-1">
              Create and manage your SerikaCord applications and bots.
            </p>
          </div>
        </div>

        {/* Create Application Card */}
        <div className="mb-8 rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold mb-1">Create a New Application</h2>
          <p className="text-sm text-[#888] mb-4">
            Applications let you build bots, integrations, and tools for SerikaCord.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Application Name"
              className="flex-1 bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#8B5CF6]/50"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newAppName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white text-sm font-medium rounded-md transition-colors"
            >
              {creating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Create
            </button>
          </div>
        </div>

        {/* Search */}
        {apps.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#555]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applications..."
              className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#8B5CF6]/50"
            />
          </div>
        )}

        {/* Applications List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-[#8B5CF6]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Bot className="size-12 text-[#333] mx-auto mb-4" />
            <p className="text-[#888] text-sm">
              {apps.length === 0
                ? "No applications yet. Create one above to get started."
                : "No applications match your search."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((app) => (
              <div
                key={app.id}
                className="group flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] p-4 transition-all"
              >
                <div className="size-12 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6366f1] flex items-center justify-center shrink-0">
                  {app.icon ? (
                    <img src={app.icon} alt="" className="size-12 rounded-lg object-cover" />
                  ) : (
                    <Bot className="size-6 text-white" />
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
