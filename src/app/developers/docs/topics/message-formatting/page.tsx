import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Table } from "../../DocPage";

export default function MessageFormattingDoc() {
  return (
    <DocPage title="Message Formatting" description="Format messages with markdown, mentions, emojis, and rich embeds.">
      <H2 id="markdown">Markdown Support</H2>
      <P>SerikaCord supports standard markdown plus some extensions:</P>
      <Table headers={["Syntax", "Result"]} rows={[
        ["**bold**", "Bold text"],
        ["*italic*", "Italic text"],
        ["__underline__", "Underlined text"],
        ["~~strikethrough~~", "Strikethrough text"],
        ["`inline code`", "Inline code"],
        ["```code block```", "Code block"],
        ["> quote", "Block quote"],
        [">> quote block", "Multi-line quote"],
        ["||spoiler||", "Spoiler (hidden until clicked)"],
      ]} />

      <H2 id="mentions">Mentions</H2>
      <P>Mentions use special syntax in message content:</P>
      <Table headers={["Type", "Syntax"]} rows={[
        ["User", "<@user_id>"],
        ["User (nickname)", "<@!user_id>"],
        ["Channel", "<#channel_id>"],
        ["Role", "<@&role_id>"],
        ["Slash command", "</command_name:command_id>"],
        ["Emoji", "<:emoji_name:emoji_id>"],
        ["Animated emoji", "<a:emoji_name:emoji_id>"],
        ["Timestamp", "<t:timestamp:format>"],
      ]} />

      <H2 id="timestamps">Timestamp Formatting</H2>
      <P>Use <InlineCode>&lt;t:timestamp:format&gt;</InlineCode> for localized timestamps:</P>
      <Table headers={["Format", "Example"]} rows={[
        ["t", "Short time (e.g., 4:30 PM)"],
        ["T", "Long time (e.g., 4:30:00 PM)"],
        ["d", "Short date (e.g., 07/05/2026)"],
        ["D", "Long date (e.g., July 5, 2026)"],
        ["f", "Short date-time (default)"],
        ["F", "Long date-time"],
        ["R", "Relative time (e.g., 2 hours ago)"],
      ]} />

      <H2 id="embeds">Embeds</H2>
      <P>Rich embeds can be attached to messages:</P>
      <CodeBlock lang="json">{`{
  "embeds": [{
    "title": "Embed Title",
    "description": "Embed description text",
    "url": "https://serika.dev",
    "color": 0x8B5CF6,
    "footer": { "text": "Footer text", "icon_url": "https://..." },
    "image": { "url": "https://..." },
    "thumbnail": { "url": "https://..." },
    "author": { "name": "Author name", "icon_url": "https://..." },
    "fields": [
      { "name": "Field 1", "value": "Value 1", "inline": true },
      { "name": "Field 2", "value": "Value 2", "inline": true }
    ],
    "timestamp": "2026-07-05T14:30:00.000Z"
  }]
}`}</CodeBlock>

      <Callout type="warning" title="Embed Limits">
        Embeds have limits: 6000 characters total, 256 chars for title, 4096 for description, 25
        fields max, 256 chars per field name, 1024 per field value.
      </Callout>

      <H2 id="components">Message Components</H2>
      <P>Interactive components like buttons and select menus:</P>
      <CodeBlock lang="json">{`{
  "components": [{
    "type": 1,
    "components": [{
      "type": 2,
      "style": 1,
      "label": "Click me!",
      "custom_id": "my_button"
    }]
  }]
}`}</CodeBlock>

      <H2 id="attachments">Attachments</H2>
      <P>
        Files can be attached using <InlineCode>multipart/form-data</InlineCode>. Reference them in
        the message content using <InlineCode>attachment://filename.ext</InlineCode>.
      </P>

      <H2 id="allowed-mentions">Allowed Mentions</H2>
      <P>
        Control which mentions are parsed in a message using the{" "}
        <InlineCode>allowed_mentions</InlineCode> field:
      </P>
      <CodeBlock lang="json">{`{
  "content": "Hello <@123>!",
  "allowed_mentions": {
    "parse": ["users"],
    "users": ["123"]
  }
}`}</CodeBlock>
    </DocPage>
  );
}
