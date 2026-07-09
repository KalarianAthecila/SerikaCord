import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Steps, Step, Table } from "../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Getting Started with the SerikaCord API",
  description:
    "Create your first SerikaCord bot in minutes. Set up an application, enable a bot user, get your token, and send your first message with discord.js or any Discord-compatible library.",
  path: "/developers/docs/getting-started",
  keywords: [
    "SerikaCord bot tutorial",
    "create bot",
    "bot token",
    "discord.js SerikaCord",
    "API getting started",
  ],
});

export default function GettingStartedDoc() {
  return (
    <DocPage
      title="Getting Started"
      description="From zero to a running bot that replies in a channel. This walkthrough uses discord.js, but any Discord-compatible library works the same way."
    >
      <Callout type="info" title="What you'll need">
        A SerikaCord account, Node.js 18+ (or Python 3.9+), and about five minutes. No prior Discord bot experience is required, but if you have built a Discord bot before, the process is identical — only the base URL changes.
      </Callout>

      <H2 id="overview">How SerikaCord bots work</H2>
      <P>
        A SerikaCord bot is an <Strong>application</Strong> with a <Strong>bot user</Strong> attached to it.
        The application holds metadata (name, icon, OAuth2 config, slash commands); the bot user is the
        account that appears in member lists and authors messages. The bot authenticates over two
        channels:
      </P>
      <UL>
        <li><Strong>REST API</Strong> — HTTP requests to <InlineCode>https://api.serika.chat/api/v10</InlineCode> for creating messages, managing channels, fetching guild data, etc.</li>
        <li><Strong>Gateway</Strong> — a persistent WebSocket connection to <InlineCode>wss://api.serika.chat/api/v10/gateway</InlineCode> that streams real-time events like <InlineCode>MESSAGE_CREATE</InlineCode> and <InlineCode>GUILD_MEMBER_ADD</InlineCode>.</li>
      </UL>
      <P>
        Both channels use the same <Strong>bot token</Strong> for authentication, passed in the{" "}
        <InlineCode>Authorization: Bot &lt;token&gt;</InlineCode> header for REST and in the{" "}
        <InlineCode>IDENTIFY</InlineCode> payload for the Gateway.
      </P>

      <H2 id="walkthrough">Step-by-step walkthrough</H2>
      <Steps>
        <Step n={1} title="Create an application">
          <P>
            Open the <Link2 href="/developers/applications">Developer Portal</Link2> and click{" "}
            <Strong>Create</Strong>. Name your app and confirm. This is your bot&apos;s top-level identity —
            the name and icon here are what users see when they install your bot.
          </P>
          <P>
            You&apos;ll be taken to the <Strong>General Information</Strong> page. Note the{" "}
            <Strong>Application ID</Strong> (a snowflake) — you&apos;ll need it for OAuth2 URLs and slash
            command registration.
          </P>
        </Step>

        <Step n={2} title="Enable the bot & copy the token">
          <P>
            Go to the <Strong>Bot</Strong> tab and click <Strong>Enable Bot</Strong>. This provisions:
          </P>
          <UL>
            <li>A <Strong>bot user</Strong> — a real user account with <InlineCode>bot: true</InlineCode> that can join servers and send messages.</li>
            <li>A <Strong>bot token</Strong> — a secret string used for authentication. Copy it now; you can always reset it later.</li>
            <li>An <Strong>Ed25519 public key</Strong> — used to verify signed interaction webhooks (see <Link2 href="/developers/docs/bots/interactions">Interactions</Link2>).</li>
          </UL>
          <Callout type="danger" title="Treat the token like a password">
            Anyone with your token has full control of your bot. Never commit it to version control, never
            hard-code it in client-side code, and never share it in screenshots. If it leaks, reset it from
            the Bot tab — the old token stops working immediately.
          </Callout>
        </Step>

        <Step n={3} title="Turn on the intents you need">
          <P>
            Still on the <Strong>Bot</Strong> tab, scroll to <Strong>Privileged Gateway Intents</Strong>:
          </P>
          <Table headers={["Intent", "Flag", "When you need it"]} rows={[
            ["Presence", "1 << 8", "You want to track online/offline status of members"],
            ["Server Members", "1 << 1", "You need the full member list or member join/leave events"],
            ["Message Content", "1 << 15", "You read the text of messages (not just commands/interactions)"],
          ]} />
          <P>
            Enable <Strong>Message Content Intent</Strong> if your bot reads message text (e.g. prefix
            commands like <InlineCode>!ping</InlineCode>). Then request the same intents in your code&apos;s{" "}
            <InlineCode>IDENTIFY</InlineCode> payload — enabling them in the portal is necessary but not
            sufficient; your code must also declare them.
          </P>
          <Callout type="warning" title="Privileged intents and verification">
            Bots in 100+ servers must be <Link2 href="/developers/docs/topics/bot-verification">verified</Link2> to
            use privileged intents. You&apos;ll need to justify why your bot needs each one.
          </Callout>
        </Step>

        <Step n={4} title="Invite the bot to a server">
          <P>
            On the <Strong>Installation</Strong> tab (or <Strong>OAuth2 → URL Generator</Strong>), pick the{" "}
            <InlineCode>bot</InlineCode> and <InlineCode>applications.commands</InlineCode> scopes. Choose
            the permissions your bot needs (e.g. <Strong>Administrator</Strong> = permission value{" "}
            <InlineCode>8</InlineCode>, or granular permissions like <Strong>Send Messages</Strong> and{" "}
            <Strong>Read Message History</Strong>). Then open the generated install URL:
          </P>
          <CodeBlock lang="bash">{`https://api.serika.chat/api/oauth2/authorize?client_id=YOUR_APP_ID&scope=bot+applications.commands&permissions=8`}</CodeBlock>
          <P>
            Select the server you want to add the bot to and click <Strong>Authorize</Strong>. The bot
            appears in the member list immediately.
          </P>
          <Callout type="info" title="Permission integer">
            The <InlineCode>permissions</InlineCode> parameter is a bitwise OR of permission flags. For
            example, <InlineCode>Send Messages (2048) + Read Message History (65536) = 67584</InlineCode>.
            Use the <Link2 href="/developers/docs/topics/permissions">Permissions</Link2> page for the full
            flag list.
          </Callout>
        </Step>

        <Step n={5} title="Write the bot">
          <P>
            Point any Discord library at SerikaCord by overriding the REST and gateway URLs. For{" "}
            <InlineCode>discord.js</InlineCode> v14+:
          </P>
          <CodeBlock lang="javascript">{`import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Point discord.js at SerikaCord instead of Discord
client.rest.setBaseURL("https://api.serika.chat/api/v10");
client.options.ws.url = "wss://api.serika.chat/api/v10/gateway";

client.once("ready", () => console.log(\`Logged in as \${client.user.tag}\`));

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  if (msg.content === "!ping") msg.reply("Pong! 🏓");
});

client.login(process.env.BOT_TOKEN);`}</CodeBlock>
          <P>
            The two lines that make it a SerikaCord bot instead of a Discord bot are{" "}
            <InlineCode>client.rest.setBaseURL(...)</InlineCode> and{" "}
            <InlineCode>client.options.ws.url = ...</InlineCode>. Everything else — intents, events, the
            message API — is identical to Discord.
          </P>
        </Step>

        <Step n={6} title="Run it">
          <CodeBlock lang="bash">{`# Store the token in an environment variable
export BOT_TOKEN="your_token_here"
node bot.js`}</CodeBlock>
          <P>
            You should see <InlineCode>Logged in as YourBotName#0</InlineCode>. Type{" "}
            <InlineCode>!ping</InlineCode> in a channel your bot can see. It should reply{" "}
            <InlineCode>Pong! 🏓</InlineCode>.
          </P>
          <Callout type="warning" title="Keep your token out of git">
            Load it from an environment variable or a <InlineCode>.env</InlineCode> file (use{" "}
            <InlineCode>dotenv</InlineCode>), and add <InlineCode>.env</InlineCode> to your{" "}
            <InlineCode>.gitignore</InlineCode>. If a token is ever exposed, reset it immediately from the
            Bot tab.
          </Callout>
        </Step>
      </Steps>

      <H2 id="python">Prefer Python?</H2>
      <P>
        Using <InlineCode>discord.py</InlineCode> with SerikaCord is equally straightforward:
      </P>
      <CodeBlock lang="python">{`import os, discord

# Point discord.py at SerikaCord
discord.http.Route.BASE = "https://api.serika.chat/api/v10"

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f"Logged in as {client.user}")

@client.event
async def on_message(message):
    if message.author.bot:
        return
    if message.content == "!ping":
        await message.reply("Pong! 🏓")

client.run(os.environ["BOT_TOKEN"])`}</CodeBlock>

      <H2 id="raw-http">Raw HTTP / cURL</H2>
      <P>
        No library? No problem. The REST API speaks plain JSON over HTTP. You can send a message with a
        single <InlineCode>curl</InlineCode>:
      </P>
      <CodeBlock lang="bash">{`# Get the bot's user info
curl -H "Authorization: Bot YOUR_TOKEN" \\
  https://api.serika.chat/api/v10/users/@me

# Send a message to a channel
curl -X POST \\
  -H "Authorization: Bot YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"content":"Hello from cURL!"}' \\
  https://api.serika.chat/api/v10/channels/CHANNEL_ID/messages`}</CodeBlock>
      <P>
        For real-time events without a library, connect to the Gateway with any WebSocket client and follow
        the <Link2 href="/developers/docs/topics/gateway">Gateway protocol</Link2>.
      </P>

      <H2 id="architecture">Understanding the architecture</H2>
      <P>
        SerikaCord runs a single-process server that handles both the Next.js web app and the bot Gateway
        on the same port. This means:
      </P>
      <UL>
        <li>The REST API is served at <InlineCode>/api/*</InlineCode> by an <InlineCode>Elysia</InlineCode> router that intercepts all HTTP methods.</li>
        <li>The Gateway WebSocket is upgraded at <InlineCode>/api/v10/gateway</InlineCode> on the same port.</li>
        <li>SSE (Server-Sent Events) streams for the web client are served at <InlineCode>/api/channels/:id/stream</InlineCode> and <InlineCode>/api/dms/:id/stream</InlineCode> — these are internal to the web app and not part of the bot API.</li>
        <li>The bot API is Discord v10-compatible, served under <InlineCode>/api/v10/*</InlineCode>.</li>
      </UL>

      <H2 id="troubleshooting">Troubleshooting</H2>
      <Table headers={["Problem", "Cause", "Solution"]} rows={[
        ["401: Unauthorized", "Invalid or missing token", "Ensure the Authorization header is 'Bot <token>' and the token hasn't been reset"],
        ["4004 Authentication failed", "Gateway identify with bad token", "Double-check the token; reset it from the Bot tab if needed"],
        ["403: Missing Access", "Bot lacks permissions in the channel/guild", "Re-invite with more permissions or have an admin adjust roles"],
        ["10003: Unknown Channel", "Channel ID doesn't exist or bot can't see it", "Ensure the bot is in the server and has access to the channel"],
        ["50006: Cannot send an empty message", "No content, embeds, attachments, or sticker_ids", "Provide at least one of: content, embeds, attachments, sticker_ids"],
        ["Bot doesn't respond to !ping", "Message Content Intent not enabled", "Enable it on the Bot tab AND in your code's intents"],
        ["Gateway disconnects immediately", "Intents mismatch or invalid session", "Check that privileged intents are enabled in the portal"],
      ]} />

      <H2 id="next">Where to go next</H2>
      <UL>
        <li>Add <Link2 href="/developers/docs/bots/slash-commands">slash commands</Link2> for a modern command interface</li>
        <li>Learn the full <Link2 href="/developers/docs/topics/gateway">Gateway protocol</Link2> — opcodes, heartbeats, resuming</li>
        <li>Browse the complete <Link2 href="/developers/docs/reference">API Reference</Link2> for every endpoint</li>
        <li>Understand <Link2 href="/developers/docs/topics/permissions">Permissions</Link2> for fine-grained access control</li>
        <li>Set up <Link2 href="/developers/docs/topics/oauth2">OAuth2</Link2> to let users log in with SerikaCord</li>
        <li>Read the <Link2 href="/developers/docs/quick-start">Quick Start</Link2> for copy-paste examples in multiple languages</li>
      </UL>
    </DocPage>
  );
}
