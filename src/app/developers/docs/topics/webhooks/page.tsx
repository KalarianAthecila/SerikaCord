import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Webhooks",
  description:
    "SerikaCord webhooks: create, execute, edit, and delete webhooks. Send messages without a bot user, manage webhook tokens, and use embeds.",
  path: "/developers/docs/topics/webhooks",
  keywords: ["SerikaCord webhooks", "webhook execute", "channel webhook", "incoming webhook"],
});

export default function WebhooksDoc() {
  return (
    <DocPage title="Webhooks" description="Use webhooks to send messages to channels without a bot user or gateway connection. Full CRUD, execution, and embed support.">
      <H2 id="what-are-webhooks">What Are Webhooks?</H2>
      <P>
        Webhooks are a way to post messages to channels without needing a bot user or gateway
        connection. They&apos;re ideal for CI/CD notifications, monitoring alerts, and integrations
        where a full bot would be overkill.
      </P>
      <P>
        A webhook has two parts: an <Strong>ID</Strong> and a <Strong>token</Strong>. The token is
        embedded in the webhook URL and serves as authentication — no <InlineCode>Authorization</InlineCode>{" "}
        header is needed to execute a webhook.
      </P>

      <H2 id="webhook-object">Webhook Object</H2>
      <CodeBlock lang="json">{`{
  "id": "1234567890",
  "type": 1,
  "guild_id": "1234567890",
  "channel_id": "1234567890",
  "name": "My Webhook",
  "avatar": null,
  "token": "webhook_token_here",
  "application_id": null,
  "url": "https://api.serika.chat/api/webhooks/123/abc"
}`}</CodeBlock>
      <Table headers={["Field", "Type", "Description"]} rows={[
        ["id", "snowflake", "Webhook ID"],
        ["type", "integer", "1 = Incoming, 2 = Channel Follower, 3 = Application"],
        ["guild_id", "snowflake", "Guild ID the webhook is in (null for some types)"],
        ["channel_id", "snowflake", "Channel ID the webhook sends to"],
        ["name", "string", "Default username for messages"],
        ["avatar", "string?", "Default avatar hash"],
        ["token", "string", "Webhook token (only returned on creation)"],
        ["application_id", "snowflake?", "Application that created the webhook (for type 3)"],
        ["url", "string", "Full webhook URL (only returned on creation)"],
      ]} />

      <H2 id="webhook-types">Webhook Types</H2>
      <Table headers={["Type", "Value", "Description"]} rows={[
        ["Incoming", "1", "Can send messages to a channel via POST"],
        ["Channel Follower", "2", "Follows announcements from another channel"],
        ["Application", "3", "Used by applications for interaction follow-ups"],
      ]} />

      <H2 id="channel-webhooks">Channel Webhooks</H2>

      <H3 id="create">Create a Webhook</H3>
      <Endpoint method="POST" path="/channels/{channel.id}/webhooks">
        Requires <InlineCode>MANAGE_WEBHOOKS</InlineCode> permission.
      </Endpoint>
      <CodeBlock lang="json">{`{
  "name": "My Webhook",
  "avatar": "data:image/png;base64,..."
}`}</CodeBlock>
      <Table headers={["Parameter", "Required", "Description"]} rows={[
        ["name", "Yes", "1-80 character name for the webhook"],
        ["avatar", "No", "Base64 data URI for the webhook avatar"],
      ]} />

      <H3 id="execute">Execute a Webhook</H3>
      <Endpoint method="POST" path="/webhooks/{webhook.id}/{webhook.token}">
        Send a message via webhook. No authentication header needed — the URL contains the token.
      </Endpoint>
      <CodeBlock lang="json">{`{
  "content": "Hello from a webhook!",
  "username": "Custom Name",
  "avatar_url": "https://example.com/avatar.png",
  "embeds": [{
    "title": "Embed Title",
    "description": "Embed description",
    "color": 0x8B5CF6,
    "fields": [
      { "name": "Field 1", "value": "Value 1", "inline": true }
    ],
    "footer": { "text": "Footer text" },
    "timestamp": "2025-01-01T00:00:00.000Z"
  }]
}`}</CodeBlock>
      <Table headers={["Parameter", "Required", "Description"]} rows={[
        ["content", "One of content/embeds", "Message text (max 2000 chars)"],
        ["embeds", "One of content/embeds", "Array of embed objects (max 10)"],
        ["username", "No", "Override the webhook's default username"],
        ["avatar_url", "No", "Override the webhook's default avatar"],
        ["tts", "No", "If true, message is sent as text-to-speech"],
        ["allowed_mentions", "No", "Control which mentions are parsed"],
        ["components", "No", "Message components (buttons, select menus)"],
        ["files", "No", "Attachments (multipart/form-data)"],
      ]} />
      <P>Optional query parameters:</P>
      <Table headers={["Parameter", "Description"]} rows={[
        ["wait", "If true, waits and returns the message object (default: false)"],
        ["thread_id", "Send to a specific thread in the channel"],
        ["with_components", "Include components in the response"],
      ]} />
      <CodeBlock lang="bash">{`# Execute a webhook and wait for the message object
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"content":"Hello!"}' \\
  "https://api.serika.chat/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN?wait=true"`}</CodeBlock>

      <H3 id="edit-message">Edit a Webhook Message</H3>
      <Endpoint method="PATCH" path="/webhooks/{webhook.id}/{webhook.token}/messages/{message.id}">
        Edit a message sent by the webhook. Use <InlineCode>@original</InlineCode> as the message ID to edit the first message.
      </Endpoint>

      <H3 id="delete-message">Delete a Webhook Message</H3>
      <Endpoint method="DELETE" path="/webhooks/{webhook.id}/{webhook.token}/messages/{message.id}">
        Delete a message sent by the webhook. Use <InlineCode>@original</InlineCode> to delete the first message.
      </Endpoint>

      <H2 id="managing-webhooks">Managing Webhooks</H2>
      <Endpoint method="GET" path="/channels/{channel.id}/webhooks">List webhooks in a channel (requires MANAGE_WEBHOOKS).</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/webhooks">List webhooks in a guild (requires MANAGE_WEBHOOKS).</Endpoint>
      <Endpoint method="GET" path="/webhooks/{webhook.id}">Get a webhook by ID (requires token for avatar).</Endpoint>
      <Endpoint method="PATCH" path="/webhooks/{webhook.id}">Update a webhook (name, avatar, channel_id).</Endpoint>
      <Endpoint method="PATCH" path="/webhooks/{webhook.id}/{webhook.token}">Update a webhook using its token (no auth header needed).</Endpoint>
      <Endpoint method="DELETE" path="/webhooks/{webhook.id}">Delete a webhook (requires MANAGE_WEBHOOKS).</Endpoint>
      <Endpoint method="DELETE" path="/webhooks/{webhook.id}/{webhook.token}">Delete a webhook using its token (no auth header needed).</Endpoint>

      <H2 id="embeds">Embeds</H2>
      <P>
        Webhooks can include rich embeds. Each embed can have a title, description, color, fields,
        footer, image, thumbnail, and timestamp:
      </P>
      <CodeBlock lang="json">{`{
  "title": "Build Status",
  "description": "The build completed successfully.",
  "url": "https://ci.example.com/build/42",
  "color": 0x00FF00,
  "fields": [
    { "name": "Duration", "value": "2m 34s", "inline": true },
    { "name": "Commit", "value": "abc1234", "inline": true }
  ],
  "thumbnail": { "url": "https://example.com/thumb.png" },
  "image": { "url": "https://example.com/screenshot.png" },
  "footer": { "text": "CI Bot", "icon_url": "https://example.com/icon.png" },
  "timestamp": "2025-01-01T12:00:00.000Z"
}`}</CodeBlock>

      <Callout type="warning" title="Webhook Token Security">
        The webhook token is the only authentication needed to send messages. Keep it secret — anyone
        with the URL can post messages. If a token is compromised, delete and recreate the webhook.
      </Callout>

      <Callout type="info" title="Webhooks vs Bots">
        Webhooks are <Strong>outbound only</Strong> — they can send messages but cannot read messages,
        join voice, or receive gateway events. If you need to read or react to messages, use a bot
        instead. You can combine both: a bot for reading events and a webhook for posting to channels
        the bot doesn&apos;t have access to.
      </Callout>
    </DocPage>
  );
}
