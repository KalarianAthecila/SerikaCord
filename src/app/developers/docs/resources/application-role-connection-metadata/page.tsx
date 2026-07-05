import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Endpoint, Table } from "../../DocPage";

export default function ApplicationRoleConnectionMetadataDoc() {
  return (
    <DocPage title="Application Role Connection Metadata" description="Configure role connection metadata for your application to link external accounts with guild roles.">
      <P>
        Application Role Connection Metadata allows your app to define metadata that can be used by
        guilds to configure role requirements based on external account data.
      </P>

      <H2 id="metadata-types">Metadata Types</H2>
      <Table headers={["Type", "Value", "Description"]} rows={[
        ["Integer Less Than or Equal", "1", "Role requirement: metadata value <= threshold"],
        ["Integer Greater Than or Equal", "2", "Role requirement: metadata value >= threshold"],
        ["Integer Equal", "3", "Role requirement: metadata value == threshold"],
        ["Integer Not Equal", "4", "Role requirement: metadata value != threshold"],
        ["Date Time Less Than or Equal", "5", "Role requirement: date <= threshold"],
        ["Date Time Greater Than or Equal", "6", "Role requirement: date >= threshold"],
        ["Boolean Equal", "7", "Role requirement: boolean == threshold"],
        ["Boolean Not Equal", "8", "Role requirement: boolean != threshold"],
      ]} />

      <H2 id="metadata-object">Metadata Object</H2>
      <CodeBlock lang="json">{`{
  "key": "level",
  "name": "Player Level",
  "description": "Your player level in the game",
  "type": 2
}`}</CodeBlock>

      <H2 id="endpoints">Endpoints</H2>
      <Endpoint method="GET" path="/applications/{application.id}/role-connections/metadata">
        List all role connection metadata records for an application.
      </Endpoint>
      <Endpoint method="PUT" path="/applications/{application.id}/role-connections/metadata">
        Update role connection metadata records. Up to 5 records per application.
      </Endpoint>

      <Callout type="info" title="Limit">
        Each application can have up to 5 metadata records. Each key must be unique and 1-50 characters.
      </Callout>
    </DocPage>
  );
}
