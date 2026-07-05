import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";

export default function InviteDoc() {
  return (
    <DocPage title="Invite" description="Create, manage, and accept invites to join guilds.">
      <H2 id="invite-object">Invite Object</H2>
      <CodeBlock lang="json">{`{
  "code": "abc123",
  "guild": { "id": "123", "name": "My Server", ... },
  "channel": { "id": "123", "name": "general", ... },
  "inviter": { "id": "123", "username": "host" },
  "approximate_member_count": 42,
  "approximate_presence_count": 10,
  "expires_at": "2026-07-12T20:00:00.000Z",
  "uses": 5,
  "max_uses": 0,
  "max_age": 604800,
  "temporary": false,
  "created_at": "2026-07-05T20:00:00.000Z"
}`}</CodeBlock>

      <H2 id="endpoints">Endpoints</H2>
      <Endpoint method="POST" path="/channels/{channel.id}/invites">Create an invite.</Endpoint>
      <Endpoint method="GET" path="/invites/{invite.code}">Get an invite (with optional <InlineCode>with_count</InlineCode> and <InlineCode>with_expiration</InlineCode> params).</Endpoint>
      <Endpoint method="DELETE" path="/invites/{invite.code}">Revoke an invite.</Endpoint>
      <Endpoint method="GET" path="/channels/{channel.id}/invites">List channel invites.</Endpoint>
      <Endpoint method="GET" path="/guilds/{guild.id}/invites">List guild invites.</Endpoint>

      <H2 id="create-params">Create Parameters</H2>
      <Table headers={["Param", "Default", "Description"]} rows={[
        ["max_age", "86400", "Seconds before expiry (0 = never)"],
        ["max_uses", "0", "Max uses (0 = unlimited)"],
        ["temporary", "false", "Grant temporary membership"],
        ["unique", "false", "Don't reuse similar invite code"],
        ["target_type", "null", "Target type for embedded apps"],
        ["target_user_id", "null", "Target user for stream target"],
        ["target_application_id", "null", "Target embedded application"],
      ]} />

      <Callout type="info" title="Invite Limits">
        Guilds can have up to 1000 active invites. Temporary members are kicked after 24 hours unless
        assigned a role.
      </Callout>
    </DocPage>
  );
}
