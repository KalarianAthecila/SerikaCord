"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useServer } from "@/contexts/ServerContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Phone, Video, Pin, Users, Search, Inbox, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MessageBar, type MessageBarHandle } from "@/components/chat/MessageBar";
import { InlineBadges } from "@/components/chat/InlineBadges";
import { StaffPill } from "@/components/chat/StaffPill";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Skeleton, UserProfileSkeleton, MessageSkeleton } from "@/components/ui/skeleton";
import { buildGalleryFromMessages, findGalleryIndex } from "@/lib/chat/media";
import { voiceService } from "@/lib/services/voiceService";
import { VoiceBar } from "@/components/voice/VoiceBar";
import { VideoGrid } from "@/components/voice/VideoGrid";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageGroup } from "@/components/chat/MessageGroup";
import { MessageContextMenu } from "@/components/chat/MessageContextMenu";
import { DeleteMessageDialog } from "@/components/chat/DeleteMessageDialog";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useChatStream, useTypingSignal } from "@/hooks/useChatStream";
import { useMessageActions } from "@/hooks/useMessageActions";
import { useIsMobile } from "@/hooks/useIsMobile";
import { groupMessages, formatMessageTimestamp } from "@/lib/chat/messages";
import type { ChatMessage, MessageAuthor, MessageSticker } from "@/lib/chat/types";

const statusColors = {
  online: "#8B5CF6",
  idle: "#A78BFA",
  dnd: "#EF4444",
  offline: "#555555",
};

interface Recipient extends MessageAuthor {
  customStatus?: string;
  bio?: string;
  createdAt?: string;
}

