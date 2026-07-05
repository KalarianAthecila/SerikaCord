import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2 } from "../DocPage";

export default function IntroDoc() {
  return (
    <DocPage title="Introduction" description="Welcome to the SerikaCord Developer documentation — your gateway to building bots, integrations, and applications.">
      <P>
        The SerikaCord API is a <Strong>1:1-compatible mirror of the Discord API</Strong>. If you've
        built a Discord bot before, you already know how to build a SerikaCord bot — just point your
        base URL to <InlineCode>https://serika.dev/api</InlineCode> and use your SerikaCord bot token.
      </P>

      <Callout type="info" title="Discord API Compatibility">
        SerikaCord uses the same REST routes, gateway opcodes, OAuth2 flows, and data structures as
        Discord. Existing Discord.js / Discord.py bots work with minimal configuration changes.
      </Callout>

      <H2 id="base-url">Base URL</H2>
      <P>All API requests should be sent to:</P>
      <CodeBlock lang="bash">https://serika.dev/api/v10</CodeBlock>
      <P>
        The API version is specified in the URL path, just like Discord. The current stable version
        is <InlineCode>v10</InlineCode>.
      </P>

      <H2 id="authentication">Authentication</H2>
      <P>
        All requests require a <Strong>Bot token</Strong> passed in the <InlineCode>Authorization</InlineCode>{" "}
        header with the <InlineCode>Bot</InlineCode> prefix:
      </P>
      <CodeBlock lang="bash">Authorization: Bot YOUR_BOT_TOKEN_HERE</CodeBlock>

      <H2 id="getting-started">Getting Started</H2>
      <P>To start building on SerikaCord, you'll need to:</P>
      <UL>
        <li>Create an application in the <Link2 href="/developers/applications">Developer Portal</Link2></li>
        <li>Configure your bot user and generate a token</li>
        <li>Set up OAuth2 redirect URIs and scopes</li>
        <li>Connect to the Gateway or make REST API calls</li>
      </UL>

      <H2 id="key-features">Key Features</H2>
      <UL>
        <li><Strong>REST API</Strong> — Full CRUD for guilds, channels, messages, users, and more</li>
        <li><Strong>Gateway</Strong> — Real-time WebSocket events for messages, presence, and member updates</li>
        <li><Strong>OAuth2</Strong> — Let users log in with SerikaCord and authorize your app</li>
        <li><Strong>Webhooks</Strong> — Receive HTTP callbacks for events</li>
        <li><Strong>Slash Commands</Strong> — Register application commands for users to interact with</li>
        <li><Strong>Emojis & Stickers</Strong> — Upload and manage custom emojis and stickers</li>
        <li><Strong>Developer Teams</Strong> — Collaborate with other developers on shared applications</li>
        <li><Strong>Bot Verification</Strong> — Get verified to scale your bot to 100+ servers</li>
      </UL>

      <H2 id="rate-limits">Rate Limits</H2>
      <P>
        The API enforces rate limits to ensure stability. See the{" "}
        <Link2 href="/developers/docs/topics/rate-limits">Rate Limits</Link2> page for details.
      </P>

      <H2 id="support">Support</H2>
      <P>
        Need help? Join the SerikaCord Developer community server or check out the{" "}
        <Link2 href="/developers/docs/reference">API Reference</Link2> for detailed endpoint documentation.
      </P>
    </DocPage>
  );
}
