"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useApplication } from "../useApplication";
import { Loader2, Save, Gift } from "lucide-react";
import { toast } from "sonner";

export default function DirectoryPage() {
  const params = useParams();
  const appId = params.id as string;
  const { app, loading, saving, saveApp } = useApplication(appId);
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [category, setCategory] = useState("");
  const [heroImage, setHeroImage] = useState("");

  useEffect(() => {
    if (app) {
      setShortDesc(app.description || "");
      setLongDesc(app.description || "");
      setCategory(app.tags?.[0] || "");
      setHeroImage(app.icon || "");
    }
  }, [app]);

  const handleSave = async () => {
    const tags = category ? [category] : [];
    const ok = await saveApp({
      description: shortDesc,
      tags,
      coverImage: heroImage || undefined,
    });
    if (ok) toast.success("Directory page saved");
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
      <h1 className="text-xl font-bold mb-6">App Directory Page</h1>
      <p className="text-sm text-[#888] mb-6">
        Customize how your app appears in the SerikaCord App Directory.
      </p>

      {/* Short Description */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-2">
          Short Description
        </label>
        <input
          type="text"
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          maxLength={128}
          className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/50"
          placeholder="A brief one-liner about your app"
        />
        <p className="text-xs text-[#666] mt-1.5">{shortDesc.length}/128</p>
      </div>

      {/* Long Description */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-2">
          Long Description
        </label>
        <textarea
          value={longDesc}
          onChange={(e) => setLongDesc(e.target.value)}
          maxLength={2000}
          rows={8}
          className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/50 resize-none"
          placeholder="Describe your app in detail. Markdown is supported."
        />
        <p className="text-xs text-[#666] mt-1.5">{longDesc.length}/2000</p>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/50"
        >
          <option value="">Select a category...</option>
          <option value="social">Social</option>
          <option value="music">Music</option>
          <option value="gaming">Gaming</option>
          <option value="productivity">Productivity</option>
          <option value="education">Education</option>
          <option value="entertainment">Entertainment</option>
          <option value="utility">Utility</option>
          <option value="moderation">Moderation</option>
          <option value="finance">Finance</option>
          <option value="ai">AI & Machine Learning</option>
        </select>
      </div>

      {/* Hero Image */}
      <div className="mb-8">
        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-2">
          Hero Image URL
        </label>
        <input
          type="url"
          value={heroImage}
          onChange={(e) => setHeroImage(e.target.value)}
          placeholder="https://..."
          className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-md px-4 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#8B5CF6]/50"
        />
        <p className="text-xs text-[#666] mt-1.5">Recommended: 1920x1080, PNG or JPG.</p>
      </div>

      {/* Preview */}
      <div className="mb-8 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
        <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wide mb-3">Preview</h3>
        <div className="rounded-lg overflow-hidden">
          {heroImage && (
            <div className="aspect-video bg-[#1a1a1a] mb-3">
              <img src={heroImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6366f1] flex items-center justify-center">
              <Gift className="size-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{app?.name || "App Name"}</h4>
              <p className="text-xs text-[#888]">{shortDesc || "No description"}</p>
            </div>
          </div>
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
