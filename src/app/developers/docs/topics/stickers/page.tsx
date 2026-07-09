import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Stickers",
  description:
    "SerikaCord stickers: create, manage, and send custom stickers in guilds. PNG, APNG, Lottie, and GIF formats with size limits.",
  path: "/developers/docs/topics/stickers",
  keywords: ["SerikaCord stickers", "custom sticker", "APNG", "Lottie", "guild sticker"],
});

export default function StickersDoc() {
  return (
    <DocPage title="Stickers" description="Create, manage, and send custom stickers in guilds.">
      <H2 id="sticker-types">Sticker Types</H2>
      <Table headers={["Type", "Value", "Description"]} rows={[
        ["PNG", "1", "Static PNG sticker"],
        ["APNG", "2", "Animated PNG sticker"],
        ["LOTTIE", "3", "Lottie JSON animation"],
      ]} />

      <H2 id="sticker-format">Sticker Format Types</H2>
      <Table headers={["Format", "Value"]} rows={[
        ["PNG", "1"],
        ["APNG", "2"],
        ["LOTTIE", "3"],
        ["GIF", "4"],
      ]} />

      <H2 id="sticker-object">Sticker Object</H2>
      <CodeBlock lang="json">{`{
  "id": "1234567890",
  "name": "My Sticker",
  "description": "A cool sticker",
  "tags": "happy",
  "type": 1,
  "format_type": 1,
  "available": true,
  "guild_id": "1234567890",
  "user": {
    "id": "123",
    "username": "creator"
  }
}`}</CodeBlock>

      <H2 id="endpoints">Endpoints</H2>
      <Endpoint method="GET" path="/stickers/{sticker.id}">Get a sticker.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/stickers">List stickers in a guild.</Endpoint>
      <Endpoint method="POST" path="/guilds/{guild.id}/stickers">
        Create a sticker. Requires <InlineCode>MANAGE_EMOJIS_AND_STICKERS</InlineCode>. Uses{" "}
        <InlineCode>multipart/form-data</InlineCode>.
      </Endpoint>
      <Endpoint method="PATCH" path="/guilds/{guild.id}/stickers/{sticker.id}">Update a sticker.</Endpoint>
      <Endpoint method="DELETE" path="/guilds/{guild.id}/stickers/{sticker.id}">Delete a sticker.</Endpoint>

      <H2 id="limits">Limits</H2>
      <UL>
        <li>Name: 2-30 characters</li>
        <li>Description: 2-100 characters</li>
        <li>Tags: 2-200 characters (used for auto-complete)</li>
        <li>File size: max 512 KB</li>
        <li>Free guilds: 5 custom stickers</li>
        <li>Boosted guilds: up to 60 custom stickers</li>
      </UL>

      <Callout type="warning" title="Lottie Stickers">
        Lottie stickers must use the official Lottie JSON format and have a max file size of 512 KB.
      </Callout>

      <H2 id="sending-stickers">Sending Stickers in Messages</H2>
      <CodeBlock lang="json">{`{
  "content": "Check this out!",
  "sticker_ids": ["1234567890"]
}`}</CodeBlock>
      <P>A message can include up to 3 stickers.</P>
    </DocPage>
  );
}
