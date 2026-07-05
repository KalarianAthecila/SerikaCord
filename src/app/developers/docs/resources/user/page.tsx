import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";

export default function UserDoc() {
  return (
    <DocPage title="User" description="Get and manage user information, including the current authenticated user.">
      <H2 id="user-object">User Object</H2>
      <CodeBlock lang="json">{`{
  "id": "1234567890",
  "username": "user",
  "global_name": "Display Name",
  "avatar": "avatar_hash",
  "banner": null,
  "accent_color": null,
  "bot": false,
  "system": false,
  "mfa_enabled": true,
  "verified": true,
  "email": null,
  "flags": 0,
  "premium_type": 0,
  "public_flags": 0
}`}</CodeBlock>

      <H2 id="user-flags">User Flags</H2>
      <Table headers={["Flag", "Value", "Description"]} rows={[
        ["Staff", "1 << 0", "SerikaCord employee"],
        ["Partner", "1 << 1", "Partnered server owner"],
        ["Hypesquad", "1 << 2", "HypeSquad member"],
        ["Bug Hunter", "1 << 3"],
        ["HypeSquad Online House 1", "1 << 6"],
        ["HypeSquad Online House 2", "1 << 7"],
        ["HypeSquad Online House 3", "1 << 8"],
        ["Premium Early Supporter", "1 << 9"],
        ["Team Pseudo User", "1 << 10"],
        ["Bug Hunter Level 2", "1 << 14"],
        ["Verified Bot", "1 << 16"],
        ["Verified Developer", "1 << 17"],
        ["Certified Moderator", "1 << 18"],
        ["Bot HTTP Interactions", "1 << 19"],
        ["Active Developer", "1 << 22"],
      ]} />

      <H2 id="premium-types">Premium Types</H2>
      <Table headers={["Type", "Value"]} rows={[
        ["None", "0"],
        ["Nitro Classic", "1"],
        ["Nitro", "2"],
        ["Nitro Basic", "3"],
      ]} />

      <H2 id="endpoints">Endpoints</H2>
      <Endpoint method="GET" path="/users/@me">Get current user (requires auth).</Endpoint>
      <Endpoint method="GET" path="/users/{user.id}">Get a user by ID.</Endpoint>
      <Endpoint method="PATCH" path="/users/@me">Update current user.</Endpoint>
      <Endpoint method="GET" path="/users/@me/guilds">List guilds the current user is in.</Endpoint>
      <Endpoint method="GET" path="/users/@me/guilds/{guild.id}/member">Get current user's member object in a guild.</Endpoint>
      <Endpoint method="DELETE" path="/users/@me/guilds/{guild.id}">Leave a guild.</Endpoint>
      <Endpoint method="GET" path="/users/@me/channels">List DM channels.</Endpoint>
      <Endpoint method="POST" path="/users/@me/channels">Create a DM or group DM.</Endpoint>
      <Endpoint method="GET" path="/users/@me/connections">List connected accounts (OAuth2).</Endpoint>
      <Endpoint method="GET" path="/users/@me/applications/{application.id}/role-connection">Get role connection.</Endpoint>
      <Endpoint method="PUT" path="/users/@me/applications/{application.id}/role-connection">Update role connection.</Endpoint>

      <Callout type="info" title="Bot Users">
        Bot users have <InlineCode>bot: true</InlineCode> and cannot access all user endpoints. Bots
        cannot use <InlineCode>/users/@me</InlineCode> to get email or premium info.
      </Callout>
    </DocPage>
  );
}
