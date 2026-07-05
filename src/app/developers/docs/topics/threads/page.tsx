import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";

export default function ThreadsDoc() {
  return (
    <DocPage title="Threads" description="Threads are temporary sub-channels within a parent channel for focused conversations.">
      <H2 id="thread-types">Thread Types</H2>
      <Table headers={["Type", "Value", "Description"]} rows={[
        ["Public Thread", "11", "Visible to all members with channel access"],
        ["Private Thread", "12", "Only visible to invited members"],
        ["Announcement Thread", "10", "Threads in announcement channels"],
      ]} />

      <H2 id="creating-threads">Creating Threads</H2>
      <Endpoint method="POST" path="/channels/{channel.id}/threads">
        Create a thread in a channel. Requires <InlineCode>CREATE_PUBLIC_THREADS</InlineCode> or{" "}
        <InlineCode>CREATE_PRIVATE_THREADS</InlineCode> permission.
      </Endpoint>
      <CodeBlock lang="json">{`{
  "name": "Thread Name",
  "type": 11,
  "auto_archive_duration": 1440,
  "rate_limit_per_user": 0
}`}</CodeBlock>

      <H2 id="message-threads">Starting a Thread from a Message</H2>
      <Endpoint method="POST" path="/channels/{channel.id}/messages/{message.id}/threads">
        Create a thread attached to a specific message.
      </Endpoint>

      <H2 id="listing-threads">Listing Active Threads</H2>
      <Endpoint method="GET" path="/guilds/{guild.id}/threads/active">
        List all active threads in a guild.
      </Endpoint>

      <H2 id="joining-leaving">Joining and Leaving</H2>
      <Endpoint method="PUT" path="/channels/{channel.id}/thread-members/@me">Join a thread.</Endpoint>
      <Endpoint method="DELETE" path="/channels/{channel.id}/thread-members/@me">Leave a thread.</Endpoint>

      <H2 id="thread-members">Thread Members</H2>
      <Endpoint method="GET" path="/channels/{channel.id}/thread-members">
        List members of a thread. Requires the <InlineCode>GUILD_MEMBERS</InlineCode> privileged intent.
      </Endpoint>

      <H2 id="auto-archive">Auto-Archive</H2>
      <P>Threads auto-archive after a period of inactivity:</P>
      <Table headers={["Duration", "Value (minutes)"]} rows={[
        ["1 hour", "60"],
        ["24 hours", "1440"],
        ["3 days", "4320"],
        ["1 week", "10080"],
      ]} />

      <H2 id="gateway-events">Gateway Events</H2>
      <UL>
        <li><InlineCode>THREAD_CREATE</InlineCode> — A thread was created</li>
        <li><InlineCode>THREAD_UPDATE</InlineCode> — A thread was updated</li>
        <li><InlineCode>THREAD_DELETE</InlineCode> — A thread was deleted</li>
        <li><InlineCode>THREAD_MEMBER_UPDATE</InlineCode> — Current user's thread member updated</li>
        <li><InlineCode>THREAD_MEMBERS_UPDATE</InlineCode> — Thread members changed</li>
      </UL>

      <Callout type="info" title="Forum Channels">
        Forum channels contain threads as their primary content. Each post in a forum is a thread.
      </Callout>
    </DocPage>
  );
}
