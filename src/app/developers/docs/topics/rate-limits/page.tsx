import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Table } from "../../DocPage";

export default function RateLimitsDoc() {
  return (
    <DocPage title="Rate Limits" description="Understand and handle API rate limits to keep your bot running smoothly.">
      <P>
        SerikaCord enforces rate limits to protect the API. Rate limits are applied per-route and
        per-bot (or per-token for OAuth2).
      </P>

      <H2 id="headers">Rate Limit Headers</H2>
      <P>Every API response includes rate limit headers:</P>
      <Table headers={["Header", "Description"]} rows={[
        ["X-RateLimit-Limit", "Maximum requests per window"],
        ["X-RateLimit-Remaining", "Remaining requests in current window"],
        ["X-RateLimit-Reset", "Epoch timestamp when the window resets"],
        ["X-RateLimit-Reset-After", "Seconds until window resets"],
        ["X-RateLimit-Bucket", "Unique bucket identifier for this route"],
        ["X-RateLimit-Global", "True if global rate limit was hit"],
      ]} />

      <H2 id="rate-limited-response">Rate Limited Response</H2>
      <P>When rate limited, the API returns <InlineCode>429 Too Many Requests</InlineCode>:</P>
      <CodeBlock lang="json">{`{
  "message": "You are being rate limited.",
  "retry_after": 0.642,
  "global": false
}`}</CodeBlock>
      <P>
        Wait <InlineCode>retry_after</InlineCode> seconds before retrying. The response also includes
        a <InlineCode>Retry-After</InlineCode> HTTP header.
      </P>

      <H2 id="bucket-types">Rate Limit Buckets</H2>
      <P>Routes are grouped into buckets. Some examples:</P>
      <Table headers={["Route", "Bucket Type"]} rows={[
        ["GET /channels/{channel.id}/messages", "Per-channel"],
        ["POST /channels/{channel.id}/messages", "Per-channel"],
        ["PUT /guilds/{guild.id}/members/{user.id}", "Per-guild"],
        ["GET /users/{user.id}", "Global"],
        ["GET /gateway", "Global"],
      ]} />

      <H2 id="global-rate-limit">Global Rate Limit</H2>
      <P>
        There is a global rate limit of 50 requests per second across all routes. If exceeded, you'll
        receive a <InlineCode>429</InlineCode> with <InlineCode>global: true</InlineCode>.
      </P>

      <H2 id="handling">Best Practices for Handling Rate Limits</H2>
      <UL>
        <li>Track <InlineCode>X-RateLimit-Remaining</InlineCode> and slow down before hitting 0</li>
        <li>Queue requests and process them sequentially per-bucket</li>
        <li>Respect <InlineCode>retry_after</InlineCode> — don't retry immediately</li>
        <li>Use exponential backoff for unexpected 429s</li>
        <li>Cache responses where possible to reduce API calls</li>
        <li>Use <InlineCode>GET</InlineCode> requests with <InlineCode>If-None-Match</InlineCode> for 304 caching</li>
      </UL>

      <Callout type="warning" title="Cloudflare Bans">
        Repeatedly hitting rate limits may result in temporary IP bans. Always handle 429 responses
        gracefully.
      </Callout>

      <H2 id="gateway-rate-limits">Gateway Rate Limits</H2>
      <P>
        The Gateway has its own rate limits: 120 events per 60 seconds. Identifying more than once
        per 5 seconds will result in an invalid session.
      </P>
    </DocPage>
  );
}
