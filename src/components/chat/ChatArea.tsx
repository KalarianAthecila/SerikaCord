"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useServer } from "@/contexts/ServerContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Hash,
  Bell,
  Pin,
  Users,
  Search,
  Inbox,
  HelpCircle,
  ChevronLeft,
  Loader2,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MessageBar, type MessageBarHandle } from "@/components/chat/MessageBar";
import { MessageGroup } from "@/components/chat/MessageGroup";
import { MessageContextMenu } from "@/components/chat/MessageContextMenu";
import { DeleteMessageDialog } from "@/components/chat/DeleteMessageDialog";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { MessageSkeleton } from "@/components/ui/skeleton";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { buildGalleryFromMessages, findGalleryIndex } from "@/lib/chat/media";
import { incrementUnread, clearUnread, playNotificationSound, isChannelMuted, toggleChannelMute, subscribeChannelMutes } from "@/lib/services/notificationUX";
import { useMentions, type MentionData } from "@/hooks/useMentions";
import { useChatStream, useTypingSignal } from "@/hooks/useChatStream";
import { useMessageActions } from "@/hooks/useMessageActions";
import { useIsMobile } from "@/hooks/useIsMobile";
import { groupMessages, formatMessageTimestamp } from "@/lib/chat/messages";
import type { ChatMessage } from "@/lib/chat/types";

type Message = ChatMessage;

interface MentionUser {
  id: string;
  username: string;
  displayName: string;
}

interface MentionRole {
  id: string;
  name: string;
  color?: string;
  mentionable?: boolean;
  isDefault?: boolean;
}

