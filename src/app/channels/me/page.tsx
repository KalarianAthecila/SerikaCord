"use client";

import { useState } from "react";
import { 
  Users, 
  Sparkles, 
  Search,
  Inbox,
  Gift,
  MessageCircle,
  Video,
  Phone
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Tab = "online" | "all" | "pending" | "blocked" | "add";

// Mock data for friends - in production this would come from API
const mockFriends = [
  { id: "1", username: "Alice", displayName: "Alice", status: "online", customStatus: "Playing Valorant", avatar: null },
  { id: "2", username: "Bob", displayName: "Bob", status: "idle", customStatus: null, avatar: null },
  { id: "3", username: "Charlie", displayName: "Charlie", status: "dnd", customStatus: "Do not disturb", avatar: null },
  { id: "4", username: "Diana", displayName: "Diana", status: "offline", customStatus: null, avatar: null },
];

const statusColors = {
  online: "#8B5CF6",
  idle: "#A78BFA", 
  dnd: "#EF4444",
  offline: "#555555",
};

export default function DirectMessagesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("online");
  const [searchQuery, setSearchQuery] = useState("");
  const [addFriendUsername, setAddFriendUsername] = useState("");

  const tabs = [
    { id: "online" as Tab, label: "Online", count: mockFriends.filter(f => f.status !== "offline").length },
    { id: "all" as Tab, label: "All", count: mockFriends.length },
    { id: "pending" as Tab, label: "Pending", count: 0 },
    { id: "blocked" as Tab, label: "Blocked", count: 0 },
  ];

  const filteredFriends = mockFriends.filter(friend => {
    if (activeTab === "online" && friend.status === "offline") return false;
    if (searchQuery && !friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="h-12 min-h-12 px-4 flex items-center gap-4 border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="flex items-center gap-2 text-white">
          <Users className="w-6 h-6 text-[#555555]" />
          <span className="font-semibold">Friends</span>
        </div>

        <div className="w-px h-6 bg-[#222222]" />

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                  : "text-[#888888] hover:bg-[#111111] hover:text-white"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-xs bg-[#8B5CF6] px-1.5 py-0.5 rounded-full text-white">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveTab("add")}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            activeTab === "add"
              ? "bg-transparent text-[#8B5CF6]"
              : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
          )}
        >
          Add Friend
        </button>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          <button className="p-2 text-[#666666] hover:text-white transition-colors">
            <Gift className="w-5 h-5" />
          </button>
          <button className="p-2 text-[#666666] hover:text-white transition-colors">
            <Inbox className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {activeTab === "add" ? (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wide mb-2">
                Add Friend
              </h2>
              <p className="text-[#888888] text-sm mb-4">
                You can add friends with their SerikaCord username.
              </p>
              
              <div className="relative max-w-xl">
                <Input
                  value={addFriendUsername}
                  onChange={(e) => setAddFriendUsername(e.target.value)}
                  placeholder="Enter a username"
                  className="h-14 bg-[#111111] border-[#222222] text-white placeholder:text-[#555555] pr-32 text-base rounded-md focus:border-[#8B5CF6] focus-visible:ring-0"
                />
                <button
                  disabled={!addFriendUsername}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    addFriendUsername
                      ? "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                      : "bg-[#8B5CF6]/50 text-white/50 cursor-not-allowed"
                  )}
                >
                  Send Friend Request
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Search */}
              <div className="p-4 pb-0">
                <div className="relative">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="h-9 bg-[#111111] border-[#222222] text-white placeholder:text-[#555555] pl-9 rounded-md focus:border-[#8B5CF6] focus-visible:ring-0"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
                </div>
              </div>

              {/* Friends list */}
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase text-[#666666] mb-2">
                    {activeTab === "online" ? "Online" : "All Friends"} — {filteredFriends.length}
                  </p>
                  
                  {filteredFriends.length > 0 ? (
                    <div className="space-y-0.5">
                      {filteredFriends.map((friend) => (
                        <div
                          key={friend.id}
                          className="group flex items-center justify-between p-2 rounded-lg hover:bg-[#111111] cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={friend.avatar || undefined} />
                                <AvatarFallback className="bg-[#8B5CF6] text-white">
                                  {friend.displayName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div 
                                className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0a]"
                                style={{ backgroundColor: statusColors[friend.status as keyof typeof statusColors] }}
                              />
                            </div>
                            
                            <div>
                              <p className="font-medium text-white text-sm">{friend.displayName}</p>
                              <p className="text-xs text-[#666666]">
                                {friend.customStatus || (friend.status === "online" ? "Online" : friend.status === "idle" ? "Idle" : friend.status === "dnd" ? "Do Not Disturb" : "Offline")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-[#111111] rounded-full hover:bg-[#1a1a1a] transition-colors">
                              <MessageCircle className="w-5 h-5 text-[#888888]" />
                            </button>
                            <button className="p-2 bg-[#111111] rounded-full hover:bg-[#1a1a1a] transition-colors">
                              <Phone className="w-5 h-5 text-[#888888]" />
                            </button>
                            <button className="p-2 bg-[#111111] rounded-full hover:bg-[#1a1a1a] transition-colors">
                              <Video className="w-5 h-5 text-[#888888]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-6">
                        <div className="w-24 h-24 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                          <Users className="w-12 h-12 text-[#8B5CF6]" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">
                        {searchQuery ? "No friends found" : "No friends yet"}
                      </h3>
                      <p className="text-sm text-[#666666] max-w-xs">
                        {searchQuery
                          ? "Try a different search"
                          : "Add some friends to start chatting!"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Active Now sidebar */}
        <div className="w-[360px] bg-[#0a0a0a] border-l border-[#1a1a1a] hidden lg:flex flex-col">
          <div className="p-4">
            <h3 className="text-xl font-bold text-white mb-4">Active Now</h3>
            
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-semibold text-white mb-1">
                It&apos;s quiet for now...
              </p>
              <p className="text-sm text-[#666666] max-w-[200px]">
                When a friend starts an activity—like playing a game or hanging out on voice—we&apos;ll show it here!
              </p>
            </div>
          </div>

          {/* Serika+ Promo */}
          <div className="mt-auto p-4">
            <div className="p-4 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
                <span className="font-semibold text-white">Serika+</span>
              </div>
              <p className="text-sm text-[#888888] mb-3">
                Get bigger uploads, custom profiles, and more!
              </p>
              <button className="w-full py-2 px-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium rounded-md transition-colors">
                Upgrade to Serika+
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
