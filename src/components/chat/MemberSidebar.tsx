"use client";

import { useState, useEffect, useCallback } from "react";
import { useServer } from "@/contexts/ServerContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  status: "online" | "idle" | "dnd" | "offline";
  roles?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
}

export function MemberSidebar() {
  const { currentServer } = useServer();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!currentServer) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/servers/${currentServer.id}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentServer]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const onlineMembers = members.filter((m) => m.status !== "offline");
  const offlineMembers = members.filter((m) => m.status === "offline");

  if (!currentServer) return null;

  return (
    <div className="w-60 h-full bg-[#0a0a0a] border-l border-[#1a1a1a] flex-shrink-0">
      <ScrollArea className="h-full">
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Online Members */}
              {onlineMembers.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 mb-2">
                    <span className="text-xs font-semibold uppercase text-[#666666]">
                      Online — {onlineMembers.length}
                    </span>
                  </div>
                  {onlineMembers.map((member) => (
                    <MemberItem key={member.id} member={member} />
                  ))}
                </div>
              )}

              {/* Offline Members */}
              {offlineMembers.length > 0 && (
                <div>
                  <div className="px-4 mb-2">
                    <span className="text-xs font-semibold uppercase text-[#666666]">
                      Offline — {offlineMembers.length}
                    </span>
                  </div>
                  {offlineMembers.map((member) => (
                    <MemberItem key={member.id} member={member} />
                  ))}
                </div>
              )}

              {members.length === 0 && (
                <div className="text-center text-[#666666] text-sm py-8">
                  No members found
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface MemberItemProps {
  member: Member;
}

function MemberItem({ member }: MemberItemProps) {
  const isOffline = member.status === "offline";

  return (
    <button
      className={cn(
        "w-full px-2 py-1.5 mx-2 rounded flex items-center gap-3 hover:bg-[#111111] transition-all group",
        isOffline && "opacity-50"
      )}
      style={{ width: "calc(100% - 16px)" }}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="w-8 h-8">
          <AvatarImage src={member.avatar} alt={member.displayName} />
          <AvatarFallback className="bg-[#8B5CF6] text-white text-xs">
            {member.displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[2.5px] border-[#0a0a0a]",
            member.status === "online" && "bg-[#8B5CF6]",
            member.status === "idle" && "bg-[#A78BFA]",
            member.status === "dnd" && "bg-red-500",
            member.status === "offline" && "bg-[#555555]"
          )}
        />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div
          className={cn(
            "text-sm font-medium truncate",
            member.roles?.[0]?.color
              ? `text-[${member.roles[0].color}]`
              : "text-white"
          )}
          style={member.roles?.[0]?.color ? { color: member.roles[0].color } : undefined}
        >
          {member.displayName}
        </div>
      </div>
    </button>
  );
}
