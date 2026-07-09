import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Guild",
  description: "SerikaCord Guild resource: object structure, CRUD endpoints, roles, members, bans, invites, webhooks, verification levels, and features.",
  path: "/developers/docs/resources/guild",
  keywords: ["SerikaCord guild", "server object", "guild members", "guild roles", "guild bans"],
});

export default function GuildDoc() {
  return (
    <DocPage title="Guild" description="Create, manage, and interact with guilds (servers).">
      <H2 id="guild-object">Guild Object</H2>
      <CodeBlock lang="json">{`{
  "id": "1234567890",
  "name": "My Server",
  "icon": null,
  "description": null,
  "owner_id": "1234567890",
  "verification_level": 0,
  "member_count": 42,
  "premium_tier": 0,
  "features": [],
  "roles": [...],
  "channels": [...],
  "emojis": [...]
}`}</CodeBlock>

      <H2 id="endpoints">Endpoints</H2>
      <Endpoint method="POST" path="/guilds">Create a guild (bot only, max 10 per bot).</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}">Get a guild.</Endpoint>
      <Endpoint method="PATCH" path="/guilds/{guild.id}">Update a guild.</Endpoint>
      <Endpoint method="DELETE" path="/guilds/{guild.id}">Delete a guild (owner only).</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/preview">Get guild preview.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/channels">List channels.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/roles">List roles.</Endpoint>
      <Endpoint method="POST" path="/guilds/{guild.id}/roles">Create a role.</Endpoint>
      <Endpoint method="PATCH" path="/guilds/{guild.id}/roles/@me">Update own roles.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/members">List members.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/members/{user.id}">Get a member.</Endpoint>
      <Endpoint method="PUT" path="/guilds/{guild.id}/members/{user.id}">Add a member (bot, with token).</Endpoint>
      <Endpoint method="PATCH" path="/guilds/{guild.id}/members/{user.id}">Update a member.</Endpoint>
      <Endpoint method="DELETE" path="/guilds/{guild.id}/members/{user.id}">Kick a member.</Endpoint>
      <Endpoint method="PUT" path="/guilds/{guild.id}/bans/{user.id}">Ban a member.</Endpoint>
      <Endpoint method="DELETE" path="/guilds/{guild.id}/bans/{user.id}">Unban a user.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/bans">List bans.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/invites">List invites.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/webhooks">List webhooks.</Endpoint>

      <H2 id="verification-levels">Verification Levels</H2>
      <Table headers={["Level", "Value", "Description"]} rows={[
        ["None", "0", "No verification required"],
        ["Low", "1", "Must have verified email"],
        ["Medium", "2", "Must be registered for 5+ minutes"],
        ["High", "3", "Must be a member for 10+ minutes"],
        ["Very High", "4", "Must have verified phone number"],
      ]} />

      <H2 id="features">Guild Features</H2>
      <UL>
        <li><InlineCode>ANIMATED_BANNER</InlineCode> — Has animated banner</li>
        <li><InlineCode>ANIMATED_ICON</InlineCode> — Has animated icon</li>
        <li><InlineCode>BANNER</InlineCode> — Has banner image</li>
        <li><InlineCode>COMMUNITY</InlineCode> — Community server</li>
        <li><InlineCode>DISCOVERABLE</InlineCode> — In server discovery</li>
        <li><InlineCode>ENABLED_DISCOVERABLE_BEFORE</InlineCode></li>
        <li><InlineCode>FEATURABLE</InlineCode></li>
        <li><InlineCode>HAS_DIRECTORY_ENTRY</InlineCode></li>
        <li><InlineCode>INVITE_SPLASH</InlineCode> — Has invite splash</li>
        <li><InlineCode>MEMBER_VERIFICATION_GATE_ENABLED</InlineCode></li>
        <li><InlineCode>NEWS</InlineCode> — Has announcement channels</li>
        <li><InlineCode>PARTNERED</InlineCode> — Partnered server</li>
        <li><InlineCode>PREVIEW_ENABLED</InlineCode></li>
        <li><InlineCode>WELCOME_SCREEN_ENABLED</InlineCode></li>
        <li><InlineCode>VERIFIED</InlineCode> — Verified server</li>
        <li><InlineCode>VIP_REGIONS</InlineCode></li>
      </UL>

      <Callout type="info" title="Member Limits">
        <InlineCode>member_count</InlineCode> is approximate. For exact counts, use the member list
        endpoint with pagination.
      </Callout>
    </DocPage>
  );
}
