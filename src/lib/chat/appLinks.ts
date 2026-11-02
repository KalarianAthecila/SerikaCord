/**
 * In-app links (message, channel, DM, invite) pasted into chat.
 *
 * Copied message links are `/channels/{server}/{channel}?jump={id}` (and the
 * DM equivalents). Discord-style links are `/channels/{guild}/{channel}/{message}`,
 * with UUIDs or snowflakes. A UUID message link can be previewed from the
 * existing `?around=` message list. A snowflake has to go through the server
 * redirect page, which owns the snowflake map, so it is not previewed here.
 * `@me/{channel}/{message}` is a DM or group DM; the client resolves the
 * channel (`dmChannelId`) because that page does not know the viewer.
 */
import { decodeHtmlEntities } from "@/lib/chat/messages";
import { urlSpans } from "@/lib/chat/linkUrls";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SNOWFLAKE_RE = /^\d{15,21}$/;
const INVITE_RE = /^[A-Za-z0-9_-]{2,32}$/;
const SEG_RE = /^[A-Za-z0-9@._~-]{1,80}$/;
const SEARCH_RE = /^\?[A-Za-z0-9._~%=&+-]{0,500}$/;

const APP_HOSTS = new Set(["serika.chat", "www.serika.chat", "canary.serika.chat"]);
/** First path segment under /channels that is an app page, not a server id. */
const CHANNEL_SECTIONS = new Set(["explore", "messages", "notifications", "profile", "settings"]);

export const MAX_MESSAGE_LINK_CARDS = 3;

export interface AppMessageLink {
  kind: "message";
  /** In-app path. For an unresolved `@me` channel this is the Discord-style path. */
  href: string;
  messageId: string;
  /**
   * `GET` that returns the message (channel list is an array, DM lists are
   * `{ messages }`). Null when the id is a snowflake, or when `dmChannelId`
   * still has to be resolved.
   */
  previewUrl: string | null;
  /** Channel id from `/channels/@me/{channel}/{message}`. Resolve before jumping. */
  dmChannelId?: string;
}

export type AppLink =
  | AppMessageLink
  | { kind: "navigate"; href: string; dmChannelId?: string };

export interface ChannelJumpInfo {
  type?: string | null;
  id: string;
  serverId?: string | null;
  recipientIds?: Array<string | null> | null;
}

function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}

function isRef(id: string): boolean {
  return isUuid(id) || SNOWFLAKE_RE.test(id);
}

function norm(id: string): string {
  return isUuid(id) ? id.toLowerCase() : id;
}

function safeSearch(search: string): string {
  if (!search || search === "?") return "";
  return SEARCH_RE.test(search) ? search : "";
}

