import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Message Formatting",
  description:
    "Format SerikaCord messages with markdown, mentions, emojis, timestamps, embeds, components, attachments, and allowed_mentions.",
  path: "/developers/docs/topics/message-formatting",
  keywords: ["SerikaCord message formatting", "markdown", "mentions", "embeds", "components"],
});

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

      <H2 id="embed-limits">Embed Limits</H2>
      <Table headers={["Field", "Limit"]} rows={[
        ["Total embed characters", "6000"],
        ["Title", "256 characters"],
        ["Description", "4096 characters"],
        ["Fields per embed", "25"],
        ["Field name", "256 characters"],
        ["Field value", "1024 characters"],
        ["Footer text", "2048 characters"],
        ["Author name", "256 characters"],
        ["Embeds per message", "10"],
      ]} />
      <Callout type="warning" title="Total character limit">
        The 6000-character limit applies to the <Strong>sum of all text fields</Strong> across all
        embeds in a message, not per embed.
      </Callout>

      <H2 id="components">Message Components</H2>
      <P>Interactive components like buttons and select menus:</P>
      <Table headers={["Component Type", "Value", "Description"]} rows={[
        ["Action Row", "1", "Container for other components (max 5 per row)"],
        ["Button", "2", "Clickable button (max 25 per message)"],
        ["String Select", "3", "Dropdown menu for text options"],
        ["User Select", "5", "Dropdown for selecting users"],
        ["Role Select", "6", "Dropdown for selecting roles"],
        ["Mentionable Select", "7", "Dropdown for users or roles"],
        ["Channel Select", "8", "Dropdown for selecting channels"],
      ]} />
      <P>Button styles:</P>
      <Table headers={["Style", "Value", "Description"]} rows={[
        ["Primary", "1", "Blurple button"],
        ["Secondary", "2", "Grey button"],
        ["Success", "3", "Green button"],
        ["Danger", "4", "Red button"],
        ["Link", "5", "Link button (navigates to URL, no custom_id)"],
      ]} />
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
