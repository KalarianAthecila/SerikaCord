import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "API Reference",
  description:
    "Complete reference for the SerikaCord REST API v10. Every endpoint, authentication, error codes, data structures, and Gateway connection details.",
  path: "/developers/docs/reference",
  keywords: ["SerikaCord API reference", "REST API", "endpoints", "v10", "Discord compatible"],
});

export default function ReferenceDoc() {
  return (
    <DocPage title="API Reference" description="Complete reference for the SerikaCord REST API, Gateway, and data structures. Every endpoint implemented in the bot API.">
      <P>
        The SerikaCord API is a Discord v10-compatible REST + Gateway API. All routes, parameters, and
        response structures mirror Discord&apos;s API. This page is the master reference. For detailed
        field-level docs on individual resources, see the <Link2 href="/developers/docs/resources/application">Resources</Link2> section.
      </P>

      <H2 id="base-url">Base URL</H2>
      <CodeBlock lang="bash">https://api.serika.chat/api/v10</CodeBlock>

      <H2 id="authentication">Authentication</H2>
      <P>Every request must include an <InlineCode>Authorization</InlineCode> header:</P>
      <Table headers={["Type", "Header", "Use Case"]} rows={[
        ["Bot Token", "Authorization: Bot <token>", "Bot API requests (all endpoints below)"],
        ["Bearer Token", "Authorization: Bearer <token>", "OAuth2 user-context requests"],
      ]} />
      <P>
        The bot token is validated by looking up the <InlineCode>Application</InlineCode> with a matching{" "}
        <InlineCode>botToken</InlineCode> field, then resolving the associated bot <InlineCode>User</InlineCode>.
        If either is missing, the API returns <InlineCode>401: Unauthorized</InlineCode>.
      </P>

      <H2 id="api-versioning">API Versioning</H2>
      <P>
        The API version is part of the URL path. The current and only supported version is{" "}
        <InlineCode>v10</InlineCode>.
      </P>
      <Table headers={["Version", "Status"]} rows={[
        ["v10", "Stable (active)"],
        ["v9", "Not supported"],
        ["v8", "Not supported"],
      ]} />

      <H2 id="request-format">Request Format</H2>
      <P>
        All request bodies use <InlineCode>application/json</InlineCode> unless otherwise noted.
        File uploads (emoji creation, sticker creation, message attachments) use{" "}
        <InlineCode>multipart/form-data</InlineCode>.
      </P>

      <H2 id="response-format">Response Format</H2>
      <P>
        All responses are JSON. Successful responses return the requested data object or an array.
        Delete operations return <InlineCode>204 No Content</InlineCode>. Errors return a JSON body:
      </P>
      <CodeBlock lang="json">{`{
  "code": 50001,
  "message": "Missing Access"
}`}</CodeBlock>
      <P>See <Link2 href="/developers/docs/topics/opcodes-and-status-codes">Opcodes & Status Codes</Link2> for the full list.</P>

      <H2 id="gateway-endpoint">Gateway Endpoint</H2>
      <Endpoint method="GET" path="/gateway">Returns the Gateway WebSocket URL.</Endpoint>
      <CodeBlock lang="json">{`{ "url": "wss://api.serika.chat/api/v10/gateway" }`}</CodeBlock>
      <P>Connect via WebSocket to receive real-time events. See <Link2 href="/developers/docs/topics/gateway">Gateway</Link2>.</P>

      <H2 id="user-endpoints">User Endpoints</H2>
      <Endpoint method="GET" path="/users/@me">Get the authenticated bot user.</Endpoint>
      <Endpoint method="GET" path="/users/{user.id}">Get any user by ID.</Endpoint>
      <Endpoint method="GET" path="/users/@me/channels">List DM channels the bot is a recipient of.</Endpoint>
      <Endpoint method="POST" path="/users/@me/channels">Create or fetch a DM channel with a recipient.</Endpoint>
      <Endpoint method="DELETE" path="/users/@me/guilds/{guild.id}">Leave a guild (bot leaves the server).</Endpoint>

      <H2 id="guild-endpoints">Guild Endpoints</H2>
      <Endpoint method="GET" path="/guilds/{guild.id}">Get a guild by ID.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/channels">List all channels in a guild.</Endpoint>
      <Endpoint method="POST" path="/guilds/{guild.id}/channels">Create a channel in a guild.</Endpoint>
      <Endpoint method="PATCH" path="/guilds/{guild.id}/channels/{channel.id}">Update a guild channel.</Endpoint>
      <Endpoint method="DELETE" path="/guilds/{guild.id}/channels/{channel.id}">Delete a guild channel.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/roles">List roles in a guild.</Endpoint>
      <Endpoint method="POST" path="/guilds/{guild.id}/roles">Create a role.</Endpoint>
      <Endpoint method="PATCH" path="/guilds/{guild.id}/roles/{role.id}">Update a role.</Endpoint>
      <Endpoint method="DELETE" path="/guilds/{guild.id}/roles/{role.id}">Delete a role.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/members/{user.id}">Get a guild member.</Endpoint>
      <Endpoint method="PATCH" path="/guilds/{guild.id}/members/{user.id}">Update a member (nick, roles, mute, deaf, timeout).</Endpoint>
      <Endpoint method="PATCH" path="/guilds/{guild.id}/members/@me/nick">Update the bot's own nickname.</Endpoint>
      <Endpoint method="DELETE" path="/guilds/{guild.id}/members/{user.id}">Kick a member.</Endpoint>
      <Endpoint method="PUT" path="/guilds/{guild.id}/bans/{user.id}">Ban a user (with optional reason).</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/bans/{user.id}">Get a ban.</Endpoint>
      <Endpoint method="DELETE" path="/guilds/{guild.id}/bans/{user.id}">Unban a user.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/emojis/{emoji.id}">Get a guild emoji.</Endpoint>
      <Endpoint method="POST" path="/guilds/{guild.id}/emojis">Create a guild emoji.</Endpoint>
      <Endpoint method="PATCH" path="/guilds/{guild.id}/emojis/{emoji.id}">Update a guild emoji.</Endpoint>
      <Endpoint method="DELETE" path="/guilds/{guild.id}/emojis/{emoji.id}">Delete a guild emoji.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/stickers">List guild stickers.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/stickers/{sticker.id}">Get a guild sticker.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/webhooks">List webhooks in a guild.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/audit-logs">Get audit log entries (supports limit, user_id, action_type filters).</Endpoint>

      <H2 id="channel-endpoints">Channel Endpoints</H2>
      <Endpoint method="GET" path="/channels/{channel.id}">Get a channel by ID.</Endpoint>
      <Endpoint method="GET" path="/channels/{channel.id}/messages">List messages (supports limit, before, after, around).</Endpoint>
      <Endpoint method="GET" path="/channels/{channel.id}/messages/{message.id}">Get a single message.</Endpoint>
      <Endpoint method="POST" path="/channels/{channel.id}/messages">Create a message (content, embeds, reply_to_message_id, allowed_mentions).</Endpoint>
      <Endpoint method="PATCH" path="/channels/{channel.id}/messages/{message.id}">Edit a message (only if authored by the bot).</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}">Delete a message.</Endpoint>
      <Endpoint method="POST" path="/channels/{channel.id}/messages/bulk-delete">Bulk delete 2-100 messages (max 14 days old).</Endpoint>
      <Endpoint method="PUT" path="/channels/{channel.id}/pins/{message.id}">Pin a message.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/pins/{message.id}">Unpin a message.</Endpoint>
      <Endpoint method="GET" path="/channels/{channel.id}/pins">List pinned messages.</Endpoint>
      <Endpoint method="POST" path="/channels/{channel.id}/typing">Trigger typing indicator.</Endpoint>
      <Endpoint method="PUT" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me">Add a reaction.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me">Remove own reaction.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/{user.id}">Remove another user's reaction.</Endpoint>
      <Endpoint method="GET" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}">Get users who reacted.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}/reactions/{emoji}">Remove all reactions for an emoji.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}/reactions">Remove all reactions.</Endpoint>
      <Endpoint method="POST" path="/channels/{channel.id}/webhooks">Create a webhook.</Endpoint>
      <Endpoint method="GET" path="/channels/{channel.id}/webhooks">List webhooks in a channel.</Endpoint>

      <H2 id="webhook-endpoints">Webhook Endpoints</H2>
      <Endpoint method="GET" path="/webhooks/{webhook.id}">Get a webhook.</Endpoint>
      <Endpoint method="DELETE" path="/webhooks/{webhook.id}">Delete a webhook.</Endpoint>

      <H2 id="application-command-endpoints">Application Command Endpoints</H2>
      <Endpoint method="GET" path="/applications/{app.id}/commands">List global commands.</Endpoint>
      <Endpoint method="PUT" path="/applications/{app.id}/commands">Bulk overwrite global commands.</Endpoint>
      <Endpoint method="POST" path="/applications/{app.id}/commands">Create a single global command.</Endpoint>
      <Endpoint method="GET" path="/applications/{app.id}/commands/{command.id}">Get a global command.</Endpoint>
      <Endpoint method="PATCH" path="/applications/{app.id}/commands/{command.id}">Update a global command.</Endpoint>
      <Endpoint method="DELETE" path="/applications/{app.id}/commands/{command.id}">Delete a global command.</Endpoint>
      <Endpoint method="GET" path="/applications/{app.id}/guilds/{guild.id}/commands">List guild commands.</Endpoint>
      <Endpoint method="PUT" path="/applications/{app.id}/guilds/{guild.id}/commands">Bulk overwrite guild commands.</Endpoint>

      <H2 id="interaction-endpoints">Interaction Endpoints</H2>
      <Endpoint method="POST" path="/interactions/{interaction.id}/{interaction.token}/callback">Respond to an interaction.</Endpoint>

      <H2 id="voice-endpoints">Voice Endpoints</H2>
      <Endpoint method="GET" path="/voice/regions">List available voice regions.</Endpoint>

      <H2 id="snowflakes">Snowflake IDs</H2>
      <P>
        All SerikaCord IDs are <Strong>Snowflakes</Strong> — 64-bit integers encoded as strings. They
        encode a timestamp, worker ID, process ID, and increment.
      </P>
      <CodeBlock lang="text">{`Bit layout (64 bits):
[63: 42] Timestamp (ms since epoch)
[41: 17] Worker ID (5 bits) + Process ID (5 bits) + Internal (10 bits)
[16:  0] Increment (12 bits)`}</CodeBlock>

      <H2 id="iso8601">ISO 8601 Timestamps</H2>
      <P>
        All timestamps in the API are ISO 8601 strings (e.g.,{" "}
        <InlineCode>2026-07-05T14:30:00.000Z</InlineCode>).
      </P>

      <H2 id="discord-compat">Discord Compatibility</H2>
      <Callout type="info" title="Discord API Compatibility">
        SerikaCord implements the Discord v10 bot API. Existing <InlineCode>discord.js</InlineCode> /{" "}
        <InlineCode>discord.py</InlineCode> bots run with a one-line base-URL change. Response shapes
        for users, channels, messages, guilds, roles, members, and invites are formatted to match
        Discord&apos;s JSON structure exactly.
      </Callout>
      <P>
        The following Discord features are <Strong>implemented</Strong> in the SerikaCord bot API:
      </P>
      <UL>
        <li>Bot authentication via token</li>
        <li>User lookup (<InlineCode>/users/@me</InlineCode>, <InlineCode>/users/:id</InlineCode>)</li>
        <li>Guild retrieval and management</li>
        <li>Channel CRUD (create, read, update, delete)</li>
        <li>Message send, edit, delete, bulk-delete, pin/unpin</li>
        <li>Reactions (add, remove, list, clear)</li>
        <li>Typing indicator</li>
        <li>Guild roles CRUD</li>
        <li>Guild member management (nick, roles, mute, deaf, timeout, kick)</li>
        <li>Guild bans (add, remove, get)</li>
        <li>Guild emojis CRUD</li>
        <li>Guild stickers (read)</li>
        <li>Guild webhooks (list, create)</li>
        <li>Channel webhooks (list, create, get, delete)</li>
        <li>Audit log retrieval</li>
        <li>DM channels (list, create)</li>
        <li>Leave guild</li>
        <li>Application commands (global + guild, CRUD + bulk overwrite)</li>
        <li>Interaction callback</li>
        <li>Voice regions</li>
        <li>Gateway WebSocket (HELLO, IDENTIFY, HEARTBEAT, RESUME, DISPATCH)</li>
        <li>Gateway dispatch routing (MESSAGE_CREATE, GUILD_MEMBER_ADD, GUILD_CREATE, etc.)</li>
        <li>Intent-based filtering</li>
        <li>Redis-based cross-instance event fan-out</li>
      </UL>
    </DocPage>
  );
}