function hostAllowed(url: URL, ownHost?: string): boolean {
  if (url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  if (APP_HOSTS.has(host) && url.port === "") return true;
  if (!ownHost) return false;
  const own = ownHost.toLowerCase();
  return own === url.host.toLowerCase() || (!own.includes(":") && own === host);
}

/** Path segments with `.` / `..` / encoded slashes rejected. */
function segmentsOf(pathname: string): string[] | null {
  let path = pathname.replace(/\/{2,}/g, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  const decoded: string[] = [];
  for (const seg of path.split("/")) {
    if (!seg) continue;
    let d: string;
    try {
      d = decodeURIComponent(seg);
    } catch {
      return null;
    }
    if (d === "." || d === ".." || d.includes("/") || d.includes("\\") || d.includes("\0")) return null;
    decoded.push(d);
  }
  return decoded;
}

function navigateRest(segs: string[], search: string): AppLink | null {
  if (segs.length === 0 || segs.length > 6) return null;
  if (!segs.every((s) => SEG_RE.test(s))) return null;
  return { kind: "navigate", href: `/${segs.join("/")}${safeSearch(search)}` };
}

function messageFromIds(server: string, channel: string, message: string): AppMessageLink {
  const s = server === "me" || server === "@me" ? "@me" : norm(server);
  const c = norm(channel);
  const m = norm(message);
  if (s === "@me") {
    if (isUuid(c) && isUuid(m)) {
      return { kind: "message", href: `/channels/@me/${c}/${m}`, messageId: m, previewUrl: null, dmChannelId: c };
    }
    return { kind: "message", href: `/channels/@me/${c}/${m}`, messageId: m, previewUrl: null };
  }
  // Any snowflake is resolved by the server page (it has the snowflake map).
  if (!isUuid(s) || !isUuid(c) || !isUuid(m)) {
    return { kind: "message", href: `/channels/${s}/${c}/${m}`, messageId: m, previewUrl: null };
  }
  return {
    kind: "message",
    href: `/channels/${s}/${c}?jump=${m}`,
    messageId: m,
    previewUrl: `/api/channels/${c}/messages?around=${m}&limit=1`,
  };
}

function withJump(
  href: string,
  previewUrl: string | null,
  jump: string | null,
  previewable: boolean,
): AppLink {
  if (!jump || !isRef(jump)) return { kind: "navigate", href };
  const m = norm(jump);
  if (!previewable || !isUuid(m)) {
    return { kind: "message", href: `${href}?jump=${m}`, messageId: m, previewUrl: null };
  }
  return { kind: "message", href: `${href}?jump=${m}`, messageId: m, previewUrl };
}

function parseChannels(segs: string[], params: URLSearchParams, search: string): AppLink | null {
  if (segs.length === 1) return { kind: "navigate", href: "/channels/me" };
  const head = segs[1];
  const jump = params.get("jump");

  if (head === "me" || head === "@me") {
    if (segs.length === 2) return { kind: "navigate", href: "/channels/me" };
    const channelOrUser = segs[2];
    if (segs.length === 3 && isUuid(channelOrUser)) {
      const id = channelOrUser.toLowerCase();
      // /channels/me/{user} is the legacy DM page. /channels/@me/{channel} is a DM channel.
      if (head === "me") {
        const m = jump && isUuid(jump) ? jump.toLowerCase() : null;
        const preview = m ? `/api/dms/${id}/messages?around=${m}&limit=1` : null;
        return withJump(`/dm/${id}`, preview, jump, Boolean(preview));
      }
      if (jump && isRef(jump)) return messageFromIds("@me", id, jump);
      return { kind: "navigate", href: `/channels/@me/${id}`, dmChannelId: id };
    }
    if (segs.length === 4 && isRef(channelOrUser) && isRef(segs[3])) {
      return messageFromIds("@me", channelOrUser, segs[3]);
    }
    return navigateRest(segs, search);
  }

  if (CHANNEL_SECTIONS.has(head)) return navigateRest(segs, search);

  const channel = segs[2];
  const message = segs[3];
  if (segs.length === 2) return navigateRest(segs, search);
  if (segs.length === 3 && isRef(head) && isRef(channel)) {
    if (jump && isRef(jump)) return messageFromIds(head, channel, jump);
    return { kind: "navigate", href: `/channels/${norm(head)}/${norm(channel)}` };
  }
  if (segs.length === 4 && isRef(head) && isRef(channel) && isRef(message)) {
    return messageFromIds(head, channel, message);
  }
  return navigateRest(segs, search);
}

function parseDm(segs: string[], params: URLSearchParams, search: string): AppLink | null {
  const jump = params.get("jump");
  if (segs[1] === "group" && segs.length === 3 && isRef(segs[2])) {
    const id = norm(segs[2]);
    const preview = isUuid(id) && jump && isUuid(jump)
      ? `/api/group-dms/${id}/messages?around=${norm(jump)}&limit=1`
      : null;
    return withJump(`/dm/group/${id}`, preview, jump, Boolean(preview));
  }
  if (segs.length === 2 && isRef(segs[1])) {
    const id = norm(segs[1]);
    const preview = isUuid(id) && jump && isUuid(jump)
      ? `/api/dms/${id}/messages?around=${norm(jump)}&limit=1`
      : null;
    return withJump(`/dm/${id}`, preview, jump, Boolean(preview));
  }
  return navigateRest(segs, search);
}

/**
 * An in-app destination for `raw`, or null when the link should leave the app.
 * `ownHost` is `window.location.host` (including a port) so a dev server's
 * own links count; public hosts are recognized without it.
 */
export function parseAppLink(raw: string, ownHost?: string): AppLink | null {
  if (!raw || raw.length > 2048) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.includes("\\") || trimmed.includes("\0")) return null;
  const relative = trimmed.startsWith("/") && !trimmed.startsWith("//");
  let url: URL;
  try {
    url = relative ? new URL(trimmed, "https://serika.chat") : new URL(trimmed);
  } catch {
    return null;
  }
  if (!relative) {
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!hostAllowed(url, ownHost)) return null;
  }
  const segs = segmentsOf(url.pathname);
  if (!segs || segs.length === 0) return null;
  const search = url.search;
  if (segs[0] === "channels") return parseChannels(segs, url.searchParams, search);
  if (segs[0] === "dm") return parseDm(segs, url.searchParams, search);
  if (segs[0] === "invite" && segs.length === 2 && INVITE_RE.test(segs[1])) {
    return { kind: "navigate", href: `/invite/${segs[1]}` };
  }
  return null;
}

const MASKED_RE = /\[([^\]\n]+)\]\((?:<([^>\s]+)>|([^)\s]+))(?:\s+"[^"]*")?\)/g;

