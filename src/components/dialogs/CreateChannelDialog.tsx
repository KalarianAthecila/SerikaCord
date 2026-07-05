"use client";

import { useState, useEffect, useMemo } from "react";
import { useServer } from "@/contexts/ServerContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hash, Volume2, Folder } from "lucide-react";
import { toast } from "sonner";

interface CreateChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultParentId?: string;
  defaultType?: "text" | "voice" | "category";
}

export function CreateChannelDialog({
  open,
  onOpenChange,
  defaultParentId,
  defaultType,
}: CreateChannelDialogProps) {
  const { currentServer, fetchChannels, channels } = useServer();
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState<"text" | "voice" | "category">("text");
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [nsfw, setNsfw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = useMemo(
    () => channels.filter((c) => c.type === "category"),
    [channels]
  );

  useEffect(() => {
    if (open) {
      setChannelType(defaultType || "text");
      setParentId(defaultParentId);
      setNsfw(false);
      setChannelName("");
      setError("");
    }
  }, [open, defaultType, defaultParentId]);

  const handleCreate = async () => {
    if (!channelName.trim() || !currentServer) return;

    setIsLoading(true);
    setError("");

    const formattedName =
      channelType === "text"
        ? channelName.toLowerCase().replace(/\s+/g, "-")
        : channelName.trim();

    try {
      const response = await fetch(`/api/servers/${currentServer.id}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formattedName,
          type: channelType,
          parentId: channelType !== "category" ? parentId || null : undefined,
          nsfw: channelType !== "category" ? nsfw : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create channel");
      }

      await fetchChannels(currentServer.id);
      onOpenChange(false);
      resetForm();
      toast.success("Channel created!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create channel");
      toast.error(err instanceof Error ? err.message : "Failed to create channel");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setChannelName("");
    setChannelType("text");
    setParentId(undefined);
    setNsfw(false);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="bg-[#0a0a0a] border border-[#1a1a1a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Channel</DialogTitle>
          <DialogDescription className="text-[#888888]">
            in {currentServer?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Channel Type */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase text-[#888888]">
              Channel Type
            </Label>
            <div className="space-y-2">
              <button
                onClick={() => setChannelType("text")}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors border ${
                  channelType === "text"
                    ? "bg-[#8B5CF6]/10 border-[#8B5CF6]"
                    : "bg-[#111111] border-[#222222] hover:border-[#333333]"
                }`}
              >
                <Hash className="w-6 h-6 text-[#666666]" />
                <div className="text-left">
                  <div className="font-medium">Text</div>
                  <div className="text-xs text-[#666666]">
                    Send messages, images, GIFs, emoji, and more
                  </div>
                </div>
                <div
                  className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    channelType === "text"
                      ? "border-[#8B5CF6] bg-[#8B5CF6]"
                      : "border-[#666666]"
                  }`}
                >
                  {channelType === "text" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setChannelType("voice")}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors border ${
                  channelType === "voice"
                    ? "bg-[#8B5CF6]/10 border-[#8B5CF6]"
                    : "bg-[#111111] border-[#222222] hover:border-[#333333]"
                }`}
              >
                <Volume2 className="w-6 h-6 text-[#666666]" />
                <div className="text-left">
                  <div className="font-medium">Voice</div>
                  <div className="text-xs text-[#666666]">
                    Hang out together with voice and video
                  </div>
                </div>
                <div
                  className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    channelType === "voice"
                      ? "border-[#8B5CF6] bg-[#8B5CF6]"
                      : "border-[#666666]"
                  }`}
                >
                  {channelType === "voice" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setChannelType("category")}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors border ${
                  channelType === "category"
                    ? "bg-[#8B5CF6]/10 border-[#8B5CF6]"
                    : "bg-[#111111] border-[#222222] hover:border-[#333333]"
                }`}
              >
                <Folder className="w-6 h-6 text-[#666666]" />
                <div className="text-left">
                  <div className="font-medium">Category</div>
                  <div className="text-xs text-[#666666]">
                    Group channels together under a category
                  </div>
                </div>
                <div
                  className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    channelType === "category"
                      ? "border-[#8B5CF6] bg-[#8B5CF6]"
                      : "border-[#666666]"
                  }`}
                >
                  {channelType === "category" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Channel Name */}
          <div className="space-y-2">
            <Label htmlFor="channelName" className="text-xs font-bold uppercase text-[#888888]">
              Channel Name
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]">
                {channelType === "text" ? (
                  <Hash className="w-5 h-5" />
                ) : channelType === "voice" ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <Folder className="w-5 h-5" />
                )}
              </div>
              <Input
                id="channelName"
                value={channelName}
                onChange={(e) => {
                  const val = e.target.value;
                  if (channelType === "text") {
                    setChannelName(val.toLowerCase().replace(/\s+/g, "-"));
                  } else {
                    setChannelName(val);
                  }
                }}
                placeholder={
                  channelType === "text"
                    ? "new-channel"
                    : channelType === "voice"
                    ? "New Voice Channel"
                    : "New Category"
                }
                className="pl-10 bg-[#111111] border-[#222222] text-white placeholder:text-[#555555] focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-0"
              />
            </div>
          </div>

          {/* Category Dropdown (if channel is not category) */}
          {channelType !== "category" && categories.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-[#888888]">
                Category
              </Label>
              <Select
                value={parentId || "none"}
                onValueChange={(val) => setParentId(val === "none" ? undefined : val)}
              >
                <SelectTrigger className="w-full bg-[#111111] border-[#222222] text-white">
                  <SelectValue placeholder="No Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border border-[#1a1a1a] text-white">
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* NSFW Checkbox (if channel is not category) */}
          {channelType !== "category" && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#222222] bg-[#111111]">
              <div className="space-y-0.5">
                <Label htmlFor="nsfw-toggle" className="font-medium cursor-pointer text-sm">
                  Age-Restricted Channel (NSFW)
                </Label>
                <div className="text-xs text-[#666666] max-w-[280px]">
                  Users will need to confirm they are of legal age to view this channel.
                </div>
              </div>
              <input
                id="nsfw-toggle"
                type="checkbox"
                checked={nsfw}
                onChange={(e) => setNsfw(e.target.checked)}
                className="w-4 h-4 rounded accent-[#8B5CF6] cursor-pointer"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-transparent hover:underline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!channelName.trim() || isLoading}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
          >
            {isLoading ? "Creating..." : "Create Channel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
