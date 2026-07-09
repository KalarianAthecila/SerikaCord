import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Table, Endpoint } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Bot Interactions",
  description:
    "Handle SerikaCord bot interactions via gateway or HTTP webhooks. Learn about interaction payloads, signatures, response types, and verified delivery.",
  path: "/developers/docs/bots/interactions",
  keywords: [
    "SerikaCord interactions",
    "bot webhooks",
    "interaction payload",
    "Ed25519 signature",
    "gateway interactions",
  ],
});

export default function InteractionsDoc() {
  return (
    <DocPage
      title="Interactions"
      description="An interaction is what your app receives when a user invokes one of its commands. You can handle interactions over the gateway, or over HTTP with a signed webhook."
    >
      <H2 id="delivery">Two delivery modes</H2>
      <Table headers={["Mode", "How it works", "Best for"]} rows={[
        ["Gateway", "INTERACTION_CREATE dispatch event on your WebSocket", "Bots already connected to the Gateway"],
        ["HTTP endpoint", "Signed POST to your Interactions Endpoint URL", "Serverless bots, lightweight bots without persistent connections"],
      ]} />
      <P>
        You can use both simultaneously. Many bots use the Gateway for message events and HTTP for
        slash command interactions.
      </P>

      <H2 id="interaction-types">Interaction Types</H2>
      <Table headers={["Type", "Name", "Description"]} rows={[
        ["1", "PING", "Sent to verify your endpoint is valid (HTTP mode only)"],
        ["2", "APPLICATION_COMMAND", "User invoked a slash command or context menu command"],
        ["3", "MESSAGE_COMPONENT", "User clicked a button, select menu, or other component"],
        ["4", "APPLICATION_COMMAND_AUTOCOMPLETE", "User is typing in an autocomplete option"],
        ["5", "MODAL_SUBMIT", "User submitted a modal form"],
      ]} />

      <H2 id="verifying">Verifying signatures (HTTP mode)</H2>
      <P>
        Every POST includes two headers. You <Strong>must</Strong> verify them and reject anything that
        fails with <InlineCode>401</InlineCode> — this proves the request came from SerikaCord.
      </P>
      <Table headers={["Header", "Meaning"]} rows={[
        ["X-Signature-Ed25519", "Hex signature of (timestamp + raw body)"],
        ["X-Signature-Timestamp", "Unix timestamp used in the signed message"],
      ]} />
      <P>
        Verify against the <Strong>Public Key</Strong> shown on your Bot tab (a 64-char hex string):
      </P>
      <CodeBlock lang="javascript">{`import nacl from "tweetnacl";

function verify(req, rawBody, PUBLIC_KEY) {
  const sig = req.headers["x-signature-ed25519"];
  const ts = req.headers["x-signature-timestamp"];
  return nacl.sign.detached.verify(
    Buffer.from(ts + rawBody),
    Buffer.from(sig, "hex"),
    Buffer.from(PUBLIC_KEY, "hex"),
  );
}`}</CodeBlock>
      <Callout type="warning" title="Endpoint validation">
        When you save an Interactions Endpoint URL, we immediately send a signed{" "}
        <InlineCode>PING</InlineCode> (<InlineCode>type: 1</InlineCode>). Your endpoint must verify the
        signature and reply <InlineCode>{`{ "type": 1 }`}</InlineCode> or the URL is rejected.
      </Callout>

      <H2 id="responding">Responding</H2>
      <P>Reply to the POST with an interaction response object. The common types:</P>
      <Table headers={["Type", "Name", "Effect"]} rows={[
        ["1", "PONG", "Acknowledge a PING (validation only)"],
        ["4", "CHANNEL_MESSAGE_WITH_SOURCE", "Reply with a message immediately"],
        ["5", "DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE", "Show a loading state, follow up later"],
        ["6", "DEFERRED_UPDATE_MESSAGE", "Acknowledge a component interaction, update later"],
        ["7", "UPDATE_MESSAGE", "Update the message the component was attached to"],
        ["8", "APPLICATION_COMMAND_AUTOCOMPLETE_RESULT", "Respond to autocomplete with choices"],
        ["9", "MODAL", "Show a modal popup to the user"],
      ]} />

      <H3 id="example">Example handler (Express)</H3>
      <CodeBlock lang="javascript">{`app.post("/interactions", express.raw({ type: "application/json" }), (req, res) => {
  const rawBody = req.body.toString();
  if (!verify(req, rawBody, PUBLIC_KEY)) {
    return res.status(401).send("invalid request signature");
  }

  const interaction = JSON.parse(rawBody);

  // PING → PONG (endpoint validation)
  if (interaction.type === 1) {
    return res.json({ type: 1 });
  }

  // APPLICATION_COMMAND → reply
  if (interaction.type === 2) {
    return res.json({
      type: 4,
      data: { content: \`Hello, <@\${interaction.member?.user?.id}>!\` },
    });
  }

  // APPLICATION_COMMAND_AUTOCOMPLETE → return choices
  if (interaction.type === 4) {
    const focused = interaction.data.options.find(o => o.focused);
    return res.json({
      type: 8,
      data: {
        choices: [
          { name: "Option A", value: "a" },
          { name: "Option B", value: "b" },
        ],
      },
    });
  }
});`}</CodeBlock>

      <H2 id="payload">Interaction payload</H2>
      <P>The full payload for an <InlineCode>APPLICATION_COMMAND</InlineCode> interaction:</P>
      <CodeBlock lang="json">{`{
  "id": "1180000000000000000",
  "application_id": "1170000000000000000",
  "type": 2,
  "token": "aW50ZXJhY3Rpb24...",
  "channel_id": "1160000000000000000",
  "guild_id": "1150000000000000000",
  "member": {
    "user": {
      "id": "1140000000000000000",
      "username": "seika",
      "global_name": "Seika",
      "bot": false
    },
    "roles": ["role_id"],
    "nick": null,
    "joined_at": "2025-01-01T00:00:00.000Z"
  },
  "data": {
    "id": "1130000000000000000",
    "name": "echo",
    "type": 1,
    "options": [
      { "name": "text", "type": 3, "value": "hi there" }
    ]
  }
}`}</CodeBlock>
      <Table headers={["Field", "Type", "Description"]} rows={[
        ["id", "snowflake", "Interaction ID — used to respond"],
        ["application_id", "snowflake", "Your application ID"],
        ["type", "integer", "Interaction type (see table above)"],
        ["token", "string", "Interaction token — used for follow-up calls"],
        ["channel_id", "snowflake", "Channel the interaction happened in"],
        ["guild_id", "snowflake", "Guild the interaction happened in (null for DMs)"],
        ["member", "object", "Guild member who triggered it (null in DMs)"],
        ["user", "object", "User who triggered it (present in DMs)"],
        ["data", "object", "Command data: name, options, resolved, etc."],
      ]} />

      <H2 id="followups">Follow-up messages</H2>
      <P>
        After the initial response, you can send follow-up messages using the interaction token:
      </P>
      <Endpoint method="POST" path="/interactions/{'{interaction.id}'}/{'{interaction.token}'}/callback">
        Initial interaction response (must be within 3 seconds).
      </Endpoint>
      <Endpoint method="PATCH" path="/webhooks/{'{application.id}'}/{'{interaction.token}'}/messages/@original">
        Edit the original response.
      </Endpoint>
      <Endpoint method="POST" path="/webhooks/{'{application.id}'}/{'{interaction.token}'}">
        Send a follow-up message.
      </Endpoint>
      <Endpoint method="DELETE" path="/webhooks/{'{application.id}'}/{'{interaction.token}'}/messages/{'{message.id}'}">
        Delete a follow-up message.
      </Endpoint>
      <CodeBlock lang="bash">{`# Send a follow-up message
curl -X POST \\
  -H "Authorization: Bot YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"content":"Follow-up message!"}' \\
  https://api.serika.chat/api/v10/webhooks/APP_ID/INTERACTION_TOKEN`}</CodeBlock>

      <H2 id="message-components">Message components</H2>
      <P>
        Interactions can include buttons and select menus in responses. When a user clicks a button or
        selects from a menu, you receive a <InlineCode>MESSAGE_COMPONENT</InlineCode> interaction
        (type 3) with <InlineCode>data.custom_id</InlineCode> identifying which component was used.
      </P>
      <CodeBlock lang="json">{`{
  "type": 4,
  "data": {
    "content": "Click a button!",
    "components": [
      {
        "type": 1,
        "components": [
          {
            "type": 2,
            "style": 1,
            "label": "Yes",
            "custom_id": "btn_yes"
          },
          {
            "type": 2,
            "style": 4,
            "label": "No",
            "custom_id": "btn_no"
          }
        ]
      }
    ]
  }
}`}</CodeBlock>

      <H2 id="modals">Modals</H2>
      <P>
        Respond with type <InlineCode>9</InlineCode> to show a modal popup. The user fills it in and
        submits, triggering a <InlineCode>MODAL_SUBMIT</InlineCode> interaction (type 5):
      </P>
      <CodeBlock lang="json">{`{
  "type": 9,
  "data": {
    "title": "Feedback Form",
    "custom_id": "feedback_modal",
    "components": [
      {
        "type": 1,
        "components": [
          {
            "type": 4,
            "custom_id": "feedback_text",
            "style": 2,
            "label": "Your feedback",
            "required": true
          }
        ]
      }
    ]
  }
}`}</CodeBlock>

      <Callout type="info" title="Prefer the gateway?">
        If you use a full library like discord.js, you generally don&apos;t need an HTTP endpoint —
        interactions arrive on your socket. The HTTP path exists for serverless and lightweight bots.
        Learn to register commands in <Link2 href="/developers/docs/bots/slash-commands">Slash Commands</Link2>.
      </Callout>
    </DocPage>
  );
}
