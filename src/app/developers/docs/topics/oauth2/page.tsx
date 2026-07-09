import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "OAuth2",
  description:
    "Authenticate users with SerikaCord using OAuth2. Authorization code flow, implicit flow, scopes, bot invites, token refresh, and code examples.",
  path: "/developers/docs/topics/oauth2",
  keywords: ["SerikaCord OAuth2", "user authentication", "authorization code", "implicit flow", "bot invite"],
});

export default function OAuth2Doc() {
  return (
    <DocPage title="OAuth2" description="Authenticate users with SerikaCord using the OAuth2 protocol. Supports authorization code, implicit, and bot invite flows.">
      <P>
        SerikaCord supports OAuth2 for user authentication. The flow is identical to Discord&apos;s OAuth2
        implementation, supporting both the authorization code and implicit grant types.
      </P>

      <H2 id="oauth2-url">Authorization URL</H2>
      <CodeBlock lang="text">{`https://api.serika.chat/api/oauth2/authorize?response_type=code&client_id=YOUR_CLIENT_ID&scope=identify&redirect_uri=YOUR_REDIRECT_URI&state=RANDOM_STATE`}</CodeBlock>
      <P>The token endpoint is:</P>
      <CodeBlock lang="text">https://api.serika.chat/api/oauth2/token</CodeBlock>

      <H2 id="scopes">Scopes</H2>
      <Table headers={["Scope", "Description"]} rows={[
        ["identify", "Get user ID, username, avatar, and discriminator"],
        ["email", "Get user email (requires identify)"],
        ["connections", "Get user connections"],
        ["guilds", "Get servers the user is in"],
        ["guilds.join", "Join a server on behalf of the user"],
        ["guilds.members.read", "Read member info in servers"],
        ["messages.read", "Read messages in servers the user is in"],
        ["rpc", "Connect via RPC"],
        ["bot", "Add a bot to a server (used with permissions parameter)"],
        ["applications.commands", "Register slash commands globally for the user"],
        ["applications.commands.update", "Update slash commands per-guild for the user"],
        ["webhook.incoming", "Create a webhook channel"],
        ["voice", "Join voice channels"],
        ["activity.read", "Read embedded activities"],
        ["activity.write", "Start embedded activities"],
      ]} />

      <H2 id="authorization-code">Authorization Code Flow</H2>
      <P>
        The most secure flow. Use this for server-side applications that can safely store a client secret.
      </P>

      <H3 id="step-1">Step 1: Redirect user to authorization URL</H3>
      <CodeBlock lang="text">{`GET https://api.serika.chat/api/oauth2/authorize
  ?response_type=code
  &client_id=YOUR_CLIENT_ID
  &scope=identify%20email
  &redirect_uri=https://your-site.com/callback
  &state=random_state_string`}</CodeBlock>

      <H3 id="step-2">Step 2: User authorizes, redirect with code</H3>
      <P>After authorization, the user is redirected to your <InlineCode>redirect_uri</InlineCode> with a code:</P>
      <CodeBlock lang="text">{`https://your-site.com/callback?code=AUTHORIZATION_CODE&state=random_state_string`}</CodeBlock>
      <Callout type="warning" title="Verify state">
        Always verify that the <InlineCode>state</InlineCode> parameter matches what you sent. If it
        doesn&apos;t, reject the request — it may be a CSRF attack.
      </Callout>

      <H3 id="step-3">Step 3: Exchange code for access token</H3>
      <CodeBlock lang="bash">{`POST https://api.serika.chat/api/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTHORIZATION_CODE
&redirect_uri=https://your-site.com/callback
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET`}</CodeBlock>
      <P>Response:</P>
      <CodeBlock lang="json">{`{
  "access_token": "YOUR_ACCESS_TOKEN",
  "token_type": "Bearer",
  "expires_in": 604800,
  "refresh_token": "YOUR_REFRESH_TOKEN",
  "scope": "identify email"
}`}</CodeBlock>

      <H3 id="step-4">Step 4: Use the access token</H3>
      <CodeBlock lang="bash">{`GET https://api.serika.chat/api/v10/users/@me
Authorization: Bearer YOUR_ACCESS_TOKEN`}</CodeBlock>
      <P>Example response:</P>
      <CodeBlock lang="json">{`{
  "id": "1234567890",
  "username": "seika",
  "global_name": "Seika",
  "avatar": "avatar_hash",
  "discriminator": "0",
  "email": "seika@example.com",
  "verified": true,
  "flags": 0,
  "bot": false
}`}</CodeBlock>

      <H2 id="refresh-token">Refreshing Tokens</H2>
      <P>
        Access tokens expire after 7 days (604800 seconds). Use the refresh token to get a new one:
      </P>
      <CodeBlock lang="bash">{`POST https://api.serika.chat/api/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=YOUR_REFRESH_TOKEN
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET`}</CodeBlock>
      <P>The response has the same shape as the original token exchange.</P>

      <H2 id="implicit">Implicit Grant Flow</H2>
      <P>For client-side apps (SPAs, mobile apps) that can&apos;t store a client secret:</P>
      <CodeBlock lang="text">{`https://api.serika.chat/api/oauth2/authorize?response_type=token&client_id=YOUR_CLIENT_ID&scope=identify&redirect_uri=YOUR_REDIRECT_URI`}</CodeBlock>
      <P>Returns the access token directly in the URL fragment (no code exchange needed):</P>
      <CodeBlock lang="text">{`https://your-site.com/callback#access_token=YOUR_TOKEN&token_type=Bearer&expires_in=604800&scope=identify`}</CodeBlock>
      <Callout type="warning" title="No refresh token in implicit flow">
        The implicit flow does <Strong>not</Strong> return a refresh token. When the access token
        expires, the user must re-authorize.
      </Callout>

      <H2 id="bot-authorization">Bot Authorization</H2>
      <P>
        To add a bot to a server, include the <InlineCode>bot</InlineCode> scope. You can combine it
        with <InlineCode>applications.commands</InlineCode> to also register slash commands:
      </P>
      <CodeBlock lang="text">{`https://api.serika.chat/api/oauth2/authorize
  ?client_id=YOUR_CLIENT_ID
  &scope=bot+applications.commands
  &permissions=8`}</CodeBlock>
      <P>
        The <InlineCode>permissions</InlineCode> parameter is a bitwise combination of permission flags.
        <InlineCode>permissions=8</InlineCode> is Administrator. See{" "}
        <Link2 href="/developers/docs/topics/permissions">Permissions</Link2> for the full list.
      </P>
      <Table headers={["Parameter", "Required", "Description"]} rows={[
        ["client_id", "Yes", "Your application ID"],
        ["scope", "Yes", "Must include 'bot'. Add 'applications.commands' for slash commands"],
        ["permissions", "No", "Bitwise permission integer (default: 0)"],
        ["guild_id", "No", "Pre-select a specific guild to add the bot to"],
        ["disable_guild_select", "No", "If true, prevents changing the guild selection"],
      ]} />

      <H2 id="code-example">Full code example (Node.js)</H2>
      <CodeBlock lang="javascript">{`// 1. Redirect user to authorization URL
const authUrl = \`https://api.serika.chat/api/oauth2/authorize?\` +
  \`response_type=code&client_id=\${CLIENT_ID}\` +
  \`&scope=identify%20email\` +
  \`&redirect_uri=\${encodeURIComponent(REDIRECT_URI)}\` +
  \`&state=\${generateRandomState()}\`;

// User visits authUrl, authorizes, and is redirected back with ?code=...

// 2. Exchange code for token
const tokenRes = await fetch("https://api.serika.chat/api/oauth2/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  }),
});
const { access_token, refresh_token } = await tokenRes.json();

// 3. Use the access token
const userRes = await fetch("https://api.serika.chat/api/v10/users/@me", {
  headers: { Authorization: \`Bearer \${access_token}\` },
});
const user = await userRes.json();
console.log(\`Logged in as \${user.username}\`);`}</CodeBlock>

      <H2 id="redirect-uri">Redirect URI Matching</H2>
      <Callout type="warning" title="Exact match required">
        Redirect URIs must exactly match what&apos;s configured in your application&apos;s OAuth2 settings
        in the <Link2 href="/developers/applications">Developer Portal</Link2>. Trailing slashes,
        protocol (http vs https), and case all matter.
      </Callout>

      <H2 id="state-parameter">State Parameter (CSRF Protection)</H2>
      <P>
        Always include a random <InlineCode>state</InlineCode> parameter and verify it on callback. This
        prevents CSRF attacks where an attacker tricks a user into authorizing a different application.
      </P>
      <CodeBlock lang="javascript">{`// Generate state
const state = crypto.randomUUID();
// Store in session
req.session.oauthState = state;
// Include in URL
const authUrl = \`...&state=\${state}\`;

// On callback, verify
if (req.query.state !== req.session.oauthState) {
  return res.status(403).send("Invalid state parameter");
}`}</CodeBlock>
    </DocPage>
  );
}
