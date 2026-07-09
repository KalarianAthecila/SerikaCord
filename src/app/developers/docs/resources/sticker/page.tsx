import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sticker",
  description: "SerikaCord Sticker resource: sticker item object, CRUD endpoints, Nitro sticker packs, create parameters, and permissions.",
  path: "/developers/docs/resources/sticker",
  keywords: ["SerikaCord sticker", "guild sticker", "sticker pack", "custom sticker"],
});

export default function StickerResourceDoc() {
  return (
    <DocPage title="Sticker" description="Manage custom stickers in guilds and use built-in sticker packs.">
      <P>
        See also the <Link2 href="/developers/docs/topics/stickers">Stickers topic</Link2> for
        overview and usage.
      </P>

      <H2 id="sticker-item">Sticker Item Object</H2>
      <P>A minimal representation used in messages:</P>
      <CodeBlock lang="json">{`{
  "id": "1234567890",
  "name": "My Sticker",
  "format_type": 1
}`}</CodeBlock>

      <H2 id="endpoints">Endpoints</H2>
      <Endpoint method="GET" path="/stickers/{sticker.id}">Get a sticker.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/stickers">List guild stickers.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/stickers/{sticker.id}">Get a guild sticker.</Endpoint>
      <Endpoint method="POST" path="/guilds/{guild.id}/stickers">Create a sticker (multipart/form-data).</Endpoint>
      <Endpoint method="PATCH" path="/guilds/{guild.id}/stickers/{sticker.id}">Update a sticker.</Endpoint>
      <Endpoint method="DELETE" path="/guilds/{guild.id}/stickers/{sticker.id}">Delete a sticker.</Endpoint>

      <H2 id="nitro-sticker-packs">Nitro Sticker Packs</H2>
      <Endpoint method="GET" path="/sticker-packs">List available Nitro sticker packs.</Endpoint>

      <H2 id="create-params">Create Parameters</H2>
      <Table headers={["Field", "Type", "Description"]} rows={[
        ["name", "string", "2-30 characters"],
        ["description", "string", "2-100 characters"],
        ["tags", "string", "2-200 characters (autocomplete keywords)"],
        ["file", "file", "PNG/APNG/GIF/Lottie file (max 512 KB)"],
      ]} />

      <Callout type="warning" title="Permissions">
        Creating, updating, and deleting stickers requires the{" "}
        <InlineCode>MANAGE_EMOJIS_AND_STICKERS</InlineCode> permission.
      </Callout>
    </DocPage>
  );
}
