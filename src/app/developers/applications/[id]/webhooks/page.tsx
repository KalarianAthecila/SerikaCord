"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useApplication } from "../useApplication";
import { Loader2, Plus, Trash2, Webhook, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Webhook {
  id: string;
  url: string;
  name: string;
  channelId?: string;
  createdAt: string;
}

export default function WebhooksPage() {
  const params = useParams();
  const appId = params.id as string;
  const { app, loading } = useApplication(appId);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchWebhooks();
  }, [appId]);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch(`/api/developers/applications/${appId}/webhooks`);
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data.webhooks || []);
      }
    } catch {
      // Demo mode
    }
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newUrl.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/developers/applications/${appId}/webhooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), url: newUrl.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setWebhooks([...webhooks, data.webhook]);
        setNewName("");
        setNewUrl("");
        setShowAdd(false);
        toast.success("Webhook created!");
      } else {
        toast.error("Failed to create webhook");
      }
    } catch {
      toast.error("Failed to create webhook");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this webhook?")) return;
    try {
      const res = await fetch(`/api/developers/applications/${appId}/webhooks/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWebhooks(webhooks.filter((w) => w.id !== id));
        toast.success("Webhook deleted");
      }
    } catch {
      toast.error("Failed to delete webhook");
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Webhooks</h1>
          <p className="text-sm text-[#888] mt-1">
            Manage webhooks for your application to receive real-time events.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="size-4" /> Add Webhook
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-2">
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My Webhook"
              className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#8B5CF6]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://your-site.com/webhook"
              className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#8B5CF6]/50"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim() || !newUrl.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white text-sm font-medium rounded-md transition-colors"
          >
            {creating ? <Loader2 className="size-4 animate-spin" /> : null}
            Create Webhook
          </button>
        </div>
      )}

      {webhooks.length === 0 ? (
        <div className="text-center py-20">
          <Webhook className="size-12 text-[#333] mx-auto mb-4" />
          <p className="text-[#888] text-sm">No webhooks yet. Add one to receive events.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="group flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="size-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <Webhook className="size-5 text-[#8B5CF6]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{webhook.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs text-[#777] truncate font-mono">{webhook.url}</code>
                  <button
                    onClick={() => copyUrl(webhook.id, webhook.url)}
                    className="p-1 rounded hover:bg-white/10 text-[#888] hover:text-white transition-colors shrink-0"
                  >
                    {copiedId === webhook.id ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleDelete(webhook.id)}
                className="p-2 rounded-md hover:bg-red-500/10 text-[#888] hover:text-red-400 transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
