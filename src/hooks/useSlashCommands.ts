"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  parseSlashCommand,
  parseUserMention,
  parseDuration,
  type ParsedCommand,
} from "@/lib/chat/slashCommands";

interface UseSlashCommandsOptions {
  serverId?: string;
  channelId?: string;
  /** Clear visible messages client-side (for /clear) */
  clearMessages?: (count: number, userId?: string) => void;
}

interface SlashCommandResult {
  /** True if the message was consumed as a command (don't send to server) */
  handled: boolean;
  /** For TTS, the text to speak and then send as a normal message */
  ttsText?: string;
}

/**
 * Hook that provides handlers for built-in slash commands.
 * Returns a function that tries to execute a command from raw input.
 */
export function useSlashCommands({
  serverId,
  channelId,
  clearMessages,
}: UseSlashCommandsOptions) {
  const executeCommand = useCallback(
    async (rawInput: string): Promise<SlashCommandResult> => {
      const parsed = parseSlashCommand(rawInput);
      if (!parsed) return { handled: false };

      switch (parsed.name) {
        case "tts": {
          const text = parsed.args.join(" ");
          if (!text) {
            toast.error("Usage: /tts <message>");
            return { handled: true };
          }
          // Use browser TTS
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
          }
          // Still send the text as a normal message
          return { handled: true, ttsText: text };
        }

        case "clear": {
          if (!serverId || !channelId) {
            toast.error("This command can only be used in a server channel");
            return { handled: true };
          }
          let amount = 100;
          let targetUserId: string | undefined;

          for (const arg of parsed.args) {
            const mentionId = parseUserMention(arg);
            if (mentionId) {
              targetUserId = mentionId;
              continue;
            }
            if (arg.toLowerCase() === "all") {
              targetUserId = undefined;
              continue;
            }
            const num = parseInt(arg, 10);
            if (!isNaN(num) && num > 0 && num <= 100) {
              amount = num;
            }
          }

          try {
            const res = await fetch(
              `/api/channels/${channelId}/messages/bulk-delete`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count: amount, userId: targetUserId }),
              },
            );
            if (res.ok) {
              const data = await res.json().catch(() => ({}));
              const deleted = data.deleted ?? amount;
              toast.success(`Cleared ${deleted} message${deleted !== 1 ? "s" : ""}`);
              clearMessages?.(amount, targetUserId);
            } else {
              const err = await res.json().catch(() => ({}));
              toast.error(err.error || "Failed to clear messages");
            }
          } catch {
            toast.error("Failed to clear messages");
          }
          return { handled: true };
        }

        case "kick": {
          if (!serverId) {
            toast.error("This command can only be used in a server");
            return { handled: true };
          }
          const userArg = parsed.args[0];
          const userId = parseUserMention(userArg || "");
          if (!userId) {
            toast.error("Usage: /kick @user [reason]");
            return { handled: true };
          }
          const reason = parsed.args.slice(1).join(" ") || undefined;
          try {
            const res = await fetch(
              `/api/servers/${serverId}/members/${userId}/kick`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
              },
            );
            if (res.ok) {
              toast.success("Member kicked");
            } else {
              const err = await res.json().catch(() => ({}));
              toast.error(err.error || "Failed to kick member");
            }
          } catch {
            toast.error("Failed to kick member");
          }
          return { handled: true };
        }

        case "ban": {
          if (!serverId) {
            toast.error("This command can only be used in a server");
            return { handled: true };
          }
          const userArg = parsed.args[0];
          const userId = parseUserMention(userArg || "");
          if (!userId) {
            toast.error("Usage: /ban @user [reason]");
            return { handled: true };
          }
          const reason = parsed.args.slice(1).join(" ") || undefined;
          try {
            const res = await fetch(
              `/api/servers/${serverId}/bans`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, reason }),
              },
            );
            if (res.ok) {
              toast.success("Member banned");
            } else {
              const err = await res.json().catch(() => ({}));
              toast.error(err.error || "Failed to ban member");
            }
          } catch {
            toast.error("Failed to ban member");
          }
          return { handled: true };
        }

        case "timeout": {
          if (!serverId) {
            toast.error("This command can only be used in a server");
            return { handled: true };
          }
          const userArg = parsed.args[0];
          const userId = parseUserMention(userArg || "");
          if (!userId) {
            toast.error("Usage: /timeout @user <duration> [reason]");
            return { handled: true };
          }
          const durationArg = parsed.args[1];
          const durationMs = parseDuration(durationArg || "");
          if (!durationMs) {
            toast.error("Invalid duration. Use formats like 60s, 5m, 1h, 1d");
            return { handled: true };
          }
          const reason = parsed.args.slice(2).join(" ") || undefined;
          try {
            const res = await fetch(
              `/api/servers/${serverId}/members/${userId}/timeout`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ durationMs, reason }),
              },
            );
            if (res.ok) {
              toast.success("Member timed out");
            } else {
              const err = await res.json().catch(() => ({}));
              toast.error(err.error || "Failed to timeout member");
            }
          } catch {
            toast.error("Failed to timeout member");
          }
          return { handled: true };
        }

        case "nick": {
          if (!serverId) {
            toast.error("This command can only be used in a server");
            return { handled: true };
          }
          const nickname = parsed.args.join(" ") || "";
          try {
            const res = await fetch(
              `/api/servers/${serverId}/members/@me/nick`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nick: nickname || null }),
              },
            );
            if (res.ok) {
              toast.success(nickname ? `Nickname set to "${nickname}"` : "Nickname reset");
            } else {
              const err = await res.json().catch(() => ({}));
              toast.error(err.error || "Failed to change nickname");
            }
          } catch {
            toast.error("Failed to change nickname");
          }
          return { handled: true };
        }

        default:
          return { handled: false };
      }
    },
    [serverId, channelId, clearMessages],
  );

  return { executeCommand };
}
