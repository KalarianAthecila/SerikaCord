import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Channel",
  description: "SerikaCord Channel resource: types, object structure, endpoints for messages, pins, typing, permission overwrites, and slow mode.",
  path: "/developers/docs/resources/channel",
  keywords: ["SerikaCord channel", "channel types", "text channel", "voice channel", "permission overwrites"],
});

export default function ChannelDoc() {
  return (
    <DocPage title="Channel" description="Create, manage, and interact with channels — text, voice, categories, and more.">
      <H2 id="channel-types">Channel Types</H2>
      <Table headers={["Type", "Value"]} rows={[
        ["Guild Text", "0"],
        ["DM", "1"],
        ["Guild Voice", "2"],
        ["Group DM", "3"],
        ["Guild Category", "4"],
        ["Guild Announcement", "5"],
        ["Announcement Thread", "10"],
        ["Public Thread", "11"],
        ["Private Thread", "12"],
        ["Guild Stage Voice", "13"],
        ["Guild Directory", "14"],
        ["Guild Forum", "15"],
        ["Guild Media", "16"],
      ]} />

      <H2 id="channel-object">Channel Object</H2>
      <CodeBlock lang="json">{`{
  "id": "1234567890",
  "type": 0,
  "guild_id": "1234567890",
  "name": "general",
  "topic": "General chat",
  "position": 0,
  "nsfw": false,
  "rate_limit_per_user": 0,
  "parent_id": null,
  "permission_overwrites": []
}`}</CodeBlock>

      <H2 id="endpoints">Endpoints</H2>
      <Endpoint method="GET" path="/channels/{channel.id}">Get a channel.</Endpoint>
      <Endpoint method="PATCH" path="/channels/{channel.id}">Update a channel.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}">Delete a channel.</Endpoint>
      <Endpoint method="POST" path="/guilds/{guild.id}/channels">Create a channel in a guild.</Endpoint>
      <Endpoint method="PATCH" path="/guilds/{guild.id}/channels">Reorder channels.</Endpoint>
      <Endpoint method="GET" path="/channels/{channel.id}/messages">List messages.</Endpoint>
      <Endpoint method="POST" path="/channels/{channel.id}/messages">Create a message.</Endpoint>
      <Endpoint method="GET" path="/channels/{channel.id}/messages/{message.id}">Get a message.</Endpoint>
      <Endpoint method="PATCH" path="/channels/{channel.id}/messages/{message.id}">Edit a message.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/messages/{message.id}">Delete a message.</Endpoint>
      <Endpoint method="POST" path="/channels/{channel.id}/messages/bulk-delete">Bulk delete messages (2-100, max 14 days old).</Endpoint>
      <Endpoint method="PUT" path="/channels/{channel.id}/pins/{message.id}">Pin a message.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/pins/{message.id}">Unpin a message.</Endpoint>
      <Endpoint method="GET" path="/channels/{channel.id}/pins">List pinned messages.</Endpoint>
      <Endpoint method="POST" path="/channels/{channel.id}/typing">Trigger typing indicator.</Endpoint>

      <H2 id="permission-overwrites">Permission Overwrites</H2>
      <CodeBlock lang="json">{`{
  "id": "role_or_member_id",
  "type": 0,
  "allow": "1024",
  "deny": "0"
}`}</CodeBlock>

      <Callout type="info" title="Slow Mode">
        <InlineCode>rate_limit_per_user</InlineCode> sets slow mode (0-21600 seconds). Users must wait
        this long between messages.
      </Callout>
    </DocPage>
  );
}
