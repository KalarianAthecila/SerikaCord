/**
 * Quote-card data for in-app message links. One shared fetch per link so
 * every card (and a repeat of the same link) waits on the same request.
 * Channel messages come back as an array; DM and group DM lists as `{ messages }`.
 */
import { BoundedMap } from "@/lib/utils/boundedMap";
import {
  jumpTargetForChannel,
  messageLinkSnippet,
  type AppMessageLink,
  type ChannelJumpInfo,
} from "@/lib/chat/appLinks";

export interface PreviewAuthor {
  name: string;
  avatar: string | null;
}

export type MessagePreview =
  | { status: "loading" }
  | { status: "missing"; href: string }
  | { status: "encrypted"; href: string; author: PreviewAuthor }
  | { status: "ok"; href: string; author: PreviewAuthor; snippet: string; attachment: boolean };

const LOADING: MessagePreview = { status: "loading" };

const channels = new BoundedMap<string, Promise<ChannelJumpInfo | null>>(100);
const previews = new BoundedMap<string, MessagePreview>(100);
const previewInflight = new Map<string, Promise<void>>();
const previewListeners = new Set<() => void>();

const targets = new BoundedMap<string, string | null>(100);
const targetInflight = new Map<string, Promise<string | null>>();
const targetListeners = new Set<() => void>();

function emit(listeners: Set<() => void>) {
  for (const listener of listeners) listener();
}

export function subscribePreviews(listener: () => void): () => void {
  previewListeners.add(listener);
  return () => previewListeners.delete(listener);
}

export function subscribeTargets(listener: () => void): () => void {
  targetListeners.add(listener);
  return () => targetListeners.delete(listener);
}

export function peekPreview(key: string): MessagePreview {
  return previews.get(key) ?? LOADING;
}

export function peekTarget(key: string): string | null {
  return targets.get(key) ?? null;
}

export function previewKey(link: AppMessageLink, viewerId: string | null): string {
  return `${viewerId ?? ""}|${link.dmChannelId ?? ""}|${link.previewUrl ?? ""}|${link.messageId}`;
}

export function targetKey(channelId: string, messageId: string | null, viewerId: string | null): string {
  return `${viewerId ?? ""}:${channelId}:${messageId ?? ""}`;
}

function loadChannel(channelId: string): Promise<ChannelJumpInfo | null> {
  const hit = channels.get(channelId);
  if (hit) return hit;
  const pending = fetch(`/api/channels/${encodeURIComponent(channelId)}`, { credentials: "same-origin" })
    .then(async (res) => {
      if (res.status === 401 || res.status === 403 || res.status === 404) return null;
      if (!res.ok) throw new Error("channel");
      const data = (await res.json().catch(() => null)) as { channel?: ChannelJumpInfo } | null;
      const channel = data?.channel;
      if (!channel || typeof channel.id !== "string") return null;
      return {
        type: typeof channel.type === "string" ? channel.type : null,
        id: channel.id,
        serverId: typeof channel.serverId === "string" ? channel.serverId : null,
        recipientIds: Array.isArray(channel.recipientIds)
          ? channel.recipientIds.filter((id): id is string => typeof id === "string")
          : [],
      };
    })
    .catch(() => {
      channels.delete(channelId);
      return null;
    });
  channels.set(channelId, pending);
  return pending;
}

/** Resolved href for an `@me` channel link, or null when it can't be opened. */
export function ensureTarget(
  channelId: string,
  messageId: string | null,
  viewerId: string | null,
): Promise<string | null> {
  const key = targetKey(channelId, messageId, viewerId);
  if (targets.has(key)) return Promise.resolve(targets.get(key) ?? null);
  const existing = targetInflight.get(key);
  if (existing) return existing;
  const pending = loadChannel(channelId)
    .then((channel) => {
      const href = channel ? jumpTargetForChannel(channel, viewerId, messageId)?.href ?? null : null;
      targets.set(key, href);
      emit(targetListeners);
      return href;
    })
    .catch(() => {
      targets.set(key, null);
      emit(targetListeners);
      return null;
    })
    .finally(() => targetInflight.delete(key));
  targetInflight.set(key, pending);
  return pending;
}

interface RawMessage {
  id?: string;
  content?: string;
  attachments?: unknown[];
  sticker?: unknown;
  e2ee?: unknown;
  author?: { displayName?: string | null; username?: string | null; avatar?: string | null } | null;
}

function pickMessage(data: unknown, messageId: string): RawMessage | null {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { messages?: unknown }).messages)
      ? (data as { messages: unknown[] }).messages
      : null;
  if (!list) return null;
  const want = messageId.toLowerCase();
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const msg = item as RawMessage;
    if (typeof msg.id === "string" && msg.id.toLowerCase() === want) return msg;
  }
  return null;
}

function authorOf(msg: RawMessage): PreviewAuthor {
  const name = msg.author?.displayName || msg.author?.username || "";
  const avatar = typeof msg.author?.avatar === "string" ? msg.author.avatar : null;
  return { name, avatar };
}

export function ensurePreview(link: AppMessageLink, viewerId: string | null): void {
  const key = previewKey(link, viewerId);
  if (previews.has(key) || previewInflight.has(key)) return;
  if (!link.previewUrl && !link.dmChannelId) {
    // Snowflake links jump through the server page; there is nothing to quote.
    previews.set(key, { status: "missing", href: link.href });
    emit(previewListeners);
    return;
  }
  const job = (async () => {
    let href = link.href;
    let previewUrl = link.previewUrl;
    if (link.dmChannelId) {
      const channel = await loadChannel(link.dmChannelId);
      const target = channel ? jumpTargetForChannel(channel, viewerId, link.messageId) : null;
      if (!target?.previewUrl) {
        previews.set(key, { status: "missing", href: target?.href || href });
        emit(previewListeners);
        return;
      }
      href = target.href;
      previewUrl = target.previewUrl;
    }
    if (!previewUrl) {
      previews.set(key, { status: "missing", href });
      emit(previewListeners);
      return;
    }
    const res = await fetch(previewUrl, { credentials: "same-origin" });
    if (!res.ok) {
      previews.set(key, { status: "missing", href });
      emit(previewListeners);
      return;
    }
    const msg = pickMessage(await res.json().catch(() => null), link.messageId);
    if (!msg) {
      previews.set(key, { status: "missing", href });
      emit(previewListeners);
      return;
    }
    const author = authorOf(msg);
    if (msg.e2ee) {
      previews.set(key, { status: "encrypted", href, author });
      emit(previewListeners);
      return;
    }
    const snippet = messageLinkSnippet(typeof msg.content === "string" ? msg.content : "");
    const attachment = !snippet && ((Array.isArray(msg.attachments) && msg.attachments.length > 0) || Boolean(msg.sticker));
    previews.set(key, { status: "ok", href, author, snippet, attachment });
    emit(previewListeners);
  })().catch(() => {
    previews.set(key, { status: "missing", href: link.href });
    emit(previewListeners);
  }).finally(() => previewInflight.delete(key));
  previewInflight.set(key, job);
}
