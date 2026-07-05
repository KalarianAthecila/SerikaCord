import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";

export default function GuildScheduledEventDoc() {
  return (
    <DocPage title="Guild Scheduled Event" description="Create and manage scheduled events in guilds.">
      <H2 id="event-object">Scheduled Event Object</H2>
      <CodeBlock lang="json">{`{
  "id": "1234567890",
  "guild_id": "1234567890",
  "name": "Game Night",
  "description": "Weekly game night",
  "scheduled_start_time": "2026-07-10T20:00:00.000Z",
  "scheduled_end_time": "2026-07-10T22:00:00.000Z",
  "privacy_level": 2,
  "status": 1,
  "entity_type": 3,
  "entity_id": null,
  "entity_metadata": { "location": "Online" },
  "creator": { "id": "123", "username": "host" },
  "user_count": 42
}`}</CodeBlock>

      <H2 id="entity-types">Entity Types</H2>
      <Table headers={["Type", "Value", "Description"]} rows={[
        ["Stage Instance", "1", "Stage channel event"],
        ["Voice", "2", "Voice channel event"],
        ["External", "3", "External event (with location)"],
      ]} />

      <H2 id="status">Event Status</H2>
      <Table headers={["Status", "Value"]} rows={[
        ["Scheduled", "1"],
        ["Active", "2"],
        ["Completed", "3"],
        ["Canceled", "4"],
      ]} />

      <H2 id="endpoints">Endpoints</H2>
      <Endpoint method="GET" path="/guilds/{guild.id}/scheduled-events">List scheduled events.</Endpoint>
      <Endpoint method="POST" path="/guilds/{guild.id}/scheduled-events">Create a scheduled event.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/scheduled-events/{event.id}">Get a scheduled event.</Endpoint>
      <Endpoint method="PATCH" path="/guilds/{guild.id}/scheduled-events/{event.id}">Update a scheduled event.</Endpoint>
      <Endpoint method="DELETE" path="/guilds/{guild.id}/scheduled-events/{event.id}">Delete a scheduled event.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/scheduled-events/{event.id}/users">Get event subscribers.</Endpoint>
    </DocPage>
  );
}
