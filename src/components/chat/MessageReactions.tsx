"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { reactionEmojiIdentifier, type MessageReaction } from "@/lib/chat/types";

interface MessageReactionsProps {
  reactions?: MessageReaction[];
  messageId: string;
  currentUserId?: string;
  onToggle: (messageId: string, emoji: string, hasReacted: boolean) => void;
  /** When provided, shows a trailing "+" button that opens the reaction picker. */
  onOpenPicker?: (messageId: string) => void;
}

/** Reaction chips under a message, with optimistic toggle on click. */
export function MessageReactions({
  reactions,
  messageId,
  currentUserId,
  onToggle,
  onOpenPicker,
}: MessageReactionsProps) {
  if (!reactions?.length) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.map((reaction) => {
        const hasReacted = currentUserId ? reaction.userIds.includes(currentUserId) : false;
        const emojiIdentifier = reactionEmojiIdentifier(reaction.emoji);
        return (
          <button
            key={reaction.emoji.id || reaction.emoji.name}
            onClick={() => onToggle(messageId, emojiIdentifier, hasReacted)}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-sm transition-colors border",
              hasReacted
                ? "bg-[#8B5CF6]/20 border-[#8B5CF6] text-[var(--text-primary)]"
                : "bg-[var(--app-surface-alt)] border-[var(--app-border)] text-[var(--app-muted)] hover:brightness-110"
            )}
          >
            {reaction.emoji.url ? (
              <img src={reaction.emoji.url} alt={reaction.emoji.name} className="w-4 h-4 object-contain" />
            ) : (
              <span className="leading-none">{reaction.emoji.name}</span>
            )}
            <span className={hasReacted ? "text-[var(--text-primary)]" : "text-[var(--app-muted)]"}>
              {reaction.count}
            </span>
          </button>
        );
      })}
      {onOpenPicker && (
        <button
          onClick={() => onOpenPicker(messageId)}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--app-surface-alt)] border border-[var(--app-border)] text-[var(--app-muted)] hover:brightness-110 hover:text-[var(--text-primary)] transition-colors"
          title="Add Reaction"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
