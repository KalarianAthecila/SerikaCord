import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Bot Verification",
  description:
    "Get your SerikaCord bot verified to scale beyond 100 servers. Requirements, application process, privileged intents, and data deletion.",
  path: "/developers/docs/topics/bot-verification",
  keywords: ["SerikaCord bot verification", "verified bot", "100 servers", "privileged intents"],
});

export default function BotVerificationDoc() {
  return (
    <DocPage title="Bot Verification" description="Get your bot verified to scale beyond 100 servers.">
      <P>
        Bots that join 100 or more servers must be verified by SerikaCord. This process ensures bots
        meet quality and security standards before scaling further.
      </P>

      <H2 id="when-to-verify">When to Verify</H2>
      <P>
        You'll receive a notification when your bot approaches 75 servers. At 100 servers, your bot
        will be prevented from joining new servers until verified.
      </P>
      <Table headers={["Server Count", "Status"]} rows={[
        ["0-74", "No verification needed"],
        ["75-99", "Verification recommended — notification sent"],
        ["100+", "Verification required — bot cannot join new servers"],
      ]} />

      <H2 id="requirements">Verification Requirements</H2>
      <UL>
        <li>Bot must be owned by a verified developer or verified team</li>
        <li>Bot must have a clear description and purpose</li>
        <li>Bot must comply with the SerikaCord Terms of Service and Community Guidelines</li>
        <li>Bot must handle rate limits and errors gracefully</li>
        <li>Bot must not store user data without proper disclosure</li>
        <li>Developer must provide contact information</li>
        <li>If the bot uses privileged intents, justification must be provided</li>
      </UL>

      <H2 id="how-to-apply">How to Apply</H2>
      <UL>
        <li>1. Go to your application's <Strong>General Information</Strong> page</li>
        <li>2. Click <Strong>"Verify Application"</Strong> when the server count reaches 75+</li>
        <li>3. Fill out the verification form with bot details and intent justifications</li>
        <li>4. Submit and wait for review (typically 1-2 weeks)</li>
        <li>5. You'll be notified via email when verification is approved or if more info is needed</li>
      </UL>

      <H2 id="verified-badge">Verified Badge</H2>
      <P>
        Once verified, your bot will receive a checkmark badge next to its name, indicating it's an
        official verified bot.
      </P>

      <H2 id="team-verification">Team Verification</H2>
      <P>
        If your bot is owned by a team, the team must also be verified. Team verification requires:
      </P>
      <UL>
        <li>Team name and logo</li>
        <li>Team description</li>
        <li>At least one verified developer on the team</li>
        <li>Compliance with SerikaCord policies</li>
      </UL>

      <Callout type="warning" title="Privileged Intents">
        Bots requesting <InlineCode>GUILD_MEMBERS</InlineCode>, <InlineCode>GUILD_PRESENCES</InlineCode>,
        or <InlineCode>MESSAGE_CONTENT</InlineCode> intents must provide detailed justification during
        verification. Not all bots will be approved for these intents.
      </Callout>

      <H2 id="after-verification">After Verification</H2>
      <UL>
        <li>Your bot can join unlimited servers</li>
        <li>You'll have access to additional analytics in the Developer Portal</li>
        <li>Your bot will appear in the App Directory (if opted in)</li>
        <li>You must maintain compliance — violations can result in losing verification</li>
      </UL>

      <H2 id="data-deletion">Data Deletion</H2>
      <P>
        Verified bots must provide a way for users to request data deletion. This is required for
        compliance with privacy regulations.
      </P>
    </DocPage>
  );
}
