import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Reactions",
  description:
    "SerikaCord reactions: add, remove, list, and manage emoji reactions on messages. Reaction objects, burst reactions, and gateway events.",
  path: "/developers/docs/topics/reactions",
  keywords: ["SerikaCord reactions", "emoji reaction", "burst reaction", "message reaction"],
});

export default function ReactionsDoc() {
  return (
    <DocPage title="Reactions" description="Add, remove, and manage emoji reactions on messages.">
      <H2 id="adding-reactions">Adding Reactions</H2>
      <Endpoint method="PUT" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me">
        Add a reaction to a message. <InlineCode>emoji</InlineCode> can be a unicode emoji or{" "}
        <InlineCode>name:id</InlineCode> for custom emojis.
      </Endpoint>

      <H2 id="removing-reactions">Removing Reactions</H2>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me">
        Remove your own reaction.
      </Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/{user.id}">
        Remove someone else's reaction (requires <InlineCode>MANAGE_MESSAGES</InlineCode>).
      </Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}">
        Remove all reactions for a specific emoji.
      </Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}/reactions">
        Remove all reactions on a message.
      </Endpoint>

      <H2 id="getting-reactions">Getting Reactions</H2>
      <Endpoint method="GET" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}">
        Get users who reacted with a specific emoji. Supports pagination with <InlineCode>before</InlineCode>,{" "}
        <InlineCode>after</InlineCode>, and <InlineCode>limit</InlineCode> query params.
      </Endpoint>

      <H2 id="reaction-object">Reaction Object</H2>
      <CodeBlock lang="json">{`{
  "count": 2,
  "me": true,
  "emoji": {
    "id": null,
    "name": "👍"
  }
}`}</CodeBlock>
      <Table headers={["Field", "Type", "Description"]} rows={[
        ["count", "integer", "Total number of reactions (including burst)"],
        ["me", "boolean", "Whether the current user has reacted"],
        ["emoji", "object", "The emoji object (id, name, animated)"],
        ["burst_colors", "array", "Colors of burst reactions (hex integers)"],
        ["count_details", "object", "Breakdown: { burst: int, normal: int }"],
      ]} />

      <H2 id="burst-reactions">Burst Reactions</H2>
      <P>
        Super reactions (burst reactions) are animated reactions. The reaction object includes a{" "}
        <InlineCode>burst_colors</InlineCode> array and <InlineCode>count</InlineCode> may include
        both normal and burst counts.
      </P>

      <H2 id="gateway-events">Gateway Events</H2>
      <UL>
        <li><InlineCode>MESSAGE_REACTION_ADD</InlineCode> — A user reacted</li>
        <li><InlineCode>MESSAGE_REACTION_REMOVE</InlineCode> — A user removed a reaction</li>
        <li><InlineCode>MESSAGE_REACTION_REMOVE_ALL</InlineCode> — All reactions removed</li>
        <li><InlineCode>MESSAGE_REACTION_REMOVE_EMOJI</InlineCode> — All reactions for an emoji removed</li>
      </UL>

      <Callout type="info" title="Reaction Limits">
        A message can have up to 40 different reactions. Each user can only react with one of each
        emoji per message.
      </Callout>
    </DocPage>
  );
}
