"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useApplication } from "../useApplication";
import { Loader2, Copy, Check, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export default function OAuth2Page() {
  const params = useParams();
  const appId = params.id as string;
  const { app, loading, saving, saveApp } = useApplication(appId);
  const [redirectUris, setRedirectUris] = useState<string[]>([]);
  const [newUri, setNewUri] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (app) {
      setRedirectUris(app.redirectUris || []);
    }
  }, [app]);

  const addUri = () => {
    const uri = newUri.trim();
    if (uri && !redirectUris.includes(uri)) {
      setRedirectUris([...redirectUris, uri]);
      setNewUri("");
    }
  };

  const removeUri = (uri: string) => {
    setRedirectUris(redirectUris.filter((u) => u !== uri));
  };

  const handleSave = async () => {
    await saveApp({ redirectUris });
    toast.success("OAuth2 settings saved");
  };

  const copySecret = () => {
    if (app?.clientSecret) {
      navigator.clipboard.writeText(app.clientSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
      <h1 className="text-xl font-bold mb-6">OAuth2</h1>

      {/* Client ID */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-2">
          Client ID
        </label>
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2.5">
          <code className="text-sm text-[#ccc] flex-1 truncate font-mono">{app?.clientId || appId}</code>
        </div>
      </div>

      {/* Client Secret */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-2">
          Client Secret
        </label>
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2.5">
          <code className="text-sm text-[#ccc] flex-1 truncate font-mono">
            {app?.clientSecret || "••••••••••••••••"}
          </code>
          {app?.clientSecret && (
            <button
              onClick={copySecret}
              className="p-1.5 rounded hover:bg-white/10 text-[#888] hover:text-white transition-colors"
            >
              {copied ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
            </button>
          )}
        </div>
        <p className="text-xs text-[#666] mt-1.5">Keep your client secret safe.</p>
      </div>

      {/* Redirect URIs */}
      <div className="mb-8">
        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-2">
          Redirect URIs
        </label>
        <p className="text-xs text-[#666] mb-3">
          URIs that SerikaCord will redirect to after authorization.
        </p>
        <div className="space-y-2 mb-3">
          {redirectUris.map((uri) => (
            <div
              key={uri}
              className="flex items-center gap-2 bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2"
            >
              <code className="text-sm text-[#ccc] flex-1 truncate font-mono">{uri}</code>
              <button
                onClick={() => removeUri(uri)}
                className="p-1 rounded hover:bg-red-500/10 text-[#888] hover:text-red-400 transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newUri}
            onChange={(e) => setNewUri(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addUri()}
            placeholder="https://your-site.com/callback"
            className="flex-1 bg-[#1a1a1a] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#8B5CF6]/50"
          />
          <button
            onClick={addUri}
            className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-sm rounded-md transition-colors"
          >
            <Plus className="size-4" /> Add
          </button>
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
