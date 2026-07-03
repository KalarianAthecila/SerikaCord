"use client";

import { Copy, Pencil, Pin, Reply, Smile, Trash2 } from "lucide-react";
import type { ChatMessage } from "@/lib/chat/types";
import type { MessageContextMenuState } from "@/hooks/useMessageActions";

interface MessageContextMenuProps<M extends ChatMessage> {
  menu: MessageContextMenuState<M> | null;
  isOwn: (message: M) => boolean;
  onClose: () => void;
  onReply: (message: M) => void;
  onAddReaction?: (message: M) => void;
  onCopy: (content: string) => void;
  onPinToggle: (message: M) => void;
  onEdit: (message: M) => void;
  onDelete: (message: M) => void;
}

const itemClass =
  "w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left";

/** Fixed-position right-click menu for a message. */
export function MessageContextMenu<M extends ChatMessage>({
  menu,
  isOwn,
  onClose,
  onReply,
  onAddReaction,
  onCopy,
  onPinToggle,
  onEdit,
  onDelete,
}: MessageContextMenuProps<M>) {
  if (!menu) return null;

  const { message } = menu;
  const run = (action: () => void) => () => {
    action();
    onClose();
  };

  return (
    <div
      className="fixed z-50 min-w-[180px] py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md shadow-xl"
      style={{
        left: Math.min(menu.x, typeof window !== "undefined" ? window.innerWidth - 200 : menu.x),
        top: Math.min(menu.y, typeof window !== "undefined" ? window.innerHeight - 300 : menu.y),
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={run(() => onReply(message))} className={itemClass}>
        <Reply className="w-4 h-4" /> Reply
      </button>
      {onAddReaction && (
        <button onClick={run(() => onAddReaction(message))} className={itemClass}>
          <Smile className="w-4 h-4" /> Add Reaction
        </button>
      )}
      <button onClick={run(() => onCopy(message.content))} className={itemClass}>
        <Copy className="w-4 h-4" /> Copy Text
      </button>
      <div className="h-px bg-[var(--border-subtle)] my-1" />
      <button onClick={run(() => onPinToggle(message))} className={itemClass}>
        <Pin className="w-4 h-4" /> {message.pinned ? "Unpin Message" : "Pin Message"}
      </button>
      {isOwn(message) && (
        <>
          <div className="h-px bg-[var(--border-subtle)] my-1" />
          <button onClick={run(() => onEdit(message))} className={itemClass}>
            <Pencil className="w-4 h-4" /> Edit Message
          </button>
          <button
            onClick={run(() => onDelete(message))}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors text-left"
          >
            <Trash2 className="w-4 h-4" /> Delete Message
          </button>
        </>
      )}
    </div>
  );
}
