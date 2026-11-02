import { describe, expect, test } from "bun:test";
import {
  jumpTargetForChannel,
  messageLinkSnippet,
  messageLinksIn,
  parseAppLink,
} from "@/lib/chat/appLinks";
import { previewUrlOf } from "@/lib/chat/linkUrls";

const S = "11111111-1111-4111-8111-111111111111";
const C = "22222222-2222-4222-8222-222222222222";
const M = "33333333-3333-4333-8333-333333333333";
const U = "44444444-4444-4444-8444-444444444444";
const SF = "1464024795882181149";

describe("parseAppLink", () => {
  test("a UUID message link jumps in the channel and can be previewed", () => {
    const link = {
      kind: "message" as const,
      href: `/channels/${S}/${C}?jump=${M}`,
      messageId: M,
      previewUrl: `/api/channels/${C}/messages?around=${M}&limit=1`,
    };
    expect(parseAppLink(`https://serika.chat/channels/${S}/${C}/${M}`)).toEqual(link);
    expect(parseAppLink(`https://www.serika.chat/channels/${S}/${C}?jump=${M}`)).toEqual(link);
    expect(parseAppLink(`https://canary.serika.chat/channels/${S.toUpperCase()}/${C}/${M.toUpperCase()}`)).toEqual(link);
    expect(parseAppLink(`/channels/${S}/${C}/${M}`)).toEqual(link);
  });

  test("a snowflake link uses the server redirect and is not previewed", () => {
    expect(parseAppLink(`https://serika.chat/channels/${SF}/${SF}/${SF}`)).toEqual({
      kind: "message",
      href: `/channels/${SF}/${SF}/${SF}`,
      messageId: SF,
      previewUrl: null,
    });
    expect(parseAppLink(`https://serika.chat/channels/${S}/${C}/${SF}`)).toMatchObject({ kind: "message", previewUrl: null });
    expect(parseAppLink(`/channels/${S}/${C}?jump=${SF}`)).toMatchObject({ href: `/channels/${S}/${C}/${SF}` });
  });

  test("@me message links wait for the client to resolve the channel", () => {
    expect(parseAppLink(`https://serika.chat/channels/@me/${C}/${M}`)).toEqual({
      kind: "message",
      href: `/channels/@me/${C}/${M}`,
      messageId: M,
      previewUrl: null,
      dmChannelId: C,
    });
    expect(parseAppLink(`https://serika.chat/channels/me/${C}/${M}`)?.dmChannelId).toBe(C);
  });

  test("DM, group DM and the legacy /channels/me link jump in place", () => {
    expect(parseAppLink(`/dm/${U}?jump=${M}`)).toEqual({
      kind: "message",
      href: `/dm/${U}?jump=${M}`,
      messageId: M,
      previewUrl: `/api/dms/${U}/messages?around=${M}&limit=1`,
    });
    expect(parseAppLink(`https://serika.chat/dm/group/${C}?jump=${M}`)).toMatchObject({
      href: `/dm/group/${C}?jump=${M}`,
      previewUrl: `/api/group-dms/${C}/messages?around=${M}&limit=1`,
    });
    expect(parseAppLink(`https://serika.chat/channels/me/${U}?jump=${M}`)).toMatchObject({
      href: `/dm/${U}?jump=${M}`,
      previewUrl: `/api/dms/${U}/messages?around=${M}&limit=1`,
    });
  });

  test("channel, home, invite and settings links stay in the app", () => {
    expect(parseAppLink(`/channels/${S}/${C}`)).toEqual({ kind: "navigate", href: `/channels/${S}/${C}` });
    expect(parseAppLink("https://serika.chat/channels/me")).toEqual({ kind: "navigate", href: "/channels/me" });
    expect(parseAppLink("https://serika.chat/channels/@me")).toEqual({ kind: "navigate", href: "/channels/me" });
    expect(parseAppLink("https://serika.chat/invite/Ab12")).toEqual({ kind: "navigate", href: "/invite/Ab12" });
    expect(parseAppLink("https://serika.chat/channels/settings/account")).toEqual({
      kind: "navigate",
      href: "/channels/settings/account",
    });
    expect(parseAppLink(`https://serika.chat/channels/@me/${C}`)).toEqual({
      kind: "navigate",
      href: `/channels/@me/${C}`,
      dmChannelId: C,
    });
  });

  test("a dev server's own host counts, and other hosts do not", () => {
    expect(parseAppLink(`http://localhost:3000/channels/${S}/${C}/${M}`, "localhost:3000")?.kind).toBe("message");
    expect(parseAppLink(`http://localhost:3000/channels/${S}/${C}/${M}`)).toBeNull();
    expect(parseAppLink("https://example.com/channels/" + S)).toBeNull();
    expect(parseAppLink("https://serika.chat.evil.com/channels/me")).toBeNull();
    expect(parseAppLink("https://evil.com/invite/Ab12")).toBeNull();
  });

  test("rejects userinfo, traversal, and non-http targets", () => {
    expect(parseAppLink("https://user:pass@serika.chat/channels/me")).toBeNull();
    // The URL parser collapses `..` before we see it. A result that is still an
    // app path is that path; one that leaves the app is dropped.
    expect(parseAppLink("https://serika.chat/channels/../dm/x")).toEqual({ kind: "navigate", href: "/dm/x" });
    expect(parseAppLink("https://serika.chat/channels/%2e%2e/etc/passwd")).toBeNull();
    expect(parseAppLink("https://serika.chat/channels/..%2Fsecret")).toBeNull();
    expect(parseAppLink("javascript:alert(1)")).toBeNull();
    expect(parseAppLink("https://serika.chat/channels/me")).not.toBeNull();
  });
});

