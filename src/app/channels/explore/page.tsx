"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServerBadge } from "@/components/ui/badges";
import {
  Search,
  Users,
  TrendingUp,
  Gamepad2,
  Music,
  Code,
  Palette,
  BookOpen,
  Film,
  Sparkles,
  Globe,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Server {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  banner?: string;
  memberCount: number;
  onlineCount?: number;
  isPartnered?: boolean;
  category?: string;
  tags?: string[];
}

const categories = [
  { id: "all", name: "All", icon: Globe },
  { id: "gaming", name: "Gaming", icon: Gamepad2 },
  { id: "music", name: "Music", icon: Music },
  { id: "tech", name: "Tech & Programming", icon: Code },
  { id: "art", name: "Art & Design", icon: Palette },
  { id: "education", name: "Education", icon: BookOpen },
  { id: "entertainment", name: "Entertainment", icon: Film },
];

export default function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningServerId, setJoiningServerId] = useState<string | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (debouncedSearch) params.set("search", debouncedSearch);
    fetch(`/api/servers/discoverable?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setServers(data.servers ?? []))
      .catch(() => setServers([]))
      .finally(() => setIsLoading(false));
  }, [selectedCategory, debouncedSearch]);

  const handleJoinServer = async (serverId: string) => {
    setJoiningServerId(serverId);
    try {
      const response = await fetch(`/api/servers/${serverId}/join`, {
        method: "POST",
      });
      if (response.ok) {
        router.push(`/channels/${serverId}`);
      }
    } catch (error) {
      console.error("Failed to join server:", error);
    } finally {
      setJoiningServerId(null);
    }
  };

  const formatMemberCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] min-h-0">
      {/* Hero Section */}
      <div className="relative h-[200px] md:h-[280px] bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#8B5CF6] overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        
        <div className="relative h-full flex flex-col items-center justify-center px-4 text-center">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
            <h1 className="text-2xl md:text-4xl font-bold text-white">Discover Communities</h1>
          </div>
          <p className="text-white/80 text-sm md:text-lg max-w-xl mb-6">
            Find your people. From gaming to art, there&apos;s a place for everyone.
          </p>
          
          {/* Search Bar */}
          <div className="w-full max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Explore communities"
                className="pl-12 h-12 bg-[#111111]/90 backdrop-blur border-none text-white text-base placeholder:text-[#888888] rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all",
                    selectedCategory === category.id
                      ? "bg-[#8B5CF6] text-white"
                      : "bg-[#111111] text-[#b5bac1] hover:bg-[#1a1a1a] hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Featured Section */}
          {selectedCategory === "all" && !debouncedSearch && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
                <h2 className="text-lg font-bold text-white">Featured Communities</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servers.filter(s => s.isPartnered).slice(0, 2).map((server) => (
                  <div
                    key={server.id}
                    className="group relative bg-[#111111] rounded-xl overflow-hidden hover:ring-2 hover:ring-[#8B5CF6] transition-all cursor-pointer"
                    onClick={() => handleJoinServer(server.id)}
                  >
                    {/* Banner */}
                    <div 
                      className="h-24 bg-gradient-to-br from-[#8B5CF6]/30 to-[#6366F1]/30"
                      style={server.banner ? { backgroundImage: `url(${server.banner})`, backgroundSize: 'cover' } : undefined}
                    />
                    
                    {/* Content */}
                    <div className="p-4 relative">
                      {/* Server Icon */}
                      <div className="absolute -top-8 left-4">
                        <Avatar className="w-16 h-16 border-4 border-[#111111]">
                          <AvatarImage src={server.icon} />
                          <AvatarFallback className="bg-[#8B5CF6] text-white text-xl">
                            {server.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="ml-20">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold text-lg">{server.name}</h3>
                          {server.isPartnered && <ServerBadge type="partnered" size="sm" />}
                        </div>
                        <p className="text-[#b5bac1] text-sm line-clamp-2 mb-3">
                          {server.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                            <span className="text-[#b5bac1]">{formatMemberCount(server.onlineCount || 0)} Online</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#888888]" />
                            <span className="text-[#b5bac1]">{formatMemberCount(server.memberCount)} Members</span>
                          </div>
                        </div>
                      </div>

                      {/* Join indicator */}
                      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {joiningServerId === server.id ? (
                          <Loader2 className="w-5 h-5 text-[#8B5CF6] animate-spin" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-[#8B5CF6]" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Servers Grid */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">
              {searchQuery ? `Search Results for "${searchQuery}"` : "All Communities"}
            </h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
              </div>
            ) : servers.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-[#555555] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">No communities found</h3>
                <p className="text-[#888888] text-sm">
                  Try a different search term or browse categories
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {servers.map((server) => (
                  <div
                    key={server.id}
                    className="group bg-[#111111] rounded-xl p-4 hover:bg-[#1a1a1a] transition-all cursor-pointer"
                    onClick={() => handleJoinServer(server.id)}
                  >
                    <div className="flex gap-3">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={server.icon} />
                        <AvatarFallback className="bg-[#8B5CF6] text-white">
                          {server.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="text-white font-semibold truncate">{server.name}</h3>
                          {server.isPartnered && <ServerBadge type="partnered" size="sm" />}
                        </div>
                        <p className="text-[#888888] text-sm line-clamp-2 mb-2">
                          {server.description || "No description"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[#666666]">
                          <span className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                            {formatMemberCount(server.onlineCount || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {formatMemberCount(server.memberCount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {server.tags && server.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                        {server.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-[#222222] text-[#888888] text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
