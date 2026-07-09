import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Reaction",
  description: "SerikaCord Reaction resource: reaction object, endpoints for add, remove, list, and delete reactions, with pagination and emoji parameter formats.",
  path: "/developers/docs/resources/reaction",
  keywords: ["SerikaCord reaction", "reaction object", "emoji reaction", "message reaction API"],
});

export default function ReactionDoc() {
  return (
    <DocPage title="Reaction" description="Manage emoji reactions on messages.">
      <P>
        Reactions allow users to respond to messages with emojis. See also the{" "}
        <Link2 href="/developers/docs/topics/reactions">Reactions topic</Link2> for event details.
      </P>

      <H2 id="reaction-object">Reaction Object</H2>
      <CodeBlock lang="json">{`{
  "count": 3,
  "count_details": {
    "burst": 1,
    "normal": 2
  },
  "me": true,
  "me_burst": false,
  "burst_colors": ["#8B5CF6"],
  "emoji": {
    "id": null,
    "name": "👍"
  }
}`}</CodeBlock>

      <H2 id="endpoints">Endpoints</H2>
      <Endpoint method="PUT" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me">Add reaction.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me">Remove own reaction.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/{user.id}">Remove other's reaction.</Endpoint>
      <Endpoint method="GET" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}">Get users who reacted.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}">Remove all reactions for emoji.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}/reactions">Remove all reactions.</Endpoint>

      <H2 id="emoji-parameter">Emoji Parameter</H2>
      <P>
        The <InlineCode>emoji</InlineCode> URL parameter can be:
      </P>
      <UL>
        <li>A unicode emoji (e.g., <InlineCode>👍</InlineCode>) — URL-encoded</li>
        <li>A custom emoji in <InlineCode>name:id</InlineCode> format (e.g., <InlineCode>my_emoji:123456</InlineCode>)</li>
      </UL>

      <Callout type="info" title="Pagination">
        The GET reactions endpoint supports <InlineCode>before</InlineCode>, <InlineCode>after</InlineCode>,
        and <InlineCode>limit</InlineCode> (max 100) query parameters for pagination.
      </Callout>
    </DocPage>
  );
}