describe("messageLinksIn", () => {
  const bare = `https://serika.chat/channels/${S}/${C}/${M}`;

  test("reads bare links, masked links, and HTML entities, in order", () => {
    const links = messageLinksIn(`see ${bare} and [jump](/dm/${U}?jump=${M})`);
    expect(links.map((l) => l.messageId)).toEqual([M, M]);
    expect(links[1]?.href).toBe(`/dm/${U}?jump=${M}`);
    expect(messageLinksIn(`https://serika.chat/channels/${S}/${C}?jump=${M}&amp;x=1`)[0]?.messageId).toBe(M);
  });

  test("dedupes and keeps three", () => {
    const a = `https://serika.chat/channels/${S}/${C}/${M}`;
    const b = `https://serika.chat/channels/${S}/${C}/55555555-5555-4555-8555-555555555555`;
    const c = `https://serika.chat/dm/${U}?jump=66666666-6666-4666-8666-666666666666`;
    const d = `https://serika.chat/dm/${U}?jump=77777777-7777-4777-8777-777777777777`;
    const links = messageLinksIn(`${a} ${a} ${b} ${c} ${d}`);
    expect(links).toHaveLength(3);
    expect(links.map((l) => l.messageId)).toEqual([M, "55555555-5555-4555-8555-555555555555", "66666666-6666-4666-8666-666666666666"]);
  });

  test("skips code, spoilers, and off-site urls", () => {
    expect(messageLinksIn(`\`${bare}\` ||${bare}||`)).toEqual([]);
    expect(messageLinksIn("```\n" + bare + "\n```")).toEqual([]);
    expect(messageLinksIn("https://example.com/a")).toEqual([]);
    expect(messageLinksIn("https://serika.cc/abc")).toEqual([]);
  });
});

describe("jumpTargetForChannel", () => {
  test("group DMs, 1:1 DMs and server channels", () => {
    expect(jumpTargetForChannel({ id: C, type: "group_dm" }, U, M)).toEqual({
      href: `/dm/group/${C}?jump=${M}`,
      previewUrl: `/api/group-dms/${C}/messages?around=${M}&limit=1`,
    });
    expect(jumpTargetForChannel({ id: C, type: "dm", recipientIds: [U, S] }, U, M)).toEqual({
      href: `/dm/${S}?jump=${M}`,
      previewUrl: `/api/dms/${S}/messages?around=${M}&limit=1`,
    });
    expect(jumpTargetForChannel({ id: C, type: "dm", recipientIds: [U, S] }, null, M)).toBeNull();
    expect(jumpTargetForChannel({ id: C, type: "text", serverId: S }, null, M)).toEqual({
      href: `/channels/${S}/${C}?jump=${M}`,
      previewUrl: `/api/channels/${C}/messages?around=${M}&limit=1`,
    });
  });
});

describe("messageLinkSnippet", () => {
  test("decodes, flattens mentions and emoji, and truncates", () => {
    expect(messageLinkSnippet("hi &amp;  <@" + U + "> <:wave:123>")).toBe("hi & @ :wave:");
    expect(messageLinkSnippet("x".repeat(200)).endsWith("…")).toBe(true);
    expect(messageLinkSnippet("x".repeat(200)).length).toBeLessThanOrEqual(140);
  });
});

describe("previewUrlOf skips in-app links", () => {
  test("the first off-site link is the one that unfurls", () => {
    const text = `https://serika.chat/channels/${S}/${C}/${M} https://example.com/a`;
    expect(previewUrlOf(text, [], (url) => parseAppLink(url) != null)).toBe("https://example.com/a");
    expect(previewUrlOf("https://example.com/a", [])).toBe("https://example.com/a");
  });
});