function withoutHidden(text: string): string {
  // Same length, so match indexes still line up. Code and spoilers are not links.
  return text
    .replace(/```[\s\S]*?```/g, (m) => " ".repeat(m.length))
    .replace(/``[\s\S]*?``|`[^`\n]*`/g, (m) => " ".repeat(m.length))
    .replace(/\|\|[\s\S]*?\|\|/g, (m) => " ".repeat(m.length));
}

/**
 * Quote cards for one message. A decrypted message's text is already on this
 * device, so it can be scanned. A row that is still ciphertext has nothing
 * to scan, and "suppress embeds" hides the quote with the website preview.
 */
export function messageQuoteLinks(
  message: { content?: string | null; suppressEmbeds?: boolean; e2ee?: { status?: string } | null },
  ownHost?: string,
): AppMessageLink[] {
  if (!message.content || message.suppressEmbeds) return [];
  if (message.e2ee && message.e2ee.status !== "ok") return [];
  return messageLinksIn(message.content, ownHost);
}

/** Message links in chat text, in order, deduped, at most {@link MAX_MESSAGE_LINK_CARDS}. */
export function messageLinksIn(text: string, ownHost?: string): AppMessageLink[] {
  if (!text) return [];
  const cleaned = withoutHidden(decodeHtmlEntities(text));
  const found: { index: number; raw: string }[] = [];
  for (const span of urlSpans(cleaned)) found.push({ index: span.index, raw: span.url });
  for (const m of cleaned.matchAll(new RegExp(MASKED_RE.source, "g"))) {
    const label = m[1] ?? "";
    const href = (m[2] || m[3] || "").trim();
    // A masked link whose label is a URL is shown raw; the bare URL scan covers it.
    if (!href || /https?:\/\//i.test(label) || m.index === undefined) continue;
    found.push({ index: m.index, raw: href });
  }
  found.sort((a, b) => a.index - b.index);

  const out: AppMessageLink[] = [];
  const seen = new Set<string>();
  for (const hit of found) {
    if (out.length >= MAX_MESSAGE_LINK_CARDS) break;
    const link = parseAppLink(hit.raw, ownHost);
    if (!link || link.kind !== "message") continue;
    const key = `${link.dmChannelId ?? ""}|${link.previewUrl ?? ""}|${link.href}|${link.messageId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(link);
  }
  return out;
}

/** Plain one-line quote for a message-link card. Not re-parsed as markdown. */
export function messageLinkSnippet(content: string, max = 140): string {
  const text = decodeHtmlEntities(content)
    .replace(/<a?:([A-Za-z0-9_]{1,32}):[A-Za-z0-9-]{1,40}>/g, ":$1:")
    .replace(/<@!?[A-Za-z0-9-]{1,40}>/g, "@")
    .replace(/<@&[A-Za-z0-9-]{1,40}>/g, "@")
    .replace(/<#[A-Za-z0-9-]{1,40}>/g, "#")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Where a resolved channel (from `GET /api/channels/:id`) actually opens,
 * plus the message list that can preview `messageId` when it is a UUID.
 */
export function jumpTargetForChannel(
  channel: ChannelJumpInfo,
  viewerId: string | null | undefined,
  messageId: string | null,
): { href: string; previewUrl: string | null } | null {
  if (!isUuid(channel.id)) return null;
  const id = channel.id.toLowerCase();
  const jump = messageId && isUuid(messageId) ? messageId.toLowerCase() : null;
  const q = jump ? `?jump=${jump}` : "";
  if (channel.type === "group_dm") {
    return {
      href: `/dm/group/${id}${q}`,
      previewUrl: jump ? `/api/group-dms/${id}/messages?around=${jump}&limit=1` : null,
    };
  }
  if (channel.type === "dm") {
    const ids = (channel.recipientIds ?? []).filter((r): r is string => typeof r === "string" && isUuid(r));
    const viewer = viewerId?.toLowerCase() ?? "";
    // The other person only: guessing when the viewer isn't in the channel would open the wrong DM.
    if (!viewer || !ids.some((r) => r.toLowerCase() === viewer)) return null;
    const other = ids.find((r) => r.toLowerCase() !== viewer);
    if (!other) return null;
    const recipient = other.toLowerCase();
    return {
      href: `/dm/${recipient}${q}`,
      previewUrl: jump ? `/api/dms/${recipient}/messages?around=${jump}&limit=1` : null,
    };
  }
  if (channel.serverId && isUuid(channel.serverId)) {
    const server = channel.serverId.toLowerCase();
    return {
      href: `/channels/${server}/${id}${q}`,
      previewUrl: jump ? `/api/channels/${id}/messages?around=${jump}&limit=1` : null,
    };
  }
  return null;
}
