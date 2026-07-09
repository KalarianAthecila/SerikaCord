import { DocPage, P, H2, UL, CodeBlock, Callout, Strong, InlineCode, Link2, CardGrid, Card } from "../DocPage";
import { Bot, Zap, Cable, KeyRound, Webhook, TerminalSquare, ShieldCheck, Users } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Developer Documentation",
  description:
    "Get started with the SerikaCord API. Build Discord-compatible bots, apps, and integrations. Learn authentication, gateway events, webhooks, and slash commands.",
  path: "/developers/docs/intro",
  keywords: [
    "SerikaCord API docs",
    "bot documentation",
    "Discord-compatible API",
    "gateway",
    "webhooks",
    "OAuth2",
  ],
});

export default function IntroDoc() {
  return (
    <DocPage
      title="SerikaCord Developer Docs"
      description="Build bots, apps, and integrations on SerikaCord — a 1:1-compatible mirror of the Discord API. If you can build a Discord bot, you can build a SerikaCord bot."
    >
      <Callout type="info" title="Discord API Compatibility">
        SerikaCord speaks the same REST routes, gateway opcodes, OAuth2 flows, and data structures as
        Discord. Existing <InlineCode>discord.js</InlineCode> / <InlineCode>discord.py</InlineCode> bots
        run with a one-line base-URL change.
      </Callout>

      <H2 id="start-here">Start here</H2>
      <CardGrid>
        <Card href="/developers/docs/getting-started" title="Getting Started" icon={<Zap className="size-4" />}>
          Create an app, get a token, and ping a channel — end to end in five minutes.
        </Card>
        <Card href="/developers/docs/bots/overview" title="Bots Overview" icon={<Bot className="size-4" />}>
          What a bot is on SerikaCord, how it authenticates, and how it receives events.
        </Card>
        <Card href="/developers/docs/quick-start" title="Quick Start" icon={<TerminalSquare className="size-4" />}>
          Drop-in code for discord.js, discord.py, and raw HTTP.
        </Card>
        <Card href="/developers/docs/reference" title="API Reference" icon={<Cable className="size-4" />}>
          Every REST endpoint, versioned like Discord under <InlineCode>/v10</InlineCode>.
        </Card>
      </CardGrid>

      <H2 id="base-url">Base URL &amp; endpoints</H2>
      <P>Every request goes to the dedicated bot API host. The version lives in the path, just like Discord.</P>
      <CodeBlock lang="bash">{`REST     https://api.serika.chat/api/v10
Gateway  wss://api.serika.chat/api/v10/gateway
OAuth2   https://api.serika.chat/api/oauth2/authorize`}</CodeBlock>

      <H2 id="authentication">Authentication</H2>
      <P>
        Bot requests carry a bot token in the <InlineCode>Authorization</InlineCode> header with the{" "}
        <InlineCode>Bot</InlineCode> prefix. Grab one from the{" "}
        <Link2 href="/developers/applications">Developer Portal</Link2> → your app → <Strong>Bot</Strong>.
      </P>
      <CodeBlock lang="bash">Authorization: Bot YOUR_BOT_TOKEN_HERE</CodeBlock>

      <H2 id="explore">Explore</H2>
      <CardGrid>
        <Card href="/developers/docs/bots/slash-commands" title="Slash Commands" icon={<TerminalSquare className="size-4" />}>
          Register commands users can invoke with <InlineCode>/</InlineCode>.
        </Card>
        <Card href="/developers/docs/bots/interactions" title="Interactions" icon={<KeyRound className="size-4" />}>
          Receive signed command events over HTTP and respond.
        </Card>
        <Card href="/developers/docs/topics/gateway" title="Gateway" icon={<Cable className="size-4" />}>
          Real-time events over WebSocket — messages, members, presence.
        </Card>
        <Card href="/developers/docs/topics/oauth2" title="OAuth2" icon={<Users className="size-4" />}>
          Let users log in with SerikaCord and authorize your app.
        </Card>
        <Card href="/developers/docs/topics/webhooks" title="Webhooks" icon={<Webhook className="size-4" />}>
          Post messages into channels without a bot user.
        </Card>
        <Card href="/developers/docs/topics/permissions" title="Permissions" icon={<ShieldCheck className="size-4" />}>
          The bitwise permission system, identical to Discord.
        </Card>
      </CardGrid>

      <H2 id="support">Support</H2>
      <P>
        Stuck? The <Link2 href="/developers/docs/reference">API Reference</Link2> documents every route,
        and the <Link2 href="/developers/docs/topics/rate-limits">Rate Limits</Link2> page explains
        throttling. Bots that reach 100+ servers should read{" "}
        <Link2 href="/developers/docs/topics/bot-verification">Bot Verification</Link2>.
      </P>

      <H2 id="what-is-serikacord">What is SerikaCord?</H2>
      <P>
        SerikaCord is a self-hosted, Discord-compatible chat platform. It implements the Discord v10 bot
        API — REST routes, Gateway WebSocket protocol, OAuth2 flows, and data structures — so that any
        bot built for Discord can be pointed at SerikaCord by changing two URLs:
      </P>
      <CodeBlock lang="javascript">{`// discord.js — the only two lines that change
client.rest.setBaseURL("https://api.serika.chat/api/v10");
client.options.ws.url = "wss://api.serika.chat/api/v10/gateway";`}</CodeBlock>
      <P>
        The server runs a single-process architecture: a Next.js web app and the bot Gateway share the
        same port. The REST API is served by an <InlineCode>Elysia</InlineCode> router under{" "}
        <InlineCode>/api/v10/*</InlineCode>, and the Gateway WebSocket is upgraded at{" "}
        <InlineCode>/api/v10/gateway</InlineCode>. For horizontal scaling, a standalone Gateway server
        (<InlineCode>scripts/gateway.ts</InlineCode>) can run separately with Redis-based event fan-out.
      </P>

      <H2 id="features">Supported features</H2>
      <P>The SerikaCord bot API implements the following Discord v10 features:</P>
      <UL>
        <li>Bot authentication via token</li>
        <li>User, Guild, Channel, Message, Role, Member CRUD</li>
        <li>Reactions, pins, typing indicators</li>
        <li>Bans, kicks, timeouts, member management</li>
        <li>Guild emojis and stickers (read)</li>
        <li>Webhooks (create, list, get, delete)</li>
        <li>Audit log retrieval</li>
        <li>DM channels (list, create)</li>
        <li>Application commands (global + guild, CRUD + bulk overwrite)</li>
        <li>Interaction callback</li>
        <li>Voice regions</li>
        <li>Gateway WebSocket (HELLO, IDENTIFY, HEARTBEAT, RESUME, DISPATCH)</li>
        <li>Intent-based event filtering and guild-scoped dispatch routing</li>
        <li>Redis-based cross-instance event fan-out for multi-server deployments</li>
      </UL>
    </DocPage>
  );
}