interface MentionSuggestion {
  id: string;
  kind: "user" | "role" | "everyone" | "here" | "emoji";
  label: string;
  description?: string;
  color?: string;
  imageUrl?: string;
  animated?: boolean;
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAliasMention(content: string, alias: string, token: string): string {
  if (!alias) return content;
  const escapedAlias = escapeRegex(alias);
  const pattern = new RegExp(`(^|\\s)@${escapedAlias}(?=$|[\\s.,!?;:])`, "gi");
  return content.replace(pattern, (_match, prefix: string) => `${prefix}${token}`);
}

function extractDraftMentionIds(content: string): {
  mentionEveryone: boolean;
  mentionedUserIds: string[];
  mentionedRoleIds: string[];
  mentionedChannelIds: string[];
} {
  const mentionedUserIds = Array.from(
    new Set(Array.from(content.matchAll(/<@!?([a-f0-9]{24})>/gi)).map((match) => match[1]))
  );
  const mentionedRoleIds = Array.from(
    new Set(Array.from(content.matchAll(/<@&([a-f0-9]{24})>/gi)).map((match) => match[1]))
  );
  const mentionedChannelIds = Array.from(
    new Set(Array.from(content.matchAll(/<#([a-f0-9]{24})>/gi)).map((match) => match[1]))
  );
  return {
    mentionEveryone: /(^|\s)@(everyone|here)\b/i.test(content),
    mentionedUserIds,
    mentionedRoleIds,
    mentionedChannelIds,
  };
}

interface ChatAreaProps {
  onToggleMembers?: () => void;
  showMembers?: boolean;
}

export function ChatArea({ onToggleMembers, showMembers }: ChatAreaProps) {
  const { currentChannel, currentServer } = useServer();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isMobile = useIsMobile();
  const messageBarRef = useRef<MessageBarHandle>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);
  const activeMessageFetchChannelRef = useRef<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const prevScrollHeightRef = useRef(0);
  const MAX_LOADED_MESSAGES = 50;
  const PAGE_SIZE = 20;

  // Server emojis and stickers
  const [serverEmojis, setServerEmojis] = useState<Array<{
    id: string;
    name: string;
    url: string;
    serverId: string;
    animated?: boolean;
  }>>([]);
  const [allServerEmojis, setAllServerEmojis] = useState<Array<{
    id: string;
    name: string;
    url: string;
    serverId: string;
    serverName?: string;
    animated?: boolean;
  }>>([]);
  const [serverStickers, setServerStickers] = useState<Array<{
    id: string;
    name: string;
    imageUrl: string;
    serverId: string;
    serverName: string;
  }>>([]);
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [mentionRoles, setMentionRoles] = useState<MentionRole[]>([]);
  const [currentUserRoleIds, setCurrentUserRoleIds] = useState<string[]>([]);
  const [userRoleColorMap, setUserRoleColorMap] = useState<Record<string, string>>({});
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [activeMentionIndex, setActiveMentionIndex] = useState(0);
  const mentionRangeRef = useRef<{ start: number; end: number } | null>(null);

  // Header utilities
  const [channelMuted, setChannelMuted] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [isLoadingPins, setIsLoadingPins] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const { mentions: allMentions, totalUnread, markChannelRead, refresh: refreshMentions } = useMentions();
  const [showHelp, setShowHelp] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [standaloneMedia, setStandaloneMedia] = useState<{ src: string; alt?: string } | null>(null);

  // Fetch server emojis
  useEffect(() => {
    const fetchServerEmojis = async () => {
      if (!currentServer) {
        setServerEmojis([]);
        return;
      }
      try {
        const response = await fetch(`/api/servers/${currentServer.id}/emojis`);
        if (response.ok) {
          const data = await response.json();
          const mapped = (data.emojis || []).map((emoji: { id?: string; _id?: string; name?: string; url?: string; imageUrl?: string; serverId?: string; animated?: boolean }) => ({
            id: emoji.id || emoji._id,
            name: emoji.name,
            url: emoji.url || emoji.imageUrl,
            serverId: emoji.serverId,
            animated: emoji.animated,
          }));
          setServerEmojis(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch server emojis:", error);
      }
    };
    fetchServerEmojis();
  }, [currentServer]);

  // Fetch all server emojis (cross-server)
  useEffect(() => {
    const fetchAllEmojis = async () => {
      try {
        const response = await fetch('/api/users/@me/emojis');
        if (response.ok) {
          const data = await response.json();
          const mapped = (data.emojis || []).map((emoji: { id?: string; _id?: string; name?: string; url?: string; imageUrl?: string; serverId?: string; serverName?: string; animated?: boolean }) => ({
            id: emoji.id || emoji._id,
            name: emoji.name,
            url: emoji.url || emoji.imageUrl,
            serverId: emoji.serverId || '',
            serverName: emoji.serverName,
            animated: emoji.animated,
          }));
          setAllServerEmojis(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch all server emojis:", error);
      }
    };

    fetchAllEmojis();
  }, []);

  // Fetch all server stickers (cross-server)
  useEffect(() => {
    const fetchAllStickers = async () => {
      try {
        const response = await fetch('/api/users/@me/stickers');
        if (response.ok) {
          const data = await response.json();
          const mapped = (data.stickers || []).map((sticker: { id?: string; _id?: string; name?: string; imageUrl?: string; url?: string; serverId?: string; serverName?: string }) => ({
            id: sticker.id || sticker._id,
            name: sticker.name,
            imageUrl: sticker.imageUrl || sticker.url,
            serverId: sticker.serverId || '',
            serverName: sticker.serverName || 'Server',
          }));
          setServerStickers(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch server stickers:", error);
      }
    };

    fetchAllStickers();
  }, []);

  useEffect(() => {
    const fetchMentionSources = async () => {
      if (!currentServer) {
        setMentionUsers([]);
        setMentionRoles([]);
        setCurrentUserRoleIds([]);
        setUserRoleColorMap({});
        return;
      }

      try {
        const [membersResponse, rolesResponse] = await Promise.all([
          fetch(`/api/servers/${currentServer.id}/members?limit=1000`),
          fetch(`/api/servers/${currentServer.id}/roles`),
        ]);

        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          const members = (membersData.members || []) as Array<{
            id: string;
            username: string;
            displayName: string;
            roles?: Array<{ id: string }>;
            highestRole?: { color?: string } | null;
          }>;

          setMentionUsers(
            members.map((member) => ({
              id: member.id,
              username: member.username,
              displayName: member.displayName || member.username,
            }))
          );

          const colorMap: Record<string, string> = {};
          for (const member of members) {
            const highestRole = member.highestRole;
            if (highestRole?.color && highestRole.color !== '#000000') {
              colorMap[member.id] = highestRole.color;
            }
          }
          setUserRoleColorMap(colorMap);

          const self = members.find((member) => member.id === user?.id);
          setCurrentUserRoleIds((self?.roles || []).map((role) => role.id));
        } else {
          setMentionUsers([]);
          setCurrentUserRoleIds([]);
          setUserRoleColorMap({});
        }

        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json();
          const roles = (rolesData.roles || []) as Array<{
            id: string;
            name: string;
            color?: string;
            mentionable?: boolean;
            isDefault?: boolean;
          }>;
          setMentionRoles(roles);
        } else {
          setMentionRoles([]);
        }
      } catch (error) {
        console.error("Failed to fetch mention sources:", error);
        setMentionUsers([]);
        setMentionRoles([]);
        setCurrentUserRoleIds([]);
        setUserRoleColorMap({});
      }
    };

    void fetchMentionSources();
  }, [currentServer, user?.id]);

  const fetchMessages = useCallback(async () => {
    if (!currentChannel) return;

    // Guard against a slower response from a previously viewed channel
    // overwriting the current channel's messages after a fast switch.
    const requestedChannelId = currentChannel.id;
    activeMessageFetchChannelRef.current = requestedChannelId;

    setIsLoading(true);
    setHasMoreOlder(false);
    setNewMessagesCount(0);
    isAtBottomRef.current = true;
    setIsAtBottom(true);
    try {
      const response = await fetch(`/api/channels/${requestedChannelId}/messages?limit=${PAGE_SIZE}`);
      if (activeMessageFetchChannelRef.current !== requestedChannelId) return;
      if (response.ok) {
        const data = await response.json();
        if (activeMessageFetchChannelRef.current !== requestedChannelId) return;
        const messagesArray = Array.isArray(data) ? data : data.messages || [];
        const seen = new Set<string>();
        const deduped = messagesArray.filter((m: Message) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
        setMessages(deduped);
        setHasMoreOlder(deduped.length >= PAGE_SIZE);
      } else {
        toast.error("Failed to load messages");
      }
    } catch (error) {
      if (activeMessageFetchChannelRef.current !== requestedChannelId) return;
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to load messages");
    } finally {
      if (activeMessageFetchChannelRef.current === requestedChannelId) {
        setIsLoading(false);
      }
    }
  }, [currentChannel]);

  const loadOlderMessages = useCallback(async () => {
    if (!currentChannel || isLoadingMore || !hasMoreOlder || messages.length === 0) return;

    const oldestId = messages[0]?.id;
    if (!oldestId || oldestId.startsWith("temp-")) return;

    setIsLoadingMore(true);
    prevScrollHeightRef.current = scrollViewportRef.current?.scrollHeight || 0;

    try {
      const response = await fetch(
        `/api/channels/${currentChannel.id}/messages?before=${oldestId}&limit=${PAGE_SIZE}`
      );
      if (response.ok) {
        const data = await response.json();
        const olderMessages = Array.isArray(data) ? data : data.messages || [];
        if (olderMessages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const seenOlder = new Set<string>();
            const filtered = olderMessages.filter((m: Message) => {
              const key = String(m.id);
              if (seenOlder.has(key)) return false;
              seenOlder.add(key);
              return !existingIds.has(m.id);
            });
            const combined = [...filtered, ...prev];
            return combined.length > MAX_LOADED_MESSAGES
              ? combined.slice(0, MAX_LOADED_MESSAGES)
              : combined;
          });
          setHasMoreOlder(olderMessages.length >= PAGE_SIZE);

          // Restore scroll position after older messages are prepended
          requestAnimationFrame(() => {
            const viewport = scrollViewportRef.current;
            if (viewport && prevScrollHeightRef.current) {
              const newScrollHeight = viewport.scrollHeight;
              const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
              viewport.scrollTop += scrollDiff;
            }
          });
        } else {
          setHasMoreOlder(false);
        }
      }
    } catch (error) {
      console.error("Failed to load older messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentChannel, isLoadingMore, hasMoreOlder, messages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const fetchPinnedMessages = useCallback(async () => {
    if (!currentChannel) return;
    setIsLoadingPins(true);
    try {
      const response = await fetch(`/api/channels/${currentChannel.id}/pins?limit=50`);
      if (!response.ok) return;
      const data = await response.json();
      setPinnedMessages(data.messages || []);
    } catch {
      // best-effort UI
    } finally {
      setIsLoadingPins(false);
    }
  }, [currentChannel]);

  // Shared per-message actions (edit/delete/pin/reactions/reply/context menu)
  const emojiLookup = useMemo(
    () => [...serverEmojis, ...allServerEmojis],
    [serverEmojis, allServerEmojis]
  );
  const actions = useMessageActions<Message>({
    apiBase: currentChannel ? `/api/channels/${currentChannel.id}` : null,
    setMessages,
    userId: user?.id,
    emojiLookup,
    onPinsChanged: fetchPinnedMessages,
  });
  const {
    editingMessage,
    editContent,
    setEditContent,
    startEditing,
    cancelEditing,
    submitEdit,
    handleEditKeyDown,
    deleteConfirmMessage,
    setDeleteConfirmMessage,
    confirmDelete,
    contextMenu,
    setContextMenu,
    openContextMenu,
    reactionPickerMessage,
    setReactionPickerMessage,
    replyToMessage,
    setReplyToMessage,
    copyMessage,
    togglePin,
    applyReactionEvent,
    addReaction,
    toggleReaction,
  } = actions;

  const { signalTyping, resetTyping } = useTypingSignal(
    currentChannel ? `/api/channels/${currentChannel.id}/typing` : null
  );

  const runMessageSearch = useCallback(async (query: string) => {
    if (!currentChannel || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/channels/${currentChannel.id}/messages/search?q=${encodeURIComponent(query)}&limit=20`
      );
      if (!response.ok) return;
      const data = await response.json();
      setSearchResults(data.messages || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [currentChannel]);

  useEffect(() => {
    if (!currentChannel) return;
    setChannelMuted(isChannelMuted(currentChannel.id));
    setReplyToMessage(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    mentionRangeRef.current = null;
    setMentionSuggestions([]);
    setActiveMentionIndex(0);
    void fetchPinnedMessages();
  }, [currentChannel, fetchPinnedMessages, setReplyToMessage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void runMessageSearch(searchQuery);
    }, 220);
    return () => clearTimeout(timer);
  }, [searchQuery, runMessageSearch]);

  const updateMentionSuggestions = useCallback(
    (draft: string, explicitCaretPosition?: number | null) => {
      const caretPosition =
        explicitCaretPosition ?? messageBarRef.current?.getComposer()?.getCaret() ?? draft.length;
      const beforeCursor = draft.slice(0, caretPosition);
      const mentionMatch = beforeCursor.match(/(^|[\s\n])@([^\s@]{0,40})$/m);

      if (!mentionMatch) {
        // Emoji autocomplete: `:query` with 2+ chars (avoids firing on plain colons)
        const emojiMatch = beforeCursor.match(/(^|\s):([a-zA-Z0-9_+-]{2,32})$/);
        if (emojiMatch) {
          const emojiQuery = emojiMatch[2].toLowerCase();
          const emojiStart = caretPosition - emojiMatch[2].length - 1;
          const seenNames = new Set<string>();
          const emojiSuggestions: MentionSuggestion[] = [];
          for (const entry of allServerEmojis) {
            if (!entry.name.toLowerCase().includes(emojiQuery)) continue;
            if (seenNames.has(entry.name)) continue;
            seenNames.add(entry.name);
            emojiSuggestions.push({
              id: entry.id,
              kind: "emoji",
              label: entry.name,
              description: entry.serverName,
              imageUrl: entry.url,
              animated: entry.animated,
            });
            if (emojiSuggestions.length >= 8) break;
          }
          if (emojiSuggestions.length > 0) {
            mentionRangeRef.current = { start: emojiStart, end: caretPosition };
            setMentionSuggestions(emojiSuggestions);
            setActiveMentionIndex(0);
            return;
          }
        }
        mentionRangeRef.current = null;
        setMentionSuggestions([]);
        setActiveMentionIndex(0);
        return;
      }

      const tokenPrefix = mentionMatch[1] || "";
      const queryRaw = mentionMatch[2] || "";
      const query = queryRaw.toLowerCase();
      const mentionStart = caretPosition - queryRaw.length - 1;
      if (mentionStart - tokenPrefix.length < 0) {
        mentionRangeRef.current = null;
        setMentionSuggestions([]);
        return;
      }

      const staticSuggestionPool: MentionSuggestion[] = [
        { id: "everyone", kind: "everyone", label: "everyone", description: "Notify everyone in this channel" },
        { id: "here", kind: "here", label: "here", description: "Notify currently active members" },
      ];
      const staticSuggestions = staticSuggestionPool.filter((entry) => entry.label.startsWith(query));

      const userSuggestions = mentionUsers
        .filter((entry) => {
          const username = (entry.username || "").toLowerCase();
          const displayName = (entry.displayName || "").toLowerCase();
          return query.length === 0 || username.includes(query) || displayName.includes(query);
        })
        .sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""))
        .slice(0, 8)
        .map((entry) => ({
          id: entry.id,
          kind: "user" as const,
          label: entry.displayName || entry.username || entry.id,
          description: `@${entry.username || ""}`,
        }));

      const roleSuggestions = mentionRoles
        .filter((entry) => !entry.isDefault)
        .filter((entry) => {
          const roleName = entry.name.toLowerCase();
          return query.length === 0 || roleName.includes(query);
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 8)
        .map((entry) => ({
          id: entry.id,
          kind: "role" as const,
          label: entry.name,
          description: entry.mentionable ? "Role mention" : "Role mention",
          color: entry.color,
        }));

      const nextSuggestions = [...staticSuggestions, ...userSuggestions, ...roleSuggestions].slice(0, 12);

      if (!nextSuggestions.length) {
        mentionRangeRef.current = null;
        setMentionSuggestions([]);
        setActiveMentionIndex(0);
        return;
      }

      mentionRangeRef.current = {
        start: mentionStart,
        end: caretPosition,
      };
      setMentionSuggestions(nextSuggestions);
      setActiveMentionIndex(0);
    },
    [mentionRoles, mentionUsers, allServerEmojis]
  );

  const insertMentionFromSuggestion = useCallback(
    (suggestion: MentionSuggestion) => {
      const activeRange = mentionRangeRef.current;
      const composer = messageBarRef.current?.getComposer();
      if (!activeRange || !composer) return;

      mentionRangeRef.current = null;
      setMentionSuggestions([]);
      setActiveMentionIndex(0);

      if (suggestion.kind === "emoji") {
        // Insert as an inline image; the composer serializes it to a token
        composer.replaceRangeWithEmoji(activeRange.start, activeRange.end, {
          id: suggestion.id,
          name: suggestion.label,
          url: suggestion.imageUrl || "",
          animated: suggestion.animated,
        });
      } else {
        const mentionToken =
          suggestion.kind === "user"
            ? `<@${suggestion.id}>`
            : suggestion.kind === "role"
              ? `<@&${suggestion.id}>`
              : suggestion.kind === "everyone"
                ? "@everyone"
                : "@here";
        composer.replaceRange(activeRange.start, activeRange.end, `${mentionToken} `);
      }

      signalTyping(composer.getText());
    },
    [signalTyping]
  );

  // Real-time updates over SSE (connection + typing handled by the hook)
  const { typingStatusText } = useChatStream({
    url: currentChannel ? `/api/channels/${currentChannel.id}/stream` : null,
    currentUsername: user?.username,
    onEvent: (data) => {
        if (data.type === "message") {
          const incomingAuthorIdRaw = data.message.authorId;
          const incomingAuthorId =
            typeof incomingAuthorIdRaw === "object"
              ? incomingAuthorIdRaw?._id || incomingAuthorIdRaw?.id
              : incomingAuthorIdRaw;
          const sseIsOwnMessage = incomingAuthorId === user?.id;

          setMessages((prev) => {
            const msgId = data.message.id || data.message._id;
            const exists = prev.some((m) => m.id === msgId);
            if (exists) return prev;

            const author =
              data.message.author ||
              (data.message.authorId && typeof data.message.authorId === "object"
                ? {
                  id: data.message.authorId._id || data.message.authorId.id,
                  username: data.message.authorId.username,
                  displayName: data.message.authorId.displayName || data.message.authorId.username,
                  avatar: data.message.authorId.avatar,
                }
                : null);

            const newMsg: Message = {
              id: msgId,
              content: data.message.content,
              type: data.message.type,
              authorId:
                typeof data.message.authorId === "object"
                  ? data.message.authorId._id || data.message.authorId.id
                  : data.message.authorId,
              author: author || {
                id: "unknown",
                username: "unknown",
                displayName: "Unknown",
              },
              channelId: data.message.channelId,
              createdAt: data.message.createdAt,
              updatedAt: data.message.updatedAt,
              edited: data.message.edited,
              pinned: data.message.pinned,
              referencedMessageId: data.message.referencedMessageId,
              referencedMessage: data.message.referencedMessage,
              attachments: data.message.attachments || [],
              reactions: data.message.reactions || [],
              customEmojis: data.message.customEmojis || [],
              mentionEveryone: Boolean(data.message.mentionEveryone),
              mentionedUserIds: data.message.mentionedUserIds || [],
              mentionedRoleIds: data.message.mentionedRoleIds || [],
              mentionedChannelIds: data.message.mentionedChannelIds || [],
            };
            const incomingAuthorId = newMsg.authorId || newMsg.author?.id;
            const isOwnMessage = incomingAuthorId === user?.id;
            const ownTempIndex = prev.findIndex(
              (msg) =>
                msg.id.startsWith("temp-") &&
                msg.authorId === user?.id &&
                isOwnMessage &&
                msg.content === newMsg.content
            );

            if (ownTempIndex !== -1) {
              return prev.map((msg, index) => (index === ownTempIndex ? newMsg : msg));
            }

            // Notification UX for incoming messages from others
            if (!isOwnMessage && !isChannelMuted(newMsg.channelId)) {
              const isMentioned =
                newMsg.mentionEveryone ||
                (user?.id && newMsg.mentionedUserIds?.includes(user.id)) ||
                (currentUserRoleIds.length > 0 &&
                  newMsg.mentionedRoleIds?.some((rid) => currentUserRoleIds.includes(rid)));
              if (isMentioned) {
                refreshMentions();
              }
              const isHidden = document.visibilityState !== "visible";

              if (isHidden) {
                incrementUnread();
                playNotificationSound();
              }

              if (isHidden || isMentioned) {
                const authorName = newMsg.author?.displayName || newMsg.author?.username || "Someone";
                const preview = newMsg.content?.slice(0, 80) || (newMsg.attachments?.length ? "📎 Attachment" : "New message");
                toast(authorName, {
                  description: preview,
                  duration: 4000,
                  action: {
                    label: "View",
                    onClick: () => {
                      window.focus();
                      isAtBottomRef.current = true;
                      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
                    },
                  },
                });
              }
            }

            return [...prev, newMsg];
          });

          // Track new messages when user is not at bottom
          if (!isAtBottomRef.current && !sseIsOwnMessage) {
            setNewMessagesCount((c) => c + 1);
          }
          return;
        }

        if (data.type === "edit") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === data.messageId
                ? {
                  ...m,
                  content: data.content ?? m.content,
                  pinned: data.pinned !== undefined ? Boolean(data.pinned) : m.pinned,
                  edited: data.content !== undefined ? true : m.edited,
                  updatedAt: new Date().toISOString(),
                }
                : m
            )
          );
          return;
        }

        if (data.type === "delete") {
          setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
          return;
        }

        if (data.type === "reaction_add") {
          applyReactionEvent(data.messageId, data.emoji, data.userId, true);
          return;
        }

        if (data.type === "reaction_remove") {
          applyReactionEvent(data.messageId, data.emoji, data.userId, false);
          return;
        }

        if (data.type === "pin_update") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === data.messageId ? { ...m, pinned: Boolean(data.pinned) } : m
            )
          );
          void fetchPinnedMessages();
        }
    },
  });

  // Clear unread badge when tab becomes visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        clearUnread();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Auto-scroll to bottom only when user is already at bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // Find the scroll viewport element for scroll tracking
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const viewport = scrollContainerRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement | null;
    scrollViewportRef.current = viewport;
  }, [currentChannel]);

  // Scroll listener for pagination + bottom detection
  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const atBottom = distanceFromBottom < 80;
      isAtBottomRef.current = atBottom;
      setIsAtBottom(atBottom);

      if (atBottom && newMessagesCount > 0) {
        setNewMessagesCount(0);
      }

      // Load older messages when scrolled near top
      if (scrollTop < 100 && hasMoreOlder && !isLoadingMore) {
        void loadOlderMessages();
      }
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [hasMoreOlder, isLoadingMore, loadOlderMessages, newMessagesCount]);


  const normalizeMessageMentions = useCallback(
    (content: string): string => {
      let nextContent = content;

      const roleCandidates = [...mentionRoles]
        .filter((role) => !role.isDefault)
        .sort((a, b) => b.name.length - a.name.length);
      for (const role of roleCandidates) {
        nextContent = replaceAliasMention(nextContent, role.name, `<@&${role.id}>`);
      }

      const userAliasMap = new Map<string, string>();
      for (const mentionUser of mentionUsers) {
        const aliases = [mentionUser.displayName, mentionUser.username];
        for (const alias of aliases) {
          const normalizedAlias = alias.trim().toLowerCase();
          if (!normalizedAlias || normalizedAlias === "everyone" || normalizedAlias === "here") continue;
          if (!userAliasMap.has(normalizedAlias)) {
            userAliasMap.set(normalizedAlias, mentionUser.id);
          }
        }
      }

      const userCandidates = Array.from(userAliasMap.entries())
        .sort((a, b) => b[0].length - a[0].length)
        .map(([alias, id]) => ({ alias, id }));

      for (const userCandidate of userCandidates) {
        nextContent = replaceAliasMention(nextContent, userCandidate.alias, `<@${userCandidate.id}>`);
      }

      return nextContent;
    },
    [mentionRoles, mentionUsers]
  );

  const handleSendMessage = async (contentOverride?: string, sticker?: { id: string; name: string; imageUrl: string; serverId?: string; serverName?: string }) => {
    if (isSending || !currentChannel) return;

    const isOverrideSend = typeof contentOverride === "string";
    const rawMessageContent = isOverrideSend ? contentOverride : newMessage;
    const messageContent = currentServer ? normalizeMessageMentions(rawMessageContent) : rawMessageContent;
    const pendingAttachments = isOverrideSend ? [] : messageBarRef.current?.getAttachments() ?? [];
    const isStickerSend = !!sticker;

    if (!messageContent.trim() && pendingAttachments.length === 0 && !isStickerSend) return;

    const replyReference = replyToMessage;
    if (!isOverrideSend) {
      setNewMessage("");
      messageBarRef.current?.getComposer()?.clear();
      mentionRangeRef.current = null;
      setMentionSuggestions([]);
      setActiveMentionIndex(0);
    }
    resetTyping();
    setIsSending(true);

    let tempId: string | null = null;

    try {
      let uploadedAttachments: Array<{ id: string; url: string; filename: string; contentType: string }> = [];

      if (pendingAttachments.length > 0) {
        uploadedAttachments = await messageBarRef.current?.uploadAttachments() ?? [];
        messageBarRef.current?.clearAttachments();
      }

      tempId = `temp-${Date.now()}`;
      const optimisticMentionData = extractDraftMentionIds(messageContent);
      const optimisticMessage: Message = {
        id: tempId,
        content: messageContent,
        type: replyReference ? "reply" : "default",
        authorId: user?.id || "unknown",
        author: {
          id: user?.id || "unknown",
          username: user?.username || "unknown",
          displayName: user?.displayName || user?.username || "Unknown",
          avatar: user?.avatar,
        },
        channelId: currentChannel.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        referencedMessageId: replyReference?.id,
        referencedMessage: replyReference
          ? {
            id: replyReference.id,
            content: replyReference.content,
            author: replyReference.author,
            createdAt: replyReference.createdAt,
          }
          : undefined,
        attachments: uploadedAttachments,
        reactions: [],
        customEmojis: [],
        sticker,
        mentionEveryone: optimisticMentionData.mentionEveryone,
        mentionedUserIds: optimisticMentionData.mentionedUserIds,
        mentionedRoleIds: optimisticMentionData.mentionedRoleIds,
        mentionedChannelIds: optimisticMentionData.mentionedChannelIds,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      const response = await fetch(`/api/channels/${currentChannel.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageContent,
          replyTo: replyReference?.id,
          attachments: uploadedAttachments,
          sticker,
        }),
      });

      if (response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.message || payload;
        if (message && (message.id || message._id)) {
          const messageId = message.id || message._id;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? {
                  ...msg,
                  id: messageId,
                  content: message.content ?? msg.content,
                  type: message.type ?? msg.type,
                  authorId:
                    typeof message.authorId === "object"
                      ? message.authorId._id || message.authorId.id || msg.authorId
                      : message.authorId || msg.authorId,
                  author: message.author || msg.author,
                  createdAt: message.createdAt || msg.createdAt,
                  updatedAt: message.updatedAt || msg.updatedAt,
                  referencedMessageId: message.referencedMessageId || msg.referencedMessageId,
                  referencedMessage: message.referencedMessage || msg.referencedMessage,
                  attachments: message.attachments || msg.attachments,
                  reactions: message.reactions || msg.reactions,
                  customEmojis: message.customEmojis || msg.customEmojis,
                  sticker: message.sticker || msg.sticker,
                  mentionEveryone:
                    message.mentionEveryone !== undefined ? Boolean(message.mentionEveryone) : msg.mentionEveryone,
                  mentionedUserIds: message.mentionedUserIds || msg.mentionedUserIds,
                  mentionedRoleIds: message.mentionedRoleIds || msg.mentionedRoleIds,
                  mentionedChannelIds: message.mentionedChannelIds || msg.mentionedChannelIds,
                }
                : msg
            )
          );
        }
      } else {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        if (!isOverrideSend) {
          setNewMessage(rawMessageContent);
        }
        toast.error("Failed to send message");
      }
    } catch {
      if (tempId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      }
      if (!isOverrideSend) {
        setNewMessage(rawMessageContent);
      }
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
      setReplyToMessage(null);
    }
  };

  const toggleChannelNotifications = () => {
    if (!currentChannel) return;
    const next = toggleChannelMute(currentChannel.id);
    setChannelMuted(next);
    toast.success(next ? "Channel notifications muted" : "Channel notifications enabled");
  };

  // Stay in sync when the channel is muted/unmuted from the sidebar menu
  useEffect(() => {
    if (!currentChannel) return;
    return subscribeChannelMutes((channelId, muted) => {
      if (channelId === currentChannel.id) setChannelMuted(muted);
    });
  }, [currentChannel]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveMentionIndex((prev) => (prev + 1) % mentionSuggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveMentionIndex((prev) => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
        return;
      }
      if ((e.key === "Enter" && !e.shiftKey) || e.key === "Tab") {
        e.preventDefault();
        const selected = mentionSuggestions[activeMentionIndex];
        if (selected) {
          insertMentionFromSuggestion(selected);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        mentionRangeRef.current = null;
        setMentionSuggestions([]);
        setActiveMentionIndex(0);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const handleComposerChange = (value: string, caret: number) => {
    setNewMessage(value);
    signalTyping(value);
    updateMentionSuggestions(value, caret);
  };

  const handleEmojiSelect = (
    emoji: string,
    isCustom?: boolean,
    emojiData?: { id: string; name: string; animated?: boolean; url?: string }
  ) => {
    const composer = messageBarRef.current?.getComposer();
    if (isCustom && emojiData && emojiData.url && composer) {
      composer.insertEmojiAtCaret({
        id: emojiData.id,
        name: emojiData.name,
        url: emojiData.url,
        animated: emojiData.animated,
      });
    } else if (composer) {
      composer.insertTextAtCaret(emoji);
    }
    signalTyping(messageBarRef.current?.getComposer()?.getText() ?? "");
    messageBarRef.current?.getComposer()?.focus();
  };

  const handleGifSelect = (gifUrl: string) => {
    void handleSendMessage(gifUrl);
  };

  const handleStickerSelect = (sticker: { id: string; name: string; imageUrl: string; serverId?: string; serverName?: string }) => {
    void handleSendMessage(undefined, sticker);
  };

  const formatTimestamp = formatMessageTimestamp;

  // Group messages by author and time proximity (deduplicate by ID first)
  const groupedMessages = useMemo(() => groupMessages(messages), [messages]);

  const mediaGallery = useMemo(() => buildGalleryFromMessages(messages), [messages]);

  const mediaGalleryRef = useRef(mediaGallery);
  useEffect(() => {
    mediaGalleryRef.current = mediaGallery;
  }, [mediaGallery]);

  // Stable identity (reads gallery via ref) so memoized message rows keep
  // their props referentially equal across re-renders.
  const openMediaViewer = useCallback(
    (src: string, alt?: string, messageId?: string) => {
      const mediaIndex = findGalleryIndex(mediaGalleryRef.current, { src, messageId });
      if (mediaIndex >= 0) {
        setStandaloneMedia(null);
        setLightboxIndex(mediaIndex);
        return;
      }
      setLightboxIndex(null);
      setStandaloneMedia({ src, alt });
    },
    []
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    if (!mediaGallery.length) {
      setLightboxIndex(null);
      return;
    }
    if (lightboxIndex >= mediaGallery.length) {
      setLightboxIndex(mediaGallery.length - 1);
    }
  }, [lightboxIndex, mediaGallery.length]);

  // Mark current channel as read when it changes
  useEffect(() => {
    if (currentChannel?.id) {
      markChannelRead(currentChannel.id);
    }
  }, [currentChannel?.id, markChannelRead]);

  if (!currentChannel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-app)] text-[var(--text-secondary)]">
        <div className="w-40 h-40 mb-4 rounded-full bg-[var(--bg-card)] flex items-center justify-center border border-[var(--border-subtle)]">
          <Hash className="w-20 h-20 text-[#8B5CF6]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          {currentServer ? "Select a channel" : "Welcome to SerikaCord"}
        </h2>
        <p className="text-center max-w-md">
          {currentServer
            ? "Choose a channel from the sidebar to start chatting."
            : "Select a server or start a direct message to begin."}
        </p>
      </div>
    );
  }

  return (
    <div className="chat-shell flex-1 flex flex-col bg-[var(--app-bg)] min-w-0 min-h-0 overflow-hidden">
      {/* Channel Header */}
      <div className="h-12 px-2 sm:px-4 flex items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-surface)] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {isMobile && (
            <button
              onClick={() => router.push(`/channels/${currentServer?.id}`)}
              className="p-2 -ml-1 rounded-lg hover:bg-[var(--app-surface-alt)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--app-muted)]" />
            </button>
          )}
          <Hash className="w-5 sm:w-6 h-5 sm:h-6 text-[var(--app-muted-2)] flex-shrink-0" />
          <span className="font-semibold text-[var(--text-primary)] truncate text-sm sm:text-base">{currentChannel.name}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-[var(--app-muted)]">
          <button
            className="hover:text-[var(--text-primary)] transition-colors hidden sm:block"
            onClick={toggleChannelNotifications}
            title={channelMuted ? "Enable notifications" : "Mute notifications"}
            aria-label={channelMuted ? "Enable notifications" : "Mute notifications"}
          >
            <Bell className={cn("w-5 h-5", channelMuted && "text-red-400")} />
          </button>
          <button
            className="hover:text-[var(--text-primary)] transition-colors hidden sm:block"
            onClick={() => {
              setShowPins(true);
              void fetchPinnedMessages();
            }}
            title="View pinned messages"
          >
            <Pin className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleMembers}
            className={cn("hover:text-[var(--text-primary)] transition-colors", showMembers && "text-[var(--text-primary)]")}
          >
            <Users className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-[var(--app-border)] hidden md:block" />
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-32 h-6 px-2 rounded bg-[var(--app-surface-alt)] text-sm text-[var(--text-primary)] placeholder:text-[var(--app-muted)] focus:outline-none focus:w-48 transition-all"
              onFocus={() => setShowSearchResults(true)}
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--app-muted)]" />
          </div>
          <button
            className={cn(
              "hover:text-[var(--text-primary)] transition-colors hidden sm:block relative",
              totalUnread > 0 && "text-[var(--app-accent)]"
            )}
            onClick={() => setShowInbox(true)}
            title="Open inbox"
          >
            <Inbox className="w-5 h-5" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-[#8B5CF6] text-[10px] font-bold text-white leading-none">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </button>
          <button
            className="hover:text-[var(--text-primary)] transition-colors hidden sm:block"
            onClick={() => setShowHelp(true)}
            title="Open help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showSearchResults && (
        <div className="px-4 py-2 border-b border-[var(--app-border)] bg-[var(--app-surface)]/95">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-[var(--app-muted)]">Search Results</p>
            <button
              onClick={() => setShowSearchResults(false)}
              className="text-xs text-[var(--app-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Close
            </button>
          </div>
          {searchQuery.trim().length < 2 ? (
            <p className="text-sm text-[var(--app-muted)]">Type at least 2 characters to search this channel.</p>
          ) : isSearching ? (
            <div className="flex items-center gap-2 text-sm text-[var(--app-muted)]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-sm text-[var(--app-muted)]">No matching messages.</p>
          ) : (
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {searchResults.map((result) => (
                <button
                  key={`search-${result.id}`}
                  onClick={() => {
                    document.getElementById(`message-${result.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                    setShowSearchResults(false);
                  }}
                  className="w-full text-left p-2 rounded-md bg-[var(--app-surface-alt)] hover:brightness-110 transition"
                >
                  <p className="text-xs text-[var(--app-muted)] mb-0.5">
                    {result.author?.displayName || result.author?.username || "Unknown"} • {formatTimestamp(result.createdAt)}
                  </p>
                  <p className="text-sm text-[var(--text-primary)] line-clamp-2">{result.content || "(attachment)"}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div
        className="relative flex-1 min-h-0"
        ref={scrollContainerRef}
      >
        {/* New Messages Bar */}
        {newMessagesCount > 0 && !isAtBottom && (
          <button
            onClick={() => {
              setNewMessagesCount(0);
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium shadow-lg transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
            {newMessagesCount} new message{newMessagesCount > 1 ? "s" : ""}
          </button>
        )}
      <ScrollArea className="chat-scroller h-full [&_[data-slot='scroll-area-viewport']>div]:!block [&_[data-slot='scroll-area-viewport']>div]:w-full">
        <div className="flex flex-col py-4 w-full max-w-full overflow-x-hidden">
          {/* Load More indicator */}
          {hasMoreOlder && !isLoading && (
            <div className="flex justify-center py-3">
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-sm text-[var(--app-muted)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading older messages...
                </div>
              ) : (
                <button
                  onClick={() => void loadOlderMessages()}
                  className="px-4 py-1.5 rounded-full text-sm text-[#8B5CF6] bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 transition-colors"
                >
                  Load older messages
                </button>
              )}
            </div>
          )}
          {/* Channel Welcome — only at the true start of history */}
          {!hasMoreOlder && !isLoading && (
            <div className="px-4 pb-4 mb-4 border-b border-[var(--app-border)]">
              <div className="w-16 h-16 mb-2 rounded-2xl bg-[var(--app-surface-alt)] flex items-center justify-center border border-[var(--app-border)]">
                <Hash className="w-10 h-10 text-[var(--text-primary)]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2 break-words">Welcome to #{currentChannel.name}!</h1>
              <p className="text-[var(--app-muted)]">This is the start of the #{currentChannel.name} channel.</p>
            </div>
          )}

          {/* Messages */}
          {isLoading ? (
            <MessageSkeleton count={5} />
          ) : groupedMessages.length === 0 ? (
            <div className="text-center text-[var(--text-muted)] py-8">No messages yet. Be the first to say something!</div>
          ) : (
            groupedMessages.map((group) => (
              <MessageGroup
                key={`group-${group.messages[0].id}`}
                group={group}
                currentUserId={user?.id}
                serverId={currentServer?.id}
                serverName={currentServer?.name}
                swipeEnabled={isMobile}
                mentionUsers={mentionUsers}
                mentionRoles={mentionRoles}
                userRoleColorMap={userRoleColorMap}
                serverEmojis={serverEmojis}
                availableServerEmojis={allServerEmojis}
                editingMessageId={editingMessage?.id}
                editContent={editContent}
                onEditContentChange={setEditContent}
                onEditKeyDown={handleEditKeyDown}
                onEditCancel={cancelEditing}
                onEditSave={() => void submitEdit()}
                reactionPickerMessageId={reactionPickerMessage}
                onReactionPickerChange={(messageId, open) =>
                  setReactionPickerMessage(open ? messageId : null)
                }
                onContextMenu={openContextMenu}
                onReply={setReplyToMessage}
                onCopy={copyMessage}
                onPinToggle={(message) => void togglePin(message)}
                onEdit={startEditing}
                onDelete={setDeleteConfirmMessage}
                onAddReaction={(messageId, emoji) => void addReaction(messageId, emoji)}
                onToggleReaction={toggleReaction}
                onOpenReactionPicker={setReactionPickerMessage}
                onMediaClick={openMediaViewer}
                onJumpToMessage={(messageId) =>
                  document
                    .getElementById(`message-${messageId}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      </div>

      <TypingIndicator text={typingStatusText} />

      <MessageBar
        ref={messageBarRef}
        placeholder={`Message #${currentChannel?.name ?? ""}`}
        ariaLabel={`Message #${currentChannel?.name ?? ""}`}
        onSend={() => void handleSendMessage()}
        onChange={handleComposerChange}
        onKeyDown={handleKeyDown}
        onCaretMove={(text, caret) => updateMentionSuggestions(text, caret)}
        onEmojiSelect={handleEmojiSelect}
        onGifSelect={handleGifSelect}
        onStickerSelect={handleStickerSelect}
        isSending={isSending}
        serverId={currentServer?.id}
        serverEmojis={serverEmojis}
        serverName={currentServer?.name}
        availableServerEmojis={allServerEmojis}
        availableServerStickers={serverStickers}
        replyTo={replyToMessage}
        onCancelReply={() => setReplyToMessage(null)}
        mentionSuggestions={mentionSuggestions}
        onMentionSelect={insertMentionFromSuggestion}
        activeMentionIndex={activeMentionIndex}
        channelId={currentChannel?.id}
      />

      <ImageLightbox
        items={standaloneMedia ? [standaloneMedia] : mediaGallery}
        currentIndex={standaloneMedia ? 0 : lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null || standaloneMedia !== null}
        onNavigate={standaloneMedia ? undefined : setLightboxIndex}
        onClose={() => {
          setLightboxIndex(null);
          setStandaloneMedia(null);
        }}
      />

      <DeleteMessageDialog
        message={deleteConfirmMessage}
        onCancel={() => setDeleteConfirmMessage(null)}
        onConfirm={() => void confirmDelete()}
      />

      <Dialog open={showPins} onOpenChange={setShowPins}>
        <DialogContent className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pinned Messages</DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              Quick access to important messages in #{currentChannel?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
            {isLoadingPins ? (
              <div className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading pinned messages...
              </div>
            ) : pinnedMessages.length === 0 ? (
              <div className="text-sm text-[var(--text-secondary)]">No pinned messages yet.</div>
            ) : (
              pinnedMessages.map((message) => (
                <button
                  key={`pin-${message.id}`}
                  onClick={() => {
                    document.getElementById(`message-${message.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                    setShowPins(false);
                  }}
                  className="w-full text-left p-3 rounded-md bg-[var(--bg-sidebar-elevated)] hover:bg-[var(--bg-hover)] transition"
                >
                  <p className="text-xs text-[var(--text-secondary)] mb-1">
                    {message.author?.displayName || message.author?.username || "Unknown"} • {formatTimestamp(message.createdAt)}
                  </p>
                  <p className="text-sm text-[var(--text-primary)] line-clamp-3">{message.content || "(attachment)"}</p>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInbox} onOpenChange={setShowInbox}>
        <DialogContent className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] max-w-lg">
          <DialogHeader>
            <DialogTitle>Inbox — Mentions</DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              Recent mentions across all your servers (last 7 days).
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] overflow-y-auto space-y-1.5 pr-1">
            {allMentions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="w-12 h-12 text-[var(--text-muted)] mb-3" />
                <p className="text-sm text-[var(--text-secondary)]">No unread mentions. You&apos;re all caught up!</p>
              </div>
            ) : (
              allMentions.map((item: MentionData) => (
                <button
                  key={`inbox-${item.id}`}
                  onClick={() => {
                    if (item.serverId && item.channelId) {
                      router.push(`/channels/${item.serverId}/${item.channelId}`);
                      setTimeout(() => {
                        document.getElementById(`message-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 500);
                    }
                    setShowInbox(false);
                  }}
                  className="w-full text-left p-3 rounded-md bg-[var(--bg-sidebar-elevated)] hover:bg-[var(--bg-hover)] transition group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {item.author?.avatar && (
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={item.author.avatar} alt="" />
                        <AvatarFallback className="bg-[var(--app-accent)] text-[var(--text-on-accent)] text-[10px]">
                          {item.author.displayName?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {item.author?.displayName || item.author?.username || "Unknown"}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">in</span>
                    <span className="text-xs text-[var(--app-accent)] font-medium">#{item.channelName}</span>
                    <span className="text-xs text-[var(--text-muted)] ml-auto">{formatTimestamp(item.createdAt)}</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2 group-hover:text-[var(--text-primary)] transition-colors">{item.content}</p>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] max-w-lg">
          <DialogHeader>
            <DialogTitle>Channel Help</DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              Useful shortcuts and docs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            <p>
              Press <span className="px-1.5 py-0.5 rounded bg-[var(--bg-sidebar-elevated)] border border-[var(--border-subtle)]">Enter</span> to send and{" "}
              <span className="px-1.5 py-0.5 rounded bg-[var(--bg-sidebar-elevated)] border border-[var(--border-subtle)]">Shift + Enter</span> for a new line.
            </p>
            <p>Use the pin icon to keep important messages accessible to everyone in the channel.</p>
            <a
              href="https://serika.chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#8B5CF6] hover:underline"
            >
              Open SerikaCord docs
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <MessageContextMenu
        menu={contextMenu}
        isOwn={(message) => message.authorId === user?.id}
        onClose={() => setContextMenu(null)}
        onReply={setReplyToMessage}
        onAddReaction={(message) => setReactionPickerMessage(message.id)}
        onCopy={copyMessage}
        onPinToggle={(message) => void togglePin(message)}
        onEdit={startEditing}
        onDelete={setDeleteConfirmMessage}
      />
    </div>
  );
}
