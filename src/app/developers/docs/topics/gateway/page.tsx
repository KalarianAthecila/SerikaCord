import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Gateway",
  description:
    "SerikaCord Gateway protocol: WebSocket connection, opcodes, heartbeats, identify, resume, intents, dispatch events, and sharding.",
  path: "/developers/docs/topics/gateway",
  keywords: ["SerikaCord gateway", "WebSocket", "opcodes", "heartbeat", "intents", "real-time events"],
});

export default function GatewayDoc() {
  return (
    <DocPage title="Gateway" description="Connect to the SerikaCord Gateway via WebSocket to receive real-time events. Full protocol reference with opcodes, heartbeats, intents, and dispatch routing.">
      <P>
        The Gateway is a persistent WebSocket connection that streams real-time events to your bot.
        It uses the Discord v10 Gateway protocol. The heartbeat interval is{" "}
        <Strong>41,250 ms</Strong> (41.25 seconds).
      </P>

      <H2 id="connecting">Connecting to the Gateway</H2>
      <P>The Gateway URL is:</P>
      <CodeBlock lang="bash">wss://api.serika.chat/api/v10/gateway</CodeBlock>
      <P>You can also retrieve it dynamically via REST:</P>
      <CodeBlock lang="bash">{`GET https://api.serika.chat/api/v10/gateway
# Response: { "url": "wss://api.serika.chat/api/v10/gateway" }`}</CodeBlock>

      <H2 id="connection-flow">Connection Flow</H2>
      <P>After opening the WebSocket, follow this sequence:</P>
      <UL>
        <li><Strong>1.</Strong> Open WebSocket connection to the Gateway URL</li>
        <li><Strong>2.</Strong> Receive <InlineCode>Hello</InlineCode> (op 10) with <InlineCode>heartbeat_interval: 41250</InlineCode></li>
        <li><Strong>3.</Strong> Send <InlineCode>Identify</InlineCode> (op 2) with your bot token and intents</li>
        <li><Strong>4.</Strong> Receive <InlineCode>Ready</InlineCode> dispatch (op 0, event <InlineCode>READY</InlineCode>) with session_id, user, guilds</li>
        <li><Strong>5.</Strong> Send <InlineCode>Heartbeat</InlineCode> (op 1) every 41,250 ms</li>
        <li><Strong>6.</Strong> Receive <InlineCode>Heartbeat ACK</InlineCode> (op 11) after each heartbeat</li>
        <li><Strong>7.</Strong> Receive dispatch events (op 0) as they occur</li>
      </UL>

      <H2 id="opcodes">Opcodes</H2>
      <Table headers={["Opcode", "Name", "Direction", "Description"]} rows={[
        ["0", "Dispatch", "Server→Client", "Dispatches an event (MESSAGE_CREATE, READY, etc.)"],
        ["1", "Heartbeat", "Client→Server", "Maintains connection — send every heartbeat_interval ms"],
        ["2", "Identify", "Client→Server", "Initial authentication with token and intents"],
        ["3", "Presence Update", "Client→Server", "Update the bot's presence (not fully implemented)"],
        ["4", "Voice State Update", "Client→Server", "Join/leave a voice channel"],
        ["5", "Resume", "Client→Server", "Resume a disconnected session to receive missed events"],
        ["6", "Reconnect", "Server→Client", "Server requests you to reconnect (not currently sent)"],
        ["7", "Request Guild Members", "Client→Server", "Request guild member info (not currently implemented)"],
        ["8", "Invalid Session", "Server→Client", "Session invalidated — must re-identify, not resume"],
        ["9", "Hello", "Server→Client", "Sent on connect — contains heartbeat_interval"],
        ["10", "Heartbeat ACK", "Server→Client", "Acknowledges a heartbeat — connection is healthy"],
        ["11", "Request Soundboard Sounds", "Client→Server", "Request soundboard sounds (not implemented)"],
      ]} />
      <Callout type="info" title="Opcode numbering">
        SerikaCord uses the same opcode numbers as Discord v10. The <InlineCode>Hello</InlineCode> opcode
        is <InlineCode>10</InlineCode> and <InlineCode>Heartbeat ACK</InlineCode> is{" "}
        <InlineCode>11</InlineCode>, matching the Discord protocol.
      </Callout>

      <H2 id="frame-format">Frame Format</H2>
      <P>Every Gateway frame is a JSON object with this structure:</P>
      <CodeBlock lang="json">{`{
  "op": 0,       // opcode (integer)
  "d": {},       // payload data (object or null)
  "s": 42,       // sequence number (only for DISPATCH, null otherwise)
  "t": "MESSAGE_CREATE"  // event name (only for DISPATCH, null otherwise)
}`}</CodeBlock>

      <H2 id="hello">Hello (op 10)</H2>
      <P>Sent immediately after the WebSocket connects:</P>
      <CodeBlock lang="json">{`{
  "op": 10,
  "d": {
    "heartbeat_interval": 41250
  }
}`}</CodeBlock>

      <H2 id="identify">Identify (op 2)</H2>
      <P>Authenticate your bot. Send this after receiving Hello:</P>
      <CodeBlock lang="json">{`{
  "op": 2,
  "d": {
    "token": "YOUR_BOT_TOKEN",
    "intents": 513,
    "properties": {
      "os": "linux",
      "browser": "my_bot",
      "device": "my_bot"
    }
  }
}`}</CodeBlock>
      <P>
        The token can be prefixed with <InlineCode>Bot </InlineCode> or sent bare — both are accepted.
        On success, the server sends a <InlineCode>READY</InlineCode> dispatch event. On failure, it
        sends <InlineCode>Invalid Session</InlineCode> (op 8) and closes with code{" "}
        <InlineCode>4004</InlineCode>.
      </P>
      <Callout type="warning" title="Identify is one-time">
        You can only identify once per connection. Sending <InlineCode>IDENTIFY</InlineCode> again on an
        already-authenticated connection is silently ignored.
      </Callout>

      <H2 id="ready">Ready Event</H2>
      <P>After a successful identify, you receive the <InlineCode>READY</InlineCode> dispatch:</P>
      <CodeBlock lang="json">{`{
  "op": 0,
  "t": "READY",
  "s": 1,
  "d": {
    "v": 10,
    "user": {
      "id": "1234567890",
      "username": "MyBot",
      "global_name": "MyBot",
      "avatar": null,
      "bot": true,
      "discriminator": "0",
      "verified": true,
      "flags": 0
    },
    "guilds": [
      { "id": "guild_id", "unavailable": true }
    ],
    "session_id": "unique_session_id",
    "resume_gateway_url": "wss://api.serika.chat/api/v10/gateway",
    "application": {
      "id": "app_id",
      "flags": 0
    }
  }
}`}</CodeBlock>
      <P>
        The <InlineCode>guilds</InlineCode> array contains all guilds the bot is a member of, marked as{" "}
        <InlineCode>unavailable: true</InlineCode>. Guild data is fetched via REST or arrives as{" "}
        <InlineCode>GUILD_CREATE</InlineCode> dispatches.
      </P>

      <H2 id="intents">Gateway Intents</H2>
      <P>Intents are bitwise flags that determine which events your bot receives:</P>
      <Table headers={["Bit", "Intent", "Events"]} rows={[
        ["1 << 0", "GUILDS", "GUILD_CREATE, GUILD_UPDATE, GUILD_DELETE"],
        ["1 << 1", "GUILD_MEMBERS", "GUILD_MEMBER_ADD, UPDATE, REMOVE (privileged)"],
        ["1 << 2", "GUILD_MODERATION", "GUILD_BAN_ADD, GUILD_BAN_REMOVE"],
        ["1 << 3", "GUILD_EMOJIS_AND_STICKERS", "GUILD_EMOJIS_UPDATE, STICKERS_UPDATE"],
        ["1 << 4", "GUILD_INTEGRATIONS", "GUILD_INTEGRATIONS_UPDATE"],
        ["1 << 5", "GUILD_WEBHOOKS", "WEBHOOKS_UPDATE"],
        ["1 << 6", "GUILD_INVITES", "INVITE_CREATE, INVITE_DELETE"],
        ["1 << 7", "GUILD_VOICE_STATES", "VOICE_STATE_UPDATE"],
        ["1 << 8", "GUILD_PRESENCES", "PRESENCE_UPDATE (privileged)"],
        ["1 << 9", "GUILD_MESSAGES", "MESSAGE_CREATE, UPDATE, DELETE"],
        ["1 << 10", "GUILD_MESSAGE_REACTIONS", "MESSAGE_REACTION_ADD, etc."],
        ["1 << 11", "GUILD_MESSAGE_TYPING", "TYPING_START"],
        ["1 << 12", "DIRECT_MESSAGES", "DM message events"],
        ["1 << 13", "DIRECT_MESSAGE_REACTIONS", "DM reaction events"],
        ["1 << 14", "DIRECT_MESSAGE_TYPING", "DM typing events"],
        ["1 << 15", "MESSAGE_CONTENT", "Access message content (privileged)"],
        ["1 << 16", "GUILD_SCHEDULED_EVENTS", "Scheduled event events"],
        ["1 << 17", "AUTO_MODERATION_CONFIGURATION", "Auto mod rule events"],
        ["1 << 18", "AUTO_MODERATION_EXECUTION", "Auto mod action events"],
      ]} />
      <Callout type="warning" title="Privileged Intents">
        <InlineCode>GUILD_PRESENCES</InlineCode>, <InlineCode>GUILD_MEMBERS</InlineCode>, and{" "}
        <InlineCode>MESSAGE_CONTENT</InlineCode> are privileged. They must be enabled in the{" "}
        <Link2 href="/developers/applications">Developer Portal</Link2> and may require{" "}
        <Link2 href="/developers/docs/topics/bot-verification">verification</Link2> for bots in 100+ servers.
      </Callout>

      <H2 id="heartbeat">Heartbeat (op 1)</H2>
      <P>
        Send a heartbeat every <InlineCode>heartbeat_interval</InlineCode> ms (41,250 ms). The payload
        is the last sequence number you received, or <InlineCode>null</InlineCode> if none:
      </P>
      <CodeBlock lang="json">{`{ "op": 1, "d": 42 }`}</CodeBlock>
      <P>The server responds with <InlineCode>Heartbeat ACK</InlineCode> (op 11):</P>
      <CodeBlock lang="json">{`{ "op": 11, "d": null }`}</CodeBlock>
      <Callout type="danger" title="Heartbeat timeout">
        If you don&apos;t send heartbeats, the server will eventually close your connection. Always
        start the heartbeat timer immediately after receiving <InlineCode>Hello</InlineCode>, and
        reset it each time you send a heartbeat.
      </Callout>

      <H2 id="resuming">Resuming Sessions (op 5)</H2>
      <P>If your connection drops, you can resume to receive missed events:</P>
      <CodeBlock lang="json">{`{
  "op": 6,
  "d": {
    "token": "YOUR_BOT_TOKEN",
    "session_id": "SESSION_ID_FROM_READY",
    "seq": 42
  }
}`}</CodeBlock>
      <P>
        On success, the server sends a <InlineCode>RESUMED</InlineCode> dispatch event. The current
        implementation sends an empty payload with the <InlineCode>RESUMED</InlineCode> type and
        increments the sequence number.
      </P>

      <H2 id="dispatch-routing">Dispatch Routing</H2>
      <P>
        When the server dispatches an event, it filters which connections receive it based on:
      </P>
      <UL>
        <li><Strong>Authentication</Strong> — only authenticated connections receive events</li>
        <li><Strong>Target bot ID</Strong> — if the dispatch targets a specific bot, only that bot receives it</li>
        <li><Strong>Intents</Strong> — if the dispatch has an intent flag, only bots with that intent receive it</li>
        <li><Strong>Guild membership</Strong> — guild-scoped events only go to bots in that guild</li>
        <li><Strong>DM channel access</Strong> — DM events only go to bots that are recipients of that channel</li>
        <li><Strong>Self-message suppression</Strong> — <InlineCode>MESSAGE_CREATE</InlineCode> events are not sent to the bot that authored the message</li>
      </UL>
      <P>
        When a bot joins a guild (via <InlineCode>GUILD_MEMBER_ADD</InlineCode> where the user is the
        bot, or <InlineCode>GUILD_CREATE</InlineCode> targeting the bot), the guild ID is dynamically
        added to the connection&apos;s guild set.
      </P>

      <H2 id="close-codes">Close Codes</H2>
      <Table headers={["Code", "Description", "Can Resume?"]} rows={[
        ["4000", "Unknown error", "Yes"],
        ["4001", "Unknown opcode", "Yes"],
        ["4002", "Decode error (invalid JSON)", "Yes"],
        ["4003", "Not authenticated", "Yes"],
        ["4004", "Authentication failed (bad token)", "No"],
        ["4005", "Already authenticated", "Yes"],
        ["4007", "Invalid seq", "Yes"],
        ["4008", "Rate limited", "Yes"],
        ["4009", "Session timed out", "Yes"],
        ["4010", "Invalid shard", "No"],
        ["4011", "Sharding required", "No"],
        ["4012", "Invalid API version", "No"],
        ["4013", "Invalid intent(s)", "No"],
        ["4014", "Disallowed intent(s)", "No"],
      ]} />

      <H2 id="key-events">Key Dispatch Events</H2>
      <Table headers={["Event", "Intent", "Description"]} rows={[
        ["READY", "—", "Initial connection established, provides session_id and user"],
        ["RESUMED", "—", "Session resumed after reconnect"],
        ["MESSAGE_CREATE", "GUILD_MESSAGES (1<<9)", "A message was sent in a guild channel"],
        ["MESSAGE_UPDATE", "GUILD_MESSAGES (1<<9)", "A message was edited"],
        ["MESSAGE_DELETE", "GUILD_MESSAGES (1<<9)", "A message was deleted"],
        ["GUILD_CREATE", "GUILDS (1<<0)", "A guild became available or bot joined"],
        ["GUILD_MEMBER_ADD", "GUILD_MEMBERS (1<<1)", "A new member joined a guild (privileged)"],
        ["INTERACTION_CREATE", "—", "A slash command or interaction occurred"],
        ["PRESENCE_UPDATE", "GUILD_PRESENCES (1<<8)", "A user's presence changed (privileged)"],
        ["VOICE_STATE_UPDATE", "GUILD_VOICE_STATES (1<<7)", "A user joined/left voice"],
      ]} />

      <H2 id="sharding">Sharding</H2>
      <P>
        For bots in many guilds, use sharding to split the WebSocket load. Each shard handles a subset
        of guilds. The number of shards is calculated as:
      </P>
      <CodeBlock lang="text">{`shard_id = (guild_id >> 22) % num_shards`}</CodeBlock>
      <P>Specify shards in the Identify payload:</P>
      <CodeBlock lang="json">{`"shard": [0, 1]  // shard 0 of 1`}</CodeBlock>

      <H2 id="encoding">Encoding & Compression</H2>
      <P>
        The Gateway supports <InlineCode>json</InlineCode> (default) encoding. All frames are sent as
        JSON text messages. The <InlineCode>etf</InlineCode> (Erlang Term Format) encoding is not
        currently supported.
      </P>

      <H2 id="standalone-gateway">Standalone Gateway (Horizontal Scaling)</H2>
      <P>
        For production deployments, SerikaCord supports a standalone Gateway server via{" "}
        <InlineCode>scripts/gateway.ts</InlineCode>. This runs a dedicated Bun.serve WebSocket server
        that connects to MongoDB and subscribes to Redis for cross-instance event fan-out. This allows
        you to scale the Gateway independently from the web app.
      </P>
      <Callout type="info" title="Redis fan-out">
        In multi-instance deployments, events are published to Redis and fanned out to all Gateway
        instances. Each instance routes events only to the bot connections it holds. A Redis-based
        leadership lock (<InlineCode>serikacord:discord-bot-lock</InlineCode>) ensures only one
        instance runs the Discord bot connection to avoid duplicate event processing.
      </Callout>
    </DocPage>
  );
}
