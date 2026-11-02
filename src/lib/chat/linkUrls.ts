/** URL helpers for link previews (kept apart from the preview components so a message can decide without loading them). */

/** Loose URL comparison ignoring scheme, `www.`, trailing slash and hash. */
export function normalizeEmbedUrl(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/#.*$/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

// Skip URLs wrapped in <...> (Discord's no-embed syntax) via negative
// lookbehind for <, and exclude > from URL chars so the closing bracket
// doesn't get captured. A fresh RegExp per call: a shared /g keeps lastIndex.
const URL_RE_SRC = String.raw`(?<!<)(https?:\/\/[^\s<>]+[^<.,:;"')\]\s>])`;

/** Bare http(s) URLs in `text`, in order, with the index of each match. */
export function urlSpans(text: string): { index: number; url: string }[] {
  const out: { index: number; url: string }[] = [];
  for (const m of text.matchAll(new RegExp(URL_RE_SRC, "g"))) {
    if (m.index !== undefined && m[1]) out.push({ index: m.index, url: m[1] });
  }
  return out;
}

export function extractUrls(text: string): string[] {
  return urlSpans(text).map((s) => s.url);
}

/**
 * The link a message previews: its first URL that a rich embed on the message
 * doesn't already show, or "" for none. `text` is the decoded message text.
 */
export function previewUrlOf(
  text: string,
  renderedEmbedUrls: string[],
  /** Extra skip, e.g. in-app message links that get a quote card instead of a website preview. */
  skipUrl?: (url: string) => boolean,
): string {
  const urls = extractUrls(text);
  if (urls.length === 0) return "";
  const skip = renderedEmbedUrls.map(normalizeEmbedUrl);
  return urls.find((u) => !skip.includes(normalizeEmbedUrl(u)) && !skipUrl?.(u)) || "";
}