export default function DMConversationPage() {
  const params = useParams();
  const router = useRouter();
  const recipientId = params.recipientId as string;
  const { user, isLoading: authLoading } = useAuth();
  const { clearContext } = useServer();
  const isMobile = useIsMobile();

  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [recipientLoading, setRecipientLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageBarRef = useRef<MessageBarHandle>(null);
  const activeFetchRecipientRef = useRef<string | null>(null);

  const [availableServerEmojis, setAvailableServerEmojis] = useState<
    Array<{ id: string; name: string; url: string; serverId?: string; serverName?: string; animated?: boolean }>
  >([]);
  const [availableServerStickers, setAvailableServerStickers] = useState<
    Array<{ id: string; name: string; imageUrl: string; serverId?: string; serverName?: string }>
  >([]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [standaloneMedia, setStandaloneMedia] = useState<{ src: string; alt?: string } | null>(null);

  // Pins
  const [showPins, setShowPins] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([]);
  const [isLoadingPins, setIsLoadingPins] = useState(false);

  const apiBase = recipientId ? `/api/dms/${recipientId}` : null;

  const fetchPinnedMessages = useCallback(async () => {
    if (!apiBase) return;
    setIsLoadingPins(true);
    try {
      const response = await fetch(`${apiBase}/pins`);
      if (response.ok) {
        const data = await response.json();
        setPinnedMessages(data.messages || []);
      }
    } catch {
      // best-effort
    } finally {
      setIsLoadingPins(false);
    }
  }, [apiBase]);

  const actions = useMessageActions<ChatMessage>({
    apiBase,
    setMessages,
    userId: user?.id,
    emojiLookup: availableServerEmojis,
    onPinsChanged: fetchPinnedMessages,
  });

  const { signalTyping, resetTyping } = useTypingSignal(apiBase ? `${apiBase}/typing` : null);

  const mediaGallery = useMemo(() => buildGalleryFromMessages(messages), [messages]);
  const messageGroups = useMemo(() => groupMessages(messages), [messages]);

  const mentionUsers = useMemo(() => {
    const entries: Array<{ id: string; username: string; displayName: string }> = [];
    if (user?.id) {
      entries.push({
        id: user.id,
        username: user.username || user.displayName || "you",
        displayName: user.displayName || user.username || "You",
      });
    }
    if (recipient?.id) {
      entries.push({
        id: recipient.id,
        username: recipient.username,
        displayName: recipient.displayName || recipient.username,
      });
    }
    return entries;
  }, [recipient?.displayName, recipient?.id, recipient?.username, user?.displayName, user?.id, user?.username]);

  // Clear server context when entering a DM
  useEffect(() => {
    clearContext();
  }, [clearContext]);

  useEffect(() => {
    if (user?.id) {
      voiceService.setUserId(user.id);
    }
  }, [user?.id]);

  // Cross-server emojis/stickers for the DM pickers (best-effort)
  useEffect(() => {
    fetch("/api/users/@me/emojis")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setAvailableServerEmojis(data.emojis || []))
      .catch(() => {});
    fetch("/api/users/@me/stickers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setAvailableServerStickers(data.stickers || []))
      .catch(() => {});
  }, []);

  const handleEmojiSelect = useCallback(
    (emoji: string, isCustom?: boolean, emojiData?: { id: string; name: string; animated?: boolean; url?: string }) => {
      const composer = messageBarRef.current?.getComposer();
      if (!composer) return;
      if (isCustom && emojiData?.url) {
        composer.insertEmojiAtCaret({
          id: emojiData.id,
          name: emojiData.name,
          url: emojiData.url,
          animated: emojiData.animated,
        });
      } else {
        const emojiString =
          isCustom && emojiData ? `<${emojiData.animated ? "a" : ""}:${emojiData.name}:${emojiData.id}>` : emoji;
        composer.insertTextAtCaret(emojiString);
      }
    },
    []
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch recipient info
  useEffect(() => {
    if (!recipientId) return;
    setRecipientLoading(true);
    fetch(`/api/users/${recipientId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setRecipient(data))
      .catch((error) => console.error("Failed to fetch recipient:", error))
      .finally(() => setRecipientLoading(false));
  }, [recipientId]);

  // Fetch DM messages (guarding against slow responses after fast switches)
  const fetchMessages = useCallback(async () => {
    const requestedRecipientId = recipientId;
    activeFetchRecipientRef.current = requestedRecipientId;
    setIsLoading(true);
    setMessages([]);
    try {
      const response = await fetch(`/api/dms/${requestedRecipientId}/messages`);
      if (activeFetchRecipientRef.current !== requestedRecipientId) return;
      if (response.ok) {
        const data = await response.json();
        if (activeFetchRecipientRef.current !== requestedRecipientId) return;
        setMessages(data.messages || []);
        setTimeout(scrollToBottom, 200);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      if (activeFetchRecipientRef.current === requestedRecipientId) {
        setIsLoading(false);
      }
    }
  }, [recipientId, scrollToBottom]);

  useEffect(() => {
    if (recipientId && user) {
      void fetchMessages();
      void fetchPinnedMessages();
    }
  }, [recipientId, fetchMessages, fetchPinnedMessages, user]);

  // Real-time updates over SSE
  const { typingStatusText } = useChatStream({
    url: recipientId && user ? `/api/dms/${recipientId}/stream` : null,
    currentUsername: user?.username,
    onEvent: (data) => {
      if (data.type === "message") {
        const message = data.message as ChatMessage;
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;

          const ownMessage = message.authorId === user?.id || message.author?.id === user?.id;
          if (ownMessage) {
            const ownTempIndex = prev.findIndex(
              (m) => m.id.startsWith("temp-") && m.authorId === user?.id && m.content === message.content
            );
            if (ownTempIndex !== -1) {
              return prev.map((m, index) => (index === ownTempIndex ? message : m));
            }
          }
          return [...prev, message];
        });
        setTimeout(scrollToBottom, 100);
      } else if (data.type === "edit") {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.messageId ? { ...m, content: String(data.content), edited: true } : m))
        );
      } else if (data.type === "delete") {
        setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      } else if (data.type === "reaction_add" || data.type === "reaction_remove") {
        // Own reactions are already applied optimistically
        if (data.userId !== user?.id) {
          actions.applyReactionEvent(
            String(data.messageId),
            String(data.emoji),
            String(data.userId),
            data.type === "reaction_add"
          );
        }
      } else if (data.type === "pin_update") {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.messageId ? { ...m, pinned: Boolean(data.pinned) } : m))
        );
        void fetchPinnedMessages();
      }
    },
  });

  // Send message (optimistic, with rollback on failure)
  const sendMessage = async (sticker?: MessageSticker) => {
    const pendingAttachments = messageBarRef.current?.getAttachments() ?? [];
    if ((!newMessage.trim() && !sticker && pendingAttachments.length === 0) || isSending) return;

    const replyReference = actions.replyToMessage;
    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage("");
    messageBarRef.current?.getComposer()?.clear();
    resetTyping();

    let tempId: string | null = null;

    try {
      let uploadedAttachments: Array<{ id: string; url: string; filename: string; contentType: string }> = [];
      if (pendingAttachments.length > 0) {
        uploadedAttachments = (await messageBarRef.current?.uploadAttachments()) ?? [];
        messageBarRef.current?.clearAttachments();
      }

      tempId = `temp-${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        content: messageContent,
        type: replyReference ? "reply" : "default",
        authorId: user?.id || "",
        author: {
          id: user?.id || "",
          username: user?.username || "",
          displayName: user?.displayName || "",
          avatar: user?.avatar,
          status: user?.status || "online",
          isPremium: user?.isPremium,
          badges: user?.badges,
        },
        channelId: recipientId,
        createdAt: new Date().toISOString(),
        sticker,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
        referencedMessageId: replyReference?.id,
        referencedMessage: replyReference
          ? {
              id: replyReference.id,
              content: replyReference.content,
              author: replyReference.author,
              createdAt: replyReference.createdAt,
            }
          : undefined,
        reactions: [],
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      scrollToBottom();

      const body: Record<string, unknown> = {};
      if (messageContent) body.content = messageContent;
      if (sticker) body.sticker = sticker;
      if (uploadedAttachments.length > 0) body.attachments = uploadedAttachments;
      if (replyReference) body.replyTo = replyReference.id;

      const response = await fetch(`/api/dms/${recipientId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)));
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        if (messageContent) {
          setNewMessage(messageContent);
          messageBarRef.current?.getComposer()?.insertTextAtCaret(messageContent);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      if (tempId) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
      if (messageContent) {
        setNewMessage(messageContent);
        messageBarRef.current?.getComposer()?.insertTextAtCaret(messageContent);
      }
    } finally {
      setIsSending(false);
      actions.setReplyToMessage(null);
    }
  };

  const handleGifSelect = useCallback(
    async (gifUrl: string) => {
      if (!user) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        content: gifUrl,
        authorId: user.id,
        author: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          status: user.status || "online",
          isPremium: user.isPremium,
          badges: user.badges,
        },
        channelId: recipientId,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      setTimeout(scrollToBottom, 100);

      try {
        const response = await fetch(`/api/dms/${recipientId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: gifUrl }),
        });
        if (response.ok) {
          const data = await response.json();
          setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)));
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
        }
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    },
    [recipientId, scrollToBottom, user]
  );

  const handleReply = useCallback(
    (message: ChatMessage) => {
      actions.setReplyToMessage(message);
      messageBarRef.current?.getComposer()?.focus();
    },
    [actions]
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleMessageInputChange = (value: string) => {
    setNewMessage(value);
    signalTyping(value);
  };

  const openMediaViewer = useCallback(
    (src: string, alt?: string, messageId?: string) => {
      const mediaIndex = findGalleryIndex(mediaGallery, { src, messageId });
      if (mediaIndex >= 0) {
        setStandaloneMedia(null);
        setLightboxIndex(mediaIndex);
        return;
      }
      setLightboxIndex(null);
      setStandaloneMedia({ src, alt });
    },
    [mediaGallery]
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

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="chat-shell flex-1 flex bg-[#0a0a0a] animate-fade-in">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header */}
        <div className="h-16 px-3 sm:px-4 flex items-center justify-between border-b border-[#1a1a1a] bg-[#0a0a0a] safe-area-top">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/channels/messages"
              className="p-2 hover:bg-[#111111] rounded-lg transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-[#888888]" />
            </Link>

            <div className="relative flex-shrink-0">
              <Avatar className="w-8 h-8">
                <AvatarImage src={recipient?.avatar} />
                <AvatarFallback className="bg-[#8B5CF6] text-white text-sm">
                  {(recipient?.displayName || recipient?.username || "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a0a0a]"
                style={{ backgroundColor: statusColors[recipient?.status || "offline"] }}
              />
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-white truncate">
                {recipient?.displayName || recipient?.username || "Loading..."}
              </span>
              <StaffPill badges={recipient?.badges} />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => void voiceService.joinChannel(`dm:${recipientId}`)}
              className="p-2 text-[#888888] hover:text-white transition-colors rounded-md hover:bg-[#111111] hidden sm:block"
              title="Start Voice Call"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={() => void voiceService.joinChannel(`dm:${recipientId}`, true)}
              className="p-2 text-[#888888] hover:text-white transition-colors rounded-md hover:bg-[#111111] hidden sm:block"
              title="Start Video Call"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowPins(true)}
              className="p-2 text-[#888888] hover:text-white transition-colors rounded-md hover:bg-[#111111] hidden sm:block"
              title="Pinned Messages"
            >
              <Pin className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowUserProfile(!showUserProfile)}
              className={cn(
                "p-2 transition-colors rounded-md hover:bg-[#111111] hidden lg:block",
                showUserProfile ? "text-white" : "text-[#888888] hover:text-white"
              )}
            >
              <Users className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Input
                placeholder="Search"
                className="h-7 w-32 bg-[#111111] border-none text-white placeholder:text-[#555555] text-sm rounded focus-visible:ring-0 transition-all duration-150 focus:w-40"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
            </div>
            <button className="p-2 text-[#888888] hover:text-white transition-colors rounded-md hover:bg-[#111111] hidden sm:block">
              <Inbox className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="chat-scroller flex-1 overflow-y-auto min-h-0 scrollbar-thin">
          <div className="flex flex-col min-h-full">
            <div className="flex-1" />
            <div className="px-4 py-6">
              {/* Welcome header */}
              <div className="flex flex-col items-start gap-2 mb-6 animate-fade-in-up">
                {recipientLoading ? (
                  <>
                    <Skeleton className="w-20 h-20 rounded-full" variant="circular" />
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-5 w-72" />
                  </>
                ) : (
                  <>
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={recipient?.avatar} />
                      <AvatarFallback className="bg-[#8B5CF6] text-white text-2xl">
                        {(recipient?.displayName || recipient?.username || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold text-white">
                      {recipient?.displayName || recipient?.username}
                    </h2>
                    <p className="text-[#888888]">
                      This is the beginning of your direct message history with{" "}
                      <span className="font-semibold text-white">
                        {recipient?.displayName || recipient?.username}
                      </span>
                    </p>
                  </>
                )}
              </div>

              {/* Messages */}
              {isLoading ? (
                <MessageSkeleton count={4} />
              ) : (
                <div className="-mx-4 space-y-[var(--chat-row-gap)] animate-fade-in">
                  {messageGroups.map((group) => (
                    <MessageGroup
                      key={`group-${group.messages[0].id}`}
                      group={group}
                      currentUserId={user.id}
                      swipeEnabled={isMobile}
                      mentionUsers={mentionUsers}
                      availableServerEmojis={availableServerEmojis}
                      editingMessageId={actions.editingMessage?.id}
                      editContent={actions.editContent}
                      onEditContentChange={actions.setEditContent}
                      onEditKeyDown={actions.handleEditKeyDown}
                      onEditCancel={actions.cancelEditing}
                      onEditSave={() => void actions.submitEdit()}
                      reactionPickerMessageId={actions.reactionPickerMessage}
                      onReactionPickerChange={(messageId, open) =>
                        actions.setReactionPickerMessage(open ? messageId : null)
                      }
                      onContextMenu={actions.openContextMenu}
                      onReply={handleReply}
                      onCopy={actions.copyMessage}
                      onPinToggle={(message) => void actions.togglePin(message)}
                      onEdit={actions.startEditing}
                      onDelete={actions.setDeleteConfirmMessage}
                      onAddReaction={(messageId, emoji) => void actions.addReaction(messageId, emoji)}
                      onToggleReaction={actions.toggleReaction}
                      onOpenReactionPicker={actions.setReactionPickerMessage}
                      onMediaClick={openMediaViewer}
                    />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        <TypingIndicator text={typingStatusText} className="pb-1" />

        {/* Message input */}
        <div className="p-3 sm:p-4 pt-0 safe-area-bottom">
          <MessageBar
            ref={messageBarRef}
            placeholder={`Message @${recipient?.displayName || recipient?.username || "..."}`}
            ariaLabel={`Message @${recipient?.displayName || recipient?.username || "..."}`}
            onSend={() => void sendMessage()}
            onChange={handleMessageInputChange}
            onKeyDown={handleKeyPress}
            onEmojiSelect={handleEmojiSelect}
            onGifSelect={handleGifSelect}
            onStickerSelect={(sticker) => void sendMessage(sticker)}
            isSending={isSending}
            availableServerEmojis={availableServerEmojis}
            availableServerStickers={availableServerStickers}
            replyTo={actions.replyToMessage}
            onCancelReply={() => actions.setReplyToMessage(null)}
          />

          {/* Voice call UI for DM calls */}
          <VideoGrid />
          <VoiceBar channelName={recipient?.displayName || recipient?.username || "DM Call"} />
        </div>
      </div>

      {/* User profile sidebar */}
      {showUserProfile && (
        <div className="w-[340px] bg-[#0a0a0a] border-l border-[#1a1a1a] hidden lg:flex flex-col animate-slide-in-right">
          {recipientLoading ? (
            <UserProfileSkeleton />
          ) : recipient ? (
            <>
              <div className="h-[120px] bg-[#8B5CF6] relative">
                {recipient.isPremium && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 rounded-full flex items-center gap-1">
                    <span className="text-xs text-white font-medium">Serika+</span>
                  </div>
                )}
              </div>

              <div className="px-4 relative">
                <div className="absolute -top-16">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-[6px] border-[#0a0a0a]">
                      <AvatarImage src={recipient.avatar} />
                      <AvatarFallback className="bg-[#8B5CF6] text-white text-2xl">
                        {(recipient.displayName || recipient.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className="absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-[#0a0a0a] transition-colors duration-200"
                      style={{ backgroundColor: statusColors[recipient.status || "offline"] }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-12 px-4">
                <div className="bg-[#111111] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">
                      {recipient.displayName || recipient.username}
                    </h3>
                    <InlineBadges badges={recipient.badges} size="sm" />
                  </div>
                  <p className="text-sm text-[#888888]">{recipient.username}</p>

                  {recipient.customStatus && (
                    <p className="text-sm text-[#888888] mt-2">{recipient.customStatus}</p>
                  )}

                  <div className="h-px bg-[#222222] my-4" />

                  {recipient.bio && (
                    <>
                      <h4 className="text-xs font-semibold uppercase text-[#888888] mb-2">About Me</h4>
                      <p className="text-sm text-[#dcddde]">{recipient.bio}</p>
                      <div className="h-px bg-[#222222] my-4" />
                    </>
                  )}

                  <h4 className="text-xs font-semibold uppercase text-[#888888] mb-2">
                    SerikaCord Member Since
                  </h4>
                  <p className="text-sm text-[#dcddde]">
                    {recipient.createdAt
                      ? new Date(recipient.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="px-4 mt-4">
                <div className="bg-[#111111] rounded-lg p-4">
                  <h4 className="text-xs font-semibold uppercase text-[#888888] mb-2">Note</h4>
                  <textarea
                    placeholder="Click to add a note"
                    className="w-full bg-transparent text-sm text-[#dcddde] placeholder:text-[#555555] resize-none focus:outline-none transition-colors duration-150"
                    rows={2}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      <DeleteMessageDialog
        message={actions.deleteConfirmMessage}
        onCancel={() => actions.setDeleteConfirmMessage(null)}
        onConfirm={() => void actions.confirmDelete()}
      />

      {/* Pinned messages dialog */}
      <Dialog open={showPins} onOpenChange={setShowPins}>
        <DialogContent className="bg-[#1a1a1a] border-[#222222] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pin className="w-5 h-5 text-[#8B5CF6]" />
              Pinned Messages
            </DialogTitle>
            <DialogDescription className="text-[#888888]">
              {isLoadingPins
                ? "Loading..."
                : `${pinnedMessages.length} pinned message${pinnedMessages.length === 1 ? "" : "s"}`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-2 scrollbar-thin">
            {pinnedMessages.length === 0 ? (
              <div className="text-center py-8 text-[#888888]">No pinned messages yet</div>
            ) : (
              pinnedMessages.map((msg) => (
                <div key={msg.id} className="bg-[#0a0a0a] rounded-md p-3 border border-[#222222]">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={msg.author?.avatar} />
                      <AvatarFallback className="bg-[#8B5CF6] text-white text-xs">
                        {(msg.author?.displayName || msg.author?.username || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm text-white">
                      {msg.author?.displayName || msg.author?.username || "Unknown"}
                    </span>
                    <span className="text-xs text-[#666666]">{formatMessageTimestamp(msg.createdAt)}</span>
                    <button
                      onClick={() => void actions.togglePin(msg)}
                      className="ml-auto p-1 hover:bg-[#222222] rounded-md transition-colors"
                      title="Unpin"
                    >
                      <Pin className="w-4 h-4 text-[#8B5CF6]" />
                    </button>
                  </div>
                  <p className="text-sm text-[#dcddde]">{msg.content || "(attachment)"}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MessageContextMenu
        menu={actions.contextMenu}
        isOwn={(message) => message.authorId === user.id}
        onClose={() => actions.setContextMenu(null)}
        onReply={handleReply}
        onAddReaction={(message) => actions.setReactionPickerMessage(message.id)}
        onCopy={actions.copyMessage}
        onPinToggle={(message) => void actions.togglePin(message)}
        onEdit={actions.startEditing}
        onDelete={actions.setDeleteConfirmMessage}
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
    </div>
  );
}
