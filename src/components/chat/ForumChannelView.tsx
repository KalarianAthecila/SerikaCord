"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessagesSquare, Ticket, Plus, Lock, Archive, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

interface ForumTag {
  id: string;
  name: string;
  emojiName?: string;
}

interface ThreadOwner {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
}

interface ForumThread {
  id: string;
  name: string;
  type: "public_thread" | "private_thread";
  archived: boolean;
  locked: boolean;
  appliedTags: string[];
  messageCount: number;
  lastMessageId: string | null;
  createdAt: string;
  owner: ThreadOwner | null;
}

interface ForumChannelViewProps {
  serverId: string;
  channelId: string;
  channelName: string;
}

export function ForumChannelView({ serverId, channelId, channelName }: ForumChannelViewProps) {
  const router = useRouter();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [availableTags, setAvailableTags] = useState<ForumTag[]>([]);
  const [forumMode, setForumMode] = useState<"posts" | "tickets">("posts");
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // New-post form
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postTags, setPostTags] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const isTickets = forumMode === "tickets";

  const loadThreads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/channels/${channelId}/threads?archived=${showArchived}`);
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
        setAvailableTags(data.availableTags || []);
        setForumMode(data.forumMode || "posts");
      }
    } catch {
      // ignore transient errors
    } finally {
      setLoading(false);
    }
  }, [channelId, showArchived]);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  const handleCreate = async () => {
    if (!postTitle.trim() || !postBody.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/channels/${channelId}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: postTitle.trim(), content: postBody.trim(), appliedTags: postTags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post");
      setCreateOpen(false);
      setPostTitle("");
      setPostBody("");
      setPostTags([]);
      toast.success(isTickets ? "Ticket opened" : "Post created");
      router.push(`/channels/${serverId}/${data.thread.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  const tagName = (id: string) => availableTags.find((t) => t.id === id)?.name;

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] min-w-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-12 border-b border-[var(--border-subtle)] shrink-0">
        {isTickets ? (
          <Ticket className="w-5 h-5 text-[var(--text-muted)]" />
        ) : (
          <MessagesSquare className="w-5 h-5 text-[var(--text-muted)]" />
        )}
        <span className="font-semibold text-[var(--text-primary)] truncate">{channelName}</span>
        <span className="text-xs text-[var(--text-muted)] ml-1">{isTickets ? "Tickets" : "Forum"}</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              showArchived
                ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <Archive className="w-3.5 h-3.5" /> Archived
          </button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-8 bg-[var(--app-accent)] hover:opacity-90 text-white text-sm gap-1.5"
          >
            <Plus className="w-4 h-4" /> {isTickets ? "New Ticket" : "New Post"}
          </Button>
        </div>
      </div>

      {isTickets && (
        <div className="px-4 py-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          Tickets are private — each is visible only to its creator and support staff.
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2 max-w-3xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[var(--text-muted)]">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--text-muted)]">
              {isTickets ? <Ticket className="w-10 h-10 mb-3 opacity-40" /> : <MessagesSquare className="w-10 h-10 mb-3 opacity-40" />}
              <p className="text-sm">
                {showArchived ? "No archived threads." : isTickets ? "No tickets yet. Open one to get started." : "No posts yet. Be the first to post!"}
              </p>
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => router.push(`/channels/${serverId}/${thread.id}`)}
                className="w-full text-left p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--app-accent)] hover:bg-[var(--bg-hover)] transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-9 h-9 shrink-0 mt-0.5">
                    <AvatarImage src={thread.owner?.avatar} />
                    <AvatarFallback className="bg-[var(--app-accent)] text-white text-xs">
                      {(thread.owner?.displayName || thread.owner?.username || "?").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {thread.type === "private_thread" && <Lock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />}
                      <span className="font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--app-accent)]">
                        {thread.name}
                      </span>
                      {thread.archived && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-active)] text-[var(--text-muted)] shrink-0">Archived</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                      <span className="truncate">{thread.owner?.displayName || thread.owner?.username || "Unknown"}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 shrink-0"><Users className="w-3 h-3" />{thread.messageCount}</span>
                    </div>
                    {thread.appliedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {thread.appliedTags.map((tid) => tagName(tid) && (
                          <span key={tid} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--app-accent)]/15 text-[var(--app-accent)]">
                            {tagName(tid)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* New post / ticket dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] max-w-lg">
          <DialogHeader>
            <DialogTitle>{isTickets ? "Open a Ticket" : "Create Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              autoFocus
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value.slice(0, 100))}
              placeholder={isTickets ? "Ticket subject" : "Post title"}
              className="bg-[var(--bg-app)] border-[var(--border-subtle)]"
            />
            <textarea
              value={postBody}
              onChange={(e) => setPostBody(e.target.value.slice(0, 4000))}
              placeholder={isTickets ? "Describe your issue…" : "What's on your mind?"}
              rows={6}
              className="w-full rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] p-3 resize-none focus:outline-none focus:border-[var(--app-accent)]"
            />
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const on = postTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => setPostTags((prev) => on ? prev.filter((t) => t !== tag.id) : [...prev, tag.id])}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        on
                          ? "bg-[var(--app-accent)]/15 border-[var(--app-accent)] text-[var(--app-accent)]"
                          : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!postTitle.trim() || !postBody.trim() || creating}
              className="bg-[var(--app-accent)] hover:opacity-90 text-white gap-1.5"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isTickets ? "Open Ticket" : "Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
