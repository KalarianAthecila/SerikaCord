"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Star, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "dm" | "group";
  name: string;
  avatar?: string;
  avatars?: string[];
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isPinned?: boolean;
  isFavorite?: boolean;
  status?: "online" | "idle" | "dnd" | "offline";
}

interface MobileMessagesViewProps {
  onAddFriend?: () => void;
}

export function MobileMessagesView({ onAddFriend }: MobileMessagesViewProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch messages/DMs
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/dms");
        if (response.ok) {
          const data = await response.json();
          // Transform DM channels to message format
          const formattedMessages = (data.channels || []).map((channel: any) => {
            const recipient = channel.recipients?.[0];
            return {
              id: channel.id,
              type: channel.type === "group" ? "group" : "dm",
              name: recipient?.displayName || recipient?.username || "Unknown",
              avatar: recipient?.avatar,
              lastMessage: channel.lastMessage?.content || "No messages yet",
              timestamp: formatTimestamp(channel.updatedAt),
              status: recipient?.status || "offline",
            };
          });
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const formatTimestamp = (date: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "now";
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString();
  };

  const statusColors: Record<string, string> = {
    online: "#8B5CF6",
    idle: "#A78BFA",
    dnd: "#EF4444",
    offline: "#555555",
  };

  const handleMessageClick = (message: Message) => {
    router.push(`/channels/@me/${message.id}`);
  };

  // Group messages by pinned/favorites
  const pinnedMessages = messages.filter(m => m.isPinned || m.isFavorite);
  const regularMessages = messages.filter(m => !m.isPinned && !m.isFavorite);

  return (
    <div className="flex flex-col h-full bg-[#000000]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-8 pb-4 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm sticky top-0 z-10 safe-area-top">
        <h1 className="text-3xl font-bold text-white tracking-tight">Messages</h1>
        <button 
          onClick={onAddFriend}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] text-white hover:bg-[#252525] transition-all active:scale-95 border border-[#333]"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Pinned/Favorites Section */}
      {pinnedMessages.length > 0 && (
        <div className="px-5 py-2 border-b border-[#1a1a1a]">
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Favorites</h2>
          <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {pinnedMessages.map((message) => (
              <button
                key={message.id}
                onClick={() => handleMessageClick(message)}
                className="flex flex-col items-center gap-2 min-w-[72px] group"
              >
                <div className="relative transform transition-transform group-active:scale-95">
                  {message.type === "group" && message.avatars ? (
                    <div className="w-[68px] h-[68px] rounded-2xl bg-[#1a1a1a] relative overflow-hidden ring-2 ring-transparent group-focus:ring-[#8B5CF6]">
                      {/* Group avatar stack */}
                      <Avatar className="w-9 h-9 absolute top-1 left-1 border-2 border-[#0a0a0a]">
                        <AvatarImage src={message.avatars[0]} />
                        <AvatarFallback className="bg-[#8B5CF6]">
                          {message.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {message.avatars[1] && (
                        <Avatar className="w-9 h-9 absolute bottom-1 right-1 border-2 border-[#0a0a0a]">
                          <AvatarImage src={message.avatars[1]} />
                          <AvatarFallback className="bg-[#6366F1]">+</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ) : (
                    <Avatar className="w-[68px] h-[68px] rounded-2xl ring-2 ring-transparent group-focus:ring-[#8B5CF6]">
                      <AvatarImage src={message.avatar} />
                      <AvatarFallback className="bg-[#8B5CF6] text-white text-2xl">
                        {message.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {message.isFavorite && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#F59E0B] rounded-full flex items-center justify-center border-2 border-black">
                      <Star className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  )}
                  {/* Online Status for Favorites */}
                   <div
                      className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#000000]"
                      style={{ backgroundColor: statusColors[message.status || "offline"] }}
                    />
                </div>
                <span className="text-xs font-medium text-neutral-400 truncate max-w-[72px] group-hover:text-white transition-colors">
                  {message.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages List */}
      <ScrollArea className="flex-1 px-2">
        <div className="pb-24 pt-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#1a1a1a] flex items-center justify-center mb-6">
                <UserPlus className="w-10 h-10 text-[#666666]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No messages yet</h3>
              <p className="text-neutral-500 text-base mb-6 max-w-[250px]">
                Start a conversation by adding friends or joining a server
              </p>
              <button 
                onClick={onAddFriend}
                className="px-8 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-purple-500/20"
              >
                Find Friends
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {regularMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className="w-full flex items-center gap-4 px-3 py-4 hover:bg-[#1a1a1a]/50 active:bg-[#1a1a1a] rounded-2xl transition-all"
                >
                  <div className="relative flex-shrink-0">
                    {message.type === "group" && message.avatars ? (
                      <div className="w-14 h-14 rounded-full bg-[#1a1a1a] relative">
                        <Avatar className="w-8 h-8 absolute top-0 left-0 border-2 border-[#0a0a0a]">
                          <AvatarImage src={message.avatars[0]} />
                          <AvatarFallback className="bg-[#8B5CF6] text-xs">
                            {message.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {message.avatars[1] && (
                          <Avatar className="w-8 h-8 absolute bottom-0 right-0 border-2 border-[#0a0a0a]">
                            <AvatarImage src={message.avatars[1]} />
                            <AvatarFallback className="bg-[#6366F1] text-xs">+</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ) : (
                      <Avatar className="w-14 h-14 border border-white/5">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback className="bg-[#8B5CF6] text-white text-lg font-bold">
                          {message.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-[#000000]"
                      style={{ backgroundColor: statusColors[message.status || "offline"] }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 text-left space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                       {/* Name scaling */}
                      <span className="text-[17px] font-semibold text-white truncate leading-tight">
                        {message.name}
                      </span>
                      <span className="text-xs font-medium text-neutral-500 flex-shrink-0">
                        {message.timestamp}
                      </span>
                    </div>
                    <p className="text-[15px] text-neutral-400 truncate leading-snug font-medium">
                      {message.lastMessage}
                    </p>
                  </div>

                  {message.unreadCount && message.unreadCount > 0 && (
                    <span className="min-w-[22px] h-[22px] px-1.5 flex items-center justify-center bg-[#ED4245] text-white text-xs font-bold rounded-full shadow-sm">
                      {message.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
