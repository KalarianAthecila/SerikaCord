import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Message",
  description: "SerikaCord Message resource: object structure, message types, flags, endpoints for CRUD, bulk delete, and message limits.",
  path: "/developers/docs/resources/message",
  keywords: ["SerikaCord message", "message object", "message types", "message flags", "bulk delete"],
});

export default function MessageDoc() {
  return (
    <DocPage title="Message" description="Send, edit, and manage messages across channels.">
      <H2 id="message-object">Message Object</H2>
      <CodeBlock lang="json">{`{
  "id": "1234567890",
  "channel_id": "1234567890",
  "author": { "id": "123", "username": "user", "bot": false },
  "content": "Hello world!",
  "timestamp": "2026-07-05T14:30:00.000Z",
  "edited_timestamp": null,
  "tts": false,
  "mention_everyone": false,
  "mentions": [],
  "mention_roles": [],
  "attachments": [],
  "embeds": [],
  "reactions": [],
  "pinned": false,
  "type": 0,
  "flags": 0
}`}</CodeBlock>

      <H2 id="message-types">Message Types</H2>
      <Table headers={["Type", "Value"]} rows={[
        ["Default", "0"],
        ["Recipient Add", "1"],
        ["Recipient Remove", "2"],
        ["Call", "3"],
        ["Channel Name Change", "4"],
        ["Channel Icon Change", "5"],
        ["Channel Pinned Message", "6"],
        ["User Join", "7"],
        ["Guild Boost", "8"],
        ["Guild Boost Tier 1", "9"],
        ["Guild Boost Tier 2", "10"],
        ["Guild Boost Tier 3", "11"],
        ["Channel Follow Add", "12"],
        ["Guild Discovery Disqualified", "14"],
        ["Reply", "19"],
        ["Application Command", "20"],
        ["Thread Starter Message", "21"],
        ["Guild Invite Reminder", "22"],
        ["ContextMenu Command", "23"],
        ["Auto Moderation Action", "24"],
      ]} />

      <H2 id="message-flags">Message Flags</H2>
      <Table headers={["Flag", "Value", "Description"]} rows={[
        ["Crossposted", "1 << 0", "Published to followed channels"],
        ["Is Crosspost", "1 << 1", "Received from another channel"],
        ["Suppress Embeds", "1 << 2", "Embeds hidden"],
        ["Source Message Deleted", "1 << 3"],
        ["Urgent", "1 << 4"],
        ["Has Thread", "1 << 5", "Message has a thread"],
        ["Ephemeral", "1 << 6", "Only visible to author"],
        ["Loading", "1 << 7", "Deferred interaction response"],
        ["Failed to Mention Roles in Thread", "1 << 8"],
        ["Suppress Notifications", "1 << 12", "No push notification"],
        ["Is Voice Message", "1 << 13"],
      ]} />

      <H2 id="endpoints">Endpoints</H2>
      <Endpoint method="POST" path="/channels/{channel.id}/messages">Create a message.</Endpoint>
      <Endpoint method="GET" path="/channels/{channel.id}/messages">List messages (max 100 per request).</Endpoint>
      <Endpoint method="GET" path="/channels/{channel.id}/messages/{message.id}">Get a message.</Endpoint>
      <Endpoint method="PATCH" path="/channels/{channel.id}/messages/{message.id}">Edit a message.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}">Delete a message.</Endpoint>
      <Endpoint method="POST" path="/channels/{channel.id}/messages/bulk-delete">Bulk delete (2-100, within 14 days).</Endpoint>

      <H2 id="creating-messages">Creating Messages</H2>
      <CodeBlock lang="json">{`{
  "content": "Hello!",
  "tts": false,
  "embeds": [],
  "components": [],
  "reply_to_message_id": "1234567890",
  "allowed_mentions": { "parse": ["users"] }
}`}</CodeBlock>

      <Callout type="warning" title="Message Limits">
        Messages have a 2000 character limit for content, 4096 for embed descriptions, and 6000 total
        for embeds. Files up to 25 MB (or 500 MB for boosted servers).
      </Callout>
    </DocPage>
  );
}
