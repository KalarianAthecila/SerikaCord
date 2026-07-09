import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, CardGrid, Card, Table } from "../../DocPage";
import { Zap, TerminalSquare, Cable, KeyRound } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Bots Overview",
  description:
    "Learn how SerikaCord bots work: applications, bot users, tokens, intents, public keys, and the gateway. A Discord-compatible bot guide for SerikaCord developers.",
  path: "/developers/docs/bots/overview",
  keywords: [
    "SerikaCord bots",
    "bot user",
    "bot token",
    "gateway intents",
    "Discord bot compatibility",
  ],
});

export default function BotsOverviewDoc() {
  return (
    <DocPage
      title="Bots Overview"
      description="A bot is an automated user backed by an application. It authenticates with a bot token, calls the REST API, and receives real-time events over the gateway."
    >
      <P>
        On SerikaCord, every bot is powered by an <Strong>application</Strong> you create in the{" "}
        <Link2 href="/developers/applications">Developer Portal</Link2>. Enabling a bot on that
        application provisions a dedicated bot <Strong>user</Strong>, a secret <Strong>token</Strong>,
        and an <Strong>Ed25519 keypair</Strong> used to verify interaction requests.
      </P>

      <Callout type="info" title="Same mental model as Discord">
        Application → Bot user → Token → Gateway + REST. If you&apos;ve internalised how Discord bots work,
        nothing here is new — only the host name changes to{" "}
        <InlineCode>api.serika.chat</InlineCode>.
      </Callout>

      <H2 id="anatomy">Anatomy of a bot</H2>
      <Table headers={["Component", "Description", "Where to find it"]} rows={[
        ["Application", "The top-level container. Holds name, icon, description, OAuth2 config, and slash commands.", "Developer Portal → your app"],
        ["Bot User", "A real user account with bot: true. Appears in member lists and authors messages.", "Created when you enable the bot on the Bot tab"],
        ["Bot Token", "Secret string for API authentication. Passed as Authorization: Bot <token>.", "Bot tab → Reset Token"],
        ["Public Key", "Ed25519 key used to verify signed interaction webhooks.", "Bot tab → Public Key"],
        ["Intents", "Bitwise flags that control which Gateway events the bot receives.", "Bot tab → Privileged Gateway Intents + code"],
      ]} />

      <H2 id="two-ways">Two ways a bot receives events</H2>
      <CardGrid>
        <Card href="/developers/docs/topics/gateway" title="Gateway (WebSocket)" icon={<Cable className="size-4" />}>
          A persistent connection that streams events like <InlineCode>MESSAGE_CREATE</InlineCode> and{" "}
          <InlineCode>GUILD_MEMBER_ADD</InlineCode> as they happen. This is how libraries like discord.js run.
        </Card>
        <Card href="/developers/docs/bots/interactions" title="Interactions (HTTP)" icon={<KeyRound className="size-4" />}>
          A signed HTTP POST we send to your Interactions Endpoint URL whenever a user invokes a command.
          No persistent connection required.
        </Card>
      </CardGrid>
      <P>
        You can use both simultaneously — many bots use the Gateway for message events and HTTP for
        slash command interactions.
      </P>

      <H2 id="authentication">Authentication</H2>
      <P>Every REST call includes your bot token:</P>
      <CodeBlock lang="bash">{`curl -H "Authorization: Bot YOUR_TOKEN" \\
  https://api.serika.chat/api/v10/users/@me`}</CodeBlock>
      <P>
        The token can be prefixed with <InlineCode>Bot </InlineCode> or sent bare — both are accepted.
        Internally, SerikaCord looks up the <InlineCode>Application</InlineCode> by{" "}
        <InlineCode>botToken</InlineCode>, then resolves the associated bot <InlineCode>User</InlineCode>.
      </P>
      <P>For the Gateway, the token goes in the <InlineCode>IDENTIFY</InlineCode> payload:</P>
      <CodeBlock lang="json">{`{
  "op": 2,
  "d": {
    "token": "Bot YOUR_TOKEN",
    "intents": 513
  }
}`}</CodeBlock>
      <Callout type="danger" title="Treat your token like a password">
        Anyone with your token controls your bot. Never commit it. If it leaks, reset it from the{" "}
        <Strong>Bot</Strong> tab — the old token stops working immediately.
      </Callout>

      <H2 id="intents">Gateway intents</H2>
      <P>
        Intents let you subscribe to only the events you need. Pass them in the gateway{" "}
        <InlineCode>IDENTIFY</InlineCode> payload. Privileged intents (Message Content, Server Members,
        Presence) are toggled per-application on the <Strong>Bot</Strong> tab.
      </P>
      <H3 id="common-intents">Common intents</H3>
      <CodeBlock lang="javascript">{`const Intents = {
  GUILDS:            1 << 0,
  GUILD_MEMBERS:     1 << 1,   // privileged
  GUILD_MODERATION:  1 << 2,
  GUILD_MESSAGES:    1 << 9,
  DIRECT_MESSAGES:   1 << 12,
  MESSAGE_CONTENT:   1 << 15,  // privileged
};

// Guilds + guild messages + message content
const intents = Intents.GUILDS | Intents.GUILD_MESSAGES | Intents.MESSAGE_CONTENT;`}</CodeBlock>
      <Callout type="warning" title="Privileged intents require verification">
        Bots in 100+ servers must be{" "}
        <Link2 href="/developers/docs/topics/bot-verification">verified</Link2> to use privileged
        intents. Enable them in the Developer Portal and justify why your bot needs them.
      </Callout>

      <H2 id="permissions">Permissions</H2>
      <P>
        What a bot can do inside a server is governed by the same bitwise permission system as Discord.
        You request a permission integer at install time; server admins can adjust roles afterward. See{" "}
        <Link2 href="/developers/docs/topics/permissions">Permissions</Link2>.
      </P>

      <H2 id="rate-limits">Rate Limits</H2>
      <P>
        The API enforces per-route, per-bot rate limits. Responses include rate limit headers:
      </P>
      <Table headers={["Header", "Description"]} rows={[
        ["X-RateLimit-Limit", "Maximum requests per bucket"],
        ["X-RateLimit-Remaining", "Remaining requests in current window"],
        ["X-RateLimit-Reset", "Unix timestamp when the bucket resets"],
        ["X-RateLimit-Reset-After", "Seconds until reset"],
        ["X-RateLimit-Bucket", "Bucket identifier"],
      ]} />
      <P>
        When rate limited, the API returns <InlineCode>429 Too Many Requests</InlineCode> with a{" "}
        <InlineCode>retry_after</InlineCode> field. See{" "}
        <Link2 href="/developers/docs/topics/rate-limits">Rate Limits</Link2> for details.
      </P>

      <H2 id="bot-vs-user">Bot Users vs Regular Users</H2>
      <Table headers={["Property", "Regular User", "Bot User"]} rows={[
        ["bot field", "false", "true"],
        ["discriminator", "varies", "0"],
        ["verified", "varies", "true"],
        ["Can join servers", "Yes (up to 100/200)", "Yes (via OAuth2 invite)"],
        ["Can use OAuth2 user endpoints", "Yes", "Limited (users/@me, users/@me/channels)"],
        ["Can be DM'd", "Yes", "Yes (if DM channel exists)"],
        ["Rate limits", "Per-user", "Per-bot (typically higher)"],
      ]} />

      <H2 id="next">Next steps</H2>
      <CardGrid>
        <Card href="/developers/docs/getting-started" title="Getting Started" icon={<Zap className="size-4" />}>
          Build and run your first bot step by step.
        </Card>
        <Card href="/developers/docs/bots/slash-commands" title="Slash Commands" icon={<TerminalSquare className="size-4" />}>
          Register and handle <InlineCode>/</InlineCode> commands.
        </Card>
      </CardGrid>
    </DocPage>
  );
}
