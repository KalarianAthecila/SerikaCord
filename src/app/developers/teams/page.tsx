"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Trash2, Crown, Shield, User, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  icon?: string;
  ownerUsername: string;
  memberCount: number;
  appCount: number;
  createdAt: string;
}

interface TeamMember {
  id: string;
  username: string;
  avatar?: string;
  role: "owner" | "admin" | "developer" | "viewer";
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/developers/teams");
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
      }
    } catch {
      // Demo mode
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTeamName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/developers/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setTeams([...teams, data.team]);
        setNewTeamName("");
        setShowCreate(false);
        toast.success("Team created!");
      } else {
        toast.error("Failed to create team");
      }
    } catch {
      toast.error("Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete team "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/developers/teams/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTeams(teams.filter((t) => t.id !== id));
        toast.success("Team deleted");
      }
    } catch {
      toast.error("Failed to delete team");
    }
  };

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Developer Teams</h1>
            <p className="text-sm text-[#888] mt-1">
              Create teams to collaboratively manage applications with other developers.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="size-4" /> New Team
          </button>
        </div>

        {/* Create Team */}
        {showCreate && (
          <div className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h2 className="text-lg font-semibold mb-1">Create a New Team</h2>
            <p className="text-sm text-[#888] mb-4">
              Teams allow multiple developers to share access to applications.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Team Name"
                maxLength={100}
                className="flex-1 bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#8B5CF6]/50"
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newTeamName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white text-sm font-medium rounded-md transition-colors"
              >
                {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Create
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        {teams.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#555]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams..."
              className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#8B5CF6]/50"
            />
          </div>
        )}

        {/* Teams List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-[#8B5CF6]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users className="size-12 text-[#333] mx-auto mb-4" />
            <p className="text-[#888] text-sm">
              {teams.length === 0
                ? "No teams yet. Create one to start collaborating."
                : "No teams match your search."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((team) => (
              <div
                key={team.id}
                className="group flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] p-4 transition-all"
              >
                <div className="size-12 rounded-lg bg-gradient-to-br from-[#5865F2] to-[#8B5CF6] flex items-center justify-center shrink-0">
                  {team.icon ? (
                    <img src={team.icon} alt="" className="size-12 rounded-lg object-cover" />
                  ) : (
                    <Users className="size-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{team.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#777] mt-0.5">
                    <span className="flex items-center gap-1">
                      <Crown className="size-3" /> {team.ownerUsername}
                    </span>
                    <span>{team.memberCount} member{team.memberCount !== 1 ? "s" : ""}</span>
                    <span>{team.appCount} app{team.appCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(team.id, team.name)}
                  className="p-2 rounded-md hover:bg-red-500/10 text-[#888] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 rounded-lg border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Users className="size-4 text-[#8B5CF6]" /> About Developer Teams
          </h3>
          <ul className="text-xs text-[#888] space-y-1.5">
            <li>• Teams let multiple developers collaboratively manage applications</li>
            <li>• Team owners can invite members with different roles (Admin, Developer, Viewer)</li>
            <li>• Applications can be transferred between personal accounts and teams</li>
            <li>• Verified bots in 100+ servers must be owned by a verified team or individual</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
