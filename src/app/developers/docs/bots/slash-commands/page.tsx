import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Slash Commands",
  description:
    "Register and handle slash commands on SerikaCord. Learn global vs guild-scoped commands, command options, subcommands, and interaction responses.",
  path: "/developers/docs/bots/slash-commands",
  keywords: [
    "SerikaCord slash commands",
    "application commands",
    "register commands",
    "command options",
    "bot commands",
  ],
});

export default function SlashCommandsDoc() {
  return (
    <DocPage
      title="Slash Commands"
      description="Application commands let users invoke your bot with a leading slash. Register them once, then handle the resulting interaction."
    >
      <P>
        Slash commands are registered per-application, either <Strong>globally</Strong> or scoped to a
        single <Strong>guild</Strong>. Guild commands update instantly and are great for testing; global
        commands are available everywhere your app is installed.
      </P>

      <Callout type="info" title="Command types">
        <InlineCode>type: 1</InlineCode> is a <Strong>CHAT_INPUT</Strong> (slash) command. User and
        message context-menu commands use types <InlineCode>2</InlineCode> and <InlineCode>3</InlineCode>.
      </Callout>

      <H2 id="command-object">Command Object</H2>
      <CodeBlock lang="json">{`{
  "id": "1234567890",
  "application_id": "APP_ID",
  "name": "ping",
  "description": "Check that the bot is alive",
  "options": [],
  "default_permission": true,
  "type": 1,
  "version": "1"
}`}</CodeBlock>

      <H2 id="register">Registering commands</H2>

      <H3 id="global">Global commands</H3>
      <Endpoint method="PUT" path="/applications/{'{application.id}'}/commands">
        Bulk-overwrite your global commands. Send the full array; anything omitted is removed.
      </Endpoint>
      <CodeBlock lang="bash">{`curl -X PUT \\
  -H "Authorization: Bot YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  https://api.serika.chat/api/v10/applications/APP_ID/commands \\
  -d '[
    {
      "name": "ping",
      "description": "Check that the bot is alive",
      "type": 1
    },
    {
      "name": "echo",
      "description": "Repeat something back",
      "type": 1,
      "options": [
        { "name": "text", "description": "What to say", "type": 3, "required": true }
      ]
    }
  ]'`}</CodeBlock>
      <P>
        You can also create commands one at a time with <InlineCode>POST</InlineCode>, update them with{" "}
        <InlineCode>PATCH</InlineCode>, or delete them with <InlineCode>DELETE</InlineCode>.
      </P>

      <H3 id="guild">Guild commands</H3>
      <Endpoint method="PUT" path="/applications/{'{application.id}'}/guilds/{'{guild.id}'}/commands">
        Same shape, scoped to one guild. Use this while iterating — changes apply immediately.
      </Endpoint>
      <CodeBlock lang="bash">{`curl -X PUT \\
  -H "Authorization: Bot YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  https://api.serika.chat/api/v10/applications/APP_ID/guilds/GUILD_ID/commands \\
  -d '[
    {
      "name": "test",
      "description": "A test command",
      "type": 1
    }
  ]'`}</CodeBlock>
      <P>
        Guild commands are deleted and recreated on each bulk overwrite. The current implementation
        removes all existing guild commands and creates new ones from the provided array.
      </P>

      <H2 id="option-types">Option types</H2>
      <Table headers={["Type", "Name", "Description"]} rows={[
        ["1", "SUB_COMMAND", "A nested sub-command"],
        ["2", "SUB_COMMAND_GROUP", "A group of sub-commands"],
        ["3", "STRING", "A text value"],
        ["4", "INTEGER", "A whole number (-2^53 to 2^53)"],
        ["5", "BOOLEAN", "true / false"],
        ["6", "USER", "A user snowflake"],
        ["7", "CHANNEL", "A channel snowflake"],
        ["8", "ROLE", "A role snowflake"],
        ["9", "MENTIONABLE", "A user or role snowflake"],
        ["10", "NUMBER", "A floating-point number"],
        ["11", "ATTACHMENT", "A file attachment"],
      ]} />

      <H2 id="option-structure">Option structure</H2>
      <CodeBlock lang="json">{`{
  "name": "user",
  "description": "The user to look up",
  "type": 6,
  "required": true,
  "choices": [
    { "name": "Me", "value": "1234567890" }
  ],
  "channel_types": [0, 5],
  "min_value": 0,
  "max_value": 100,
  "autocomplete": false
}`}</CodeBlock>
      <Table headers={["Field", "Type", "Description"]} rows={[
        ["name", "string", "1-32 characters, lowercase, no spaces"],
        ["description", "string", "1-100 characters"],
        ["type", "integer", "One of the option types above"],
        ["required", "boolean", "Whether the user must provide this (default: false)"],
        ["choices", "array", "Pre-defined choices the user can pick from"],
        ["channel_types", "array", "For CHANNEL type: restrict to specific channel types"],
        ["min_value / max_value", "number", "For INTEGER/NUMBER: constrain the range"],
        ["autocomplete", "boolean", "Enable autocomplete suggestions (default: false)"],
      ]} />

      <H2 id="subcommands">Subcommands and groups</H2>
      <P>
        Use <InlineCode>SUB_COMMAND</InlineCode> (type 1) and <InlineCode>SUB_COMMAND_GROUP</InlineCode>{" "}
        (type 2) to organize complex commands:
      </P>
      <CodeBlock lang="json">{`{
  "name": "config",
  "description": "Configure the bot",
  "type": 1,
  "options": [
    {
      "name": "set",
      "description": "Set a configuration value",
      "type": 1,
      "options": [
        { "name": "key", "description": "Config key", "type": 3, "required": true },
        { "name": "value", "description": "Config value", "type": 3, "required": true }
      ]
    },
    {
      "name": "reset",
      "description": "Reset all configuration",
      "type": 1
    }
  ]
}`}</CodeBlock>
      <P>
        Users invoke this as <InlineCode>/config set key: value</InlineCode> or{" "}
        <InlineCode>/config reset</InlineCode>.
      </P>

      <H2 id="manage">Managing individual commands</H2>
      <Endpoint method="GET" path="/applications/{'{application.id}'}/commands">Fetch all global commands.</Endpoint>
      <Endpoint method="POST" path="/applications/{'{application.id}'}/commands">Create a single command.</Endpoint>
      <Endpoint method="GET" path="/applications/{'{application.id}'}/commands/{'{command.id}'}">Get a single command.</Endpoint>
      <Endpoint method="PATCH" path="/applications/{'{application.id}'}/commands/{'{command.id}'}">Edit a command.</Endpoint>
      <Endpoint method="DELETE" path="/applications/{'{application.id}'}/commands/{'{command.id}'}">Delete a command.</Endpoint>
      <Endpoint method="GET" path="/applications/{'{application.id}'}/guilds/{'{guild.id}'}/commands">Fetch all guild commands.</Endpoint>
      <Endpoint method="PUT" path="/applications/{'{application.id}'}/guilds/{'{guild.id}'}/commands">Bulk overwrite guild commands.</Endpoint>

      <H2 id="handling">Handling invocations</H2>
      <P>
        When a user runs your command, SerikaCord delivers an{" "}
        <Strong>APPLICATION_COMMAND interaction</Strong>. You receive it one of two ways:
      </P>
      <Table headers={["Mode", "How it works", "Response time limit"]} rows={[
        ["Gateway", "INTERACTION_CREATE event on your WebSocket", "3 seconds to acknowledge, 15 min to respond"],
        ["HTTP endpoint", "Signed POST to your Interactions Endpoint URL", "3 seconds to respond"],
      ]} />
      <P>
        See <Link2 href="/developers/docs/bots/interactions">Interactions</Link2> for the payload shape,
        signature verification, and how to respond.
      </P>

      <H2 id="limits">Limits</H2>
      <Table headers={["Limit", "Value"]} rows={[
        ["Max global commands per application", "100"],
        ["Max guild commands per application per guild", "100"],
        ["Command name length", "1-32 characters"],
        ["Command description length", "1-100 characters"],
        ["Options per command", "Up to 25"],
        ["Choices per option", "Up to 25"],
        ["Subcommand groups per command", "Up to 1 level deep"],
      ]} />

      <Callout type="info" title="Tip: test with a guild command first">
        Register to a single guild while developing so changes appear instantly, then promote to a global
        command when you ship.
      </Callout>
    </DocPage>
  );
}
