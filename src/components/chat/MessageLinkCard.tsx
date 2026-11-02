"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cdnImage } from "@/lib/utils";
import type { AppMessageLink } from "@/lib/chat/appLinks";
import { useChatGt } from "./ChatGtContext";
import { AppAnchor } from "./AppAnchor";
import {
  ensurePreview,
  peekPreview,
  previewKey,
  subscribePreviews,
  type MessagePreview,
} from "./messageLinkPreview";
import type { EncryptedPreviewLabels } from "@/lib/e2ee/previewText";

const LOADING: MessagePreview = { status: "loading" };

function MessageLinkCard({ link }: { link: AppMessageLink }) {
  const gt = useChatGt();
  const { user, isLoading } = useAuth();
  const viewerId = user?.id ?? null;
  const key = previewKey(link, viewerId);
  const preview = useSyncExternalStore(subscribePreviews, () => peekPreview(key), () => LOADING);
  // Passed into the encrypted-quote opener. Same strings the card already shows.
  const labels = useMemo<EncryptedPreviewLabels>(() => ({
    attachment: gt("(attachment)"),
    sticker: gt("(attachment)"),
    spoiler: gt("Spoiler"),
  }), [gt]);

  useEffect(() => {
    // Wait until we know who is signed in, so a decrypted quote uses their keys
    // and an `@me` channel resolves to the other person.
    if (isLoading) return;
    ensurePreview(link, viewerId, labels);
  }, [link, viewerId, isLoading, labels]);

  if (preview.status === "loading") {
    return <div className="mt-1 h-10 max-w-[min(100%,32rem)] animate-pulse rounded-md bg-[var(--app-surface-alt)]" aria-hidden />;
  }

  const href = preview.href;
  const failed = preview.status === "missing";
  const name = preview.status === "ok" || preview.status === "encrypted"
    ? preview.author.name || gt("Unknown User")
    : "";
  const avatar = preview.status === "ok" || preview.status === "encrypted" ? preview.author.avatar : null;
  let detail = "";
  if (preview.status === "missing") detail = gt("Original message could not be loaded");
  else if (preview.status === "encrypted") detail = gt("Encrypted message");
  else if (preview.attachment) detail = gt("(attachment)");
  else detail = preview.snippet;

  return (
    <AppAnchor
      href={href}
      title={gt("Jump to message")}
      className="mt-1 flex max-w-[min(100%,32rem)] items-stretch gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 no-underline transition-colors hover:bg-[var(--app-surface-alt)]"
    >
      <span className="w-1 shrink-0 self-stretch rounded-full bg-[var(--app-accent)]" aria-hidden />
      <span className="flex min-w-0 flex-1 items-center gap-2">
        {!failed && (
          avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cdnImage(avatar)} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" loading="lazy" />
          ) : (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent)] text-[10px] font-bold text-[var(--text-on-accent)]">
              {(name || "?").charAt(0).toUpperCase()}
            </span>
          )
        )}
        <span className="min-w-0 flex-1">
          {!failed && <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">{name}</span>}
          {detail && (
            <span className={`block truncate text-xs ${failed ? "italic text-[var(--app-muted)]" : "text-[var(--app-muted)]"}`}>
              {detail}
            </span>
          )}
        </span>
      </span>
    </AppAnchor>
  );
}

/** Quote cards for the message links in one message. Snowflake links are not quoted. */
export function MessageLinkCards({ links }: { links?: AppMessageLink[] }) {
  const quoted = (links ?? []).filter((link) => link.previewUrl || link.dmChannelId);
  if (quoted.length === 0) return null;
  return (
    <>
      {quoted.map((link) => (
        <MessageLinkCard key={`${link.messageId}:${link.dmChannelId ?? ""}:${link.href}`} link={link} />
      ))}
    </>
  );
}
