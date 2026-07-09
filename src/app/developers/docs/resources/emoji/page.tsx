import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Emoji",
  description: "SerikaCord Emoji resource: object structure, CRUD endpoints, image requirements, boost-level limits, and usage in messages.",
  path: "/developers/docs/resources/emoji",
  keywords: ["SerikaCord emoji", "custom emoji", "guild emoji", "animated emoji"],
});

export default function EmojiDoc() {
  return (
    <DocPage title="Emoji" description="Create, manage, and use custom emojis in guilds.">
      <H2 id="emoji-object">Emoji Object</H2>
      <CodeBlock lang="json">{`{
  "id": "1234567890",
  "name": "my_emoji",
  "roles": [],
  "user": {
    "id": "123",
    "username": "creator"
  },
  "require_colons": true,
  "managed": false,
  "animated": false,
  "available": true
}`}</CodeBlock>

      <H2 id="endpoints">Endpoints</H2>
      <Endpoint method="GET" path="/guilds/{guild.id}/emojis">List emojis in a guild.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/emojis/{emoji.id}">Get a guild emoji.</Endpoint>
      <Endpoint method="POST" path="/guilds/{guild.id}/emojis">
        Create an emoji. Requires <InlineCode>MANAGE_EMOJIS_AND_STICKERS</InlineCode>. Uses{" "}
        <InlineCode>multipart/form-data</InlineCode> with image as base64 data URI.
      </Endpoint>
      <Endpoint method="PATCH" path="/guilds/{guild.id}/emojis/{emoji.id}">Update an emoji.</Endpoint>
      <Endpoint method="DELETE" path="/guilds/{guild.id}/emojis/{emoji.id}">Delete an emoji.</Endpoint>

      <H2 id="limits">Limits</H2>
      <Table headers={["Boost Level", "Emoji Slots", "Animated Slots"]} rows={[
        ["None", "50", "50"],
        ["Tier 1", "100", "100"],
        ["Tier 2", "150", "150"],
        ["Tier 3", "250", "250"],
      ]} />

      <H2 id="image-requirements">Image Requirements</H2>
      <UL>
        <li>Format: PNG, JPG, or GIF (for animated)</li>
        <li>Max size: 256 KB</li>
        <li>Dimensions: 128x128 recommended</li>
        <li>Name: 2-32 characters, alphanumeric and underscores</li>
      </UL>

      <H2 id="using-emojis">Using Emojis in Messages</H2>
      <P>Custom emojis use the syntax <InlineCode>&lt;:name:id&gt;</InlineCode> (static) or <InlineCode>&lt;a:name:id&gt;</InlineCode> (animated).</P>
      <CodeBlock lang="json">{`{
  "content": "Hello <:my_emoji:1234567890>!"
}`}</CodeBlock>

      <Callout type="warning" title="Emoji Roles">
        Emojis can be restricted to specific roles. Only members with those roles can use the emoji.
      </Callout>
    </DocPage>
  );
}
