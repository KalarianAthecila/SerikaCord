import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";

export default function ApplicationDoc() {
  return (
    <DocPage title="Application" description="Manage your SerikaCord application, including commands, handlers, and metadata.">
      <H2 id="application-object">Application Object</H2>
      <CodeBlock lang="json">{`{
  "id": "1234567890",
  "name": "My App",
  "icon": null,
  "description": "A cool app",
  "team": null,
  "bot_public": true,
  "bot_require_code_grant": false,
  "terms_of_service_url": null,
  "privacy_policy_url": null,
  "verify_key": "abc123",
  "flags": 0,
  "install_params": {
    "scopes": ["bot", "applications.commands"],
    "permissions": "8"
  }
}`}</CodeBlock>

      <H2 id="endpoints">Endpoints</H2>
      <Endpoint method="GET" path="/applications/{application.id}">Get an application.</Endpoint>
      <Endpoint method="GET" path="/applications/@me">Get the current application (bot token auth).</Endpoint>
      <Endpoint method="PATCH" path="/applications/{application.id}">Update an application.</Endpoint>

      <H2 id="application-flags">Application Flags</H2>
      <Table headers={["Flag", "Value", "Description"]} rows={[
        ["Application Auto Moderation Rule Create", "1 << 6", "Can create auto mod rules"],
        ["Gateway Presence", "1 << 12", "Uses presence intent (verified)"],
        ["Gateway Presence Limited", "1 << 13", "Presence intent (unverified)"],
        ["Gateway Guild Members", "1 << 14", "Uses members intent (verified)"],
        ["Gateway Guild Members Limited", "1 << 15", "Members intent (unverified)"],
        ["Verification Pending Guild Limit", "1 << 16", "Pending verification"],
        ["Embedded", "1 << 17", "Embedded app"],
        ["Gateway Message Content", "1 << 18", "Uses message content intent (verified)"],
        ["Gateway Message Content Limited", "1 << 19", "Message content intent (unverified)"],
        ["Application Command Badge", "1 << 23", "Has slash commands"],
      ]} />

      <H2 id="install-params">Install Parameters</H2>
      <P>
        Configure default scopes and permissions for your application's install link:
      </P>
      <CodeBlock lang="json">{`{
  "install_params": {
    "scopes": ["bot", "applications.commands"],
    "permissions": "8"
  }
}`}</CodeBlock>

      <H2 id="custom-install-url">Custom Install URL</H2>
      <P>
        Set a custom install URL to override the default OAuth2 flow:
      </P>
      <CodeBlock lang="json">{`{
  "custom_install_url": "https://your-site.com/install"
}`}</CodeBlock>
    </DocPage>
  );
}
