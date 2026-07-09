import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Teams",
  description:
    "SerikaCord developer teams: collaborative application management, team roles, inviting members, transferring apps, and team verification.",
  path: "/developers/docs/topics/teams",
  keywords: ["SerikaCord teams", "developer team", "team roles", "collaborative development"],
});

export default function TeamsDoc() {
  return (
    <DocPage title="Teams" description="Developer teams allow multiple developers to collaboratively manage applications.">
      <H2 id="what-are-teams">What Are Developer Teams?</H2>
      <P>
        Teams let you share ownership and management of applications with other developers. This is
        essential for larger projects with multiple contributors.
      </P>

      <H2 id="creating-teams">Creating a Team</H2>
      <P>
        Create a team from the <Link2 href="/developers/teams">Teams page</Link2> in the Developer
        Portal. You'll become the team owner automatically.
      </P>

      <H2 id="roles">Team Roles</H2>
      <Table headers={["Role", "Permissions"]} rows={[
        ["Owner", "Full control: delete team, transfer ownership, manage all apps and members"],
        ["Admin", "Manage members, manage all applications in the team"],
        ["Developer", "Manage applications in the team (no member management)"],
        ["Viewer", "Read-only access to applications"],
      ]} />

      <H2 id="inviting-members">Inviting Members</H2>
      <P>
        Team owners and admins can invite members by username. The invitee must accept the invitation
        before joining the team.
      </P>

      <H2 id="transferring-apps">Transferring Applications</H2>
      <P>
        Applications can be transferred between personal accounts and teams. Only the app owner or
        team admin can initiate a transfer.
      </P>
      <Callout type="warning" title="Transfer Confirmation">
        Transferring an application to a team is irreversible. Ensure all team members are trusted.
      </Callout>

      <H2 id="verified-bots">Verified Bots and Teams</H2>
      <P>
        Bots in 100+ servers must be verified. If the bot is owned by a team, the team must also be
        verified. See <Link2 href="/developers/docs/topics/bot-verification">Bot Verification</Link2>.
      </P>

      <H2 id="api-endpoints">API Endpoints</H2>
      <Endpoint method="GET" path="/teams">List teams you're a member of.</Endpoint>
      <Endpoint method="POST" path="/teams">Create a new team.</Endpoint>
      <Endpoint method="GET" path="/teams/{team.id}">Get a team.</Endpoint>
      <Endpoint method="PATCH" path="/teams/{team.id}">Update a team.</Endpoint>
      <Endpoint method="DELETE" path="/teams/{team.id}">Delete a team (owner only).</Endpoint>
      <Endpoint method="POST" path="/teams/{team.id}/members">Invite a member.</Endpoint>
      <Endpoint method="DELETE" path="/teams/{team.id}/members/{user.id}">Remove a member.</Endpoint>
    </DocPage>
  );
}
