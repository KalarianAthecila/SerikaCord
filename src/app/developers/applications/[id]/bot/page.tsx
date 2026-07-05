"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useApplication } from "../useApplication";
import { Copy, Check, Loader2, RefreshCw, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function BotPage() {
  const params = useParams();
  const appId = params.id as string;
  const { app, loading, saving, saveApp } = useApplication(appId);
  const [botPublic, setBotPublic] = useState(false);
  const [botRequireCodeGrant, setBotRequireCodeGrant] = useState(false);
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (app) {
      setBotPublic(app.botPublic ?? false);
      setBotRequireCodeGrant(app.botRequireCodeGrant ?? false);
      setToken(app.botToken || "");
    }
  }, [app]);

  const handleSave = async () => {
    await saveApp({ botPublic, botRequireCodeGrant });
    toast.success("Changes saved");
  };

  const handleResetToken = async () => {
    if (!confirm("Are you sure? Resetting the token will invalidate the old one. Any bots using it will stop working.")) return;
    setResetting(true);
    try {
      const res = await fetch(`/api/developers/applications/${appId}/bot/reset-token`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        toast.success("Token reset! Copy the new token now.");
      } else {
        toast.error("Failed to reset token");
      }
    } catch {
      toast.error("Failed to reset token");
    } finally {
      setResetting(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
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
      <h1 className="text-xl font-bold mb-6">Bot</h1>

      {/* Bot Token */}
      <div className="mb-8">
        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-2">
          Token
        </label>
        <p className="text-xs text-[#666] mb-3">
          Keep your token secret. Do not commit it to public repositories.
        </p>
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2.5">
          <code className="text-sm text-[#ccc] flex-1 truncate font-mono">
            {token ? (showToken ? token : "••••••••••••••••••••••••••") : "No token set"}
          </code>
          {token && (
            <>
              <button
                onClick={() => setShowToken(!showToken)}
                className="p-1.5 rounded hover:bg-white/10 text-[#888] hover:text-white transition-colors"
              >
                {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
              <button
                onClick={copyToken}
                className="p-1.5 rounded hover:bg-white/10 text-[#888] hover:text-white transition-colors"
              >
                {copied ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
              </button>
            </>
          )}
        </div>
        <button
          onClick={handleResetToken}
          disabled={resetting}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-md transition-colors"
        >
          {resetting ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Reset Token
        </button>
      </div>

      {/* Bot Settings */}
      <div className="space-y-4 mb-8">
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">Public Bot</h3>
              <p className="text-xs text-[#888] mt-1">
                Allow others to invite your bot to their servers via OAuth2.
              </p>
            </div>
            <button
              onClick={() => setBotPublic(!botPublic)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                botPublic ? "bg-[#8B5CF6]" : "bg-[#333]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full transition-transform ${
                  botPublic ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">Require OAuth2 Code Grant</h3>
              <p className="text-xs text-[#888] mt-1">
                Requires users to complete the OAuth2 code grant flow when adding your bot.
              </p>
            </div>
            <button
              onClick={() => setBotRequireCodeGrant(!botRequireCodeGrant)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                botRequireCodeGrant ? "bg-[#8B5CF6]" : "bg-[#333]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full transition-transform ${
                  botRequireCodeGrant ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Privileged Gateway Intents */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-3">Privileged Gateway Intents</h3>
        <p className="text-xs text-[#666] mb-3">
          Some intents require verification if your bot is in 100+ servers.
        </p>
        <div className="space-y-3">
          {[
            { name: "Presence Intent", desc: "Receive presence updates for users.", verified: true },
            { name: "Server Members Intent", desc: "Receive server member events.", verified: true },
            { name: "Message Content Intent", desc: "Access the content of messages.", verified: true },
          ].map((intent) => (
            <div
              key={intent.name}
              className="flex items-start justify-between gap-4 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4"
            >
              <div>
                <h4 className="text-sm font-semibold">{intent.name}</h4>
                <p className="text-xs text-[#888] mt-1">{intent.desc}</p>
                {app?.verified === false && (app?.serverCount || 0) >= 100 && (
                  <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                    <AlertTriangle className="size-3" /> Requires verification for bots in 100+ servers.
                  </p>
                )}
              </div>
              <button className="relative w-11 h-6 rounded-full bg-[#333] transition-colors shrink-0">
                <span className="absolute top-0.5 left-0.5 size-5 bg-white rounded-full" />
              </button>
            </div>
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
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Save Changes
        </button>
      </div>
    </div>
  );
}
