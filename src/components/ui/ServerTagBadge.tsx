"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cdnImage, cn } from "@/lib/utils";
import { ArrowRight, Loader2, LogIn, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ServerInfo {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  description: string | null;
  memberCount: number;
  tagText: string | null;
  tagAllowJoin: boolean;
}

interface ServerTagBadgeProps {
  tagText: string;
  tagIcon?: string | null;
  serverId: string;
  serverName?: string;
  /** When true, never show a popup (e.g. in compact inline contexts) */
  noPopup?: boolean;
  /** Extra class names on the pill */
  className?: string;
}

function ServerTagPopupContent({ serverId, onClose }: { serverId: string; onClose: () => void }) {
  const router = useRouter();
  const [info, setInfo] = useState<ServerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch(`/api/servers/${serverId}/public-info`),
      fetch(`/api/servers/${serverId}/members/@me/permissions`),
    ])
      .then(async ([infoRes, memberRes]) => {
        if (cancelled) return;
        if (infoRes.ok) {
          const d = await infoRes.json();
          if (!cancelled) setInfo(d);
        }
        if (!cancelled) setIsMember(memberRes.ok);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [serverId]);

  const handleJoin = async () => {
    if (!info) return;
    if (isMember) {
      onClose();
      router.push(`/channels/${info.id}`);
      return;
    }

    setJoining(true);
    try {
      // Use the dedicated server join endpoint; it respects joinMode on the server.
      const res = await fetch(`/api/servers/${info.id}/join`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorText = String((data as { error?: string })?.error || "").toLowerCase();
        if (errorText.includes("already") && errorText.includes("member")) {
          setIsMember(true);
          toast.info(`You are already in ${info.name}`);
          onClose();
          router.push(`/channels/${info.id}`);
          return;
        }
        toast.error(data.error || "Failed to join server");
        return;
      }
      toast.success(`Joined ${info.name}!`);
      onClose();
      router.push(`/channels/${info.id}`);
    } catch {
      toast.error("Failed to join server");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-5 h-5 animate-spin text-[--app-accent]" />
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="w-72">
      {/* Banner area */}
      <div className="relative h-16 rounded-t-xl overflow-hidden bg-gradient-to-r from-[--app-accent] to-[--accent-hover]">
        {info.banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cdnImage(info.banner)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      <div className="px-4 pb-4 -mt-8">
        {/* Server icon */}
        <Avatar className="w-16 h-16 rounded-2xl">
          <AvatarImage src={info.icon ?? undefined} />
          <AvatarFallback className="bg-[--app-accent] text-white text-xl rounded-2xl">
            {info.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="mt-2">
          <h3 className="text-white font-bold text-base leading-tight">{info.name}</h3>
          {info.description && (
            <p className="text-[--text-muted] text-xs mt-1 line-clamp-2">{info.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-[--text-muted]">
            <Users className="w-3.5 h-3.5" />
            <span>{info.memberCount.toLocaleString()} members</span>
          </div>
        </div>

        {(info.tagAllowJoin || isMember) && (
          <button
            onClick={() => void handleJoin()}
            disabled={joining}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 bg-[--app-accent] hover:bg-[--accent-hover] disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {joining ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isMember ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {joining ? "Joining…" : isMember ? "Go to Server" : "Join Server"}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * A compact server tag pill. Shows icon + text; clicking opens a server
 * info popup with optional join action.
 */
export function ServerTagBadge({ tagText, tagIcon, serverId, noPopup, className }: ServerTagBadgeProps) {
  const [open, setOpen] = useState(false);

  const pill = (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold tracking-wider select-none",
        "bg-[--app-accent]/15 text-[--app-accent] border border-[--app-accent]/25",
        !noPopup && "cursor-pointer hover:bg-[--app-accent]/25 hover:text-[--text-primary] transition-colors",
        className
      )}
    >
      {tagIcon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tagIcon} alt="" className="w-3 h-3 rounded-sm object-cover flex-shrink-0" />
      )}
      {tagText}
    </span>
  );

  if (noPopup) return pill;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        {pill}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={6}
        className="w-auto p-0 border border-[--bg-hover] bg-[--bg-app] rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ServerTagPopupContent serverId={serverId} onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
