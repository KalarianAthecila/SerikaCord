import { DocPage, P, H2, H3, UL, CodeBlock, Callout, Strong, InlineCode, Link2, Table } from "../../DocPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Rate Limits",
  description:
    "SerikaCord API rate limits: headers, buckets, global limits, 429 handling, Gateway limits, and best practices for avoiding rate limit errors.",
  path: "/developers/docs/topics/rate-limits",
  keywords: ["SerikaCord rate limits", "API throttling", "429", "rate limit headers", "bucket"],
});

export default function RateLimitsDoc() {
  return (
    <DocPage title="Rate Limits" description="Understand and handle API rate limits to keep your bot running smoothly.">
      <P>
        SerikaCord enforces rate limits to protect the API. Rate limits are applied per-route and
        per-bot (or per-token for OAuth2). All rate limit information is communicated via HTTP headers
        on every response.
      </P>

      <H2 id="headers">Rate Limit Headers</H2>
      <P>Every API response includes these headers:</P>
      <Table headers={["Header", "Description"]} rows={[
        ["X-RateLimit-Limit", "Maximum requests per window"],
        ["X-RateLimit-Remaining", "Remaining requests in current window"],
        ["X-RateLimit-Reset", "Epoch timestamp (seconds) when the window resets"],
        ["X-RateLimit-Reset-After", "Seconds until window resets (relative)"],
        ["X-RateLimit-Bucket", "Unique bucket identifier for this route"],
        ["X-RateLimit-Global", "True if global rate limit was hit"],
        ["Retry-After", "Seconds to wait before retrying (only on 429)"],
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
      <Table headers={["Field", "Type", "Description"]} rows={[
        ["message", "string", "Human-readable error message"],
        ["retry_after", "float", "Seconds to wait before retrying"],
        ["global", "boolean", "True if the global rate limit was hit (not per-route)"],
      ]} />

      <H2 id="bucket-types">Rate Limit Buckets</H2>
      <P>
        Routes are grouped into buckets. Requests to the same bucket share a rate limit. The bucket
        identifier is returned in the <InlineCode>X-RateLimit-Bucket</InlineCode> header.
      </P>
      <Table headers={["Route pattern", "Bucket type", "Typical limit"]} rows={[
        ["GET /channels/{id}/messages", "Per-channel", "5/5s"],
        ["POST /channels/{id}/messages", "Per-channel", "5/5s"],
        ["PUT /channels/{id}/messages/{id}/reactions/{emoji}/@me", "Per-channel", "1/0.25s"],
        ["DELETE /channels/{id}/messages/{id}", "Per-channel", "3/1s"],
        ["PATCH /guilds/{id}/members/{id}", "Per-guild", "10/10s"],
        ["GET /users/{id}", "Global", "Per-bot"],
        ["GET /gateway", "Global", "Per-bot"],
      ]} />
      <Callout type="info" title="Bucket hashing">
        The <InlineCode>X-RateLimit-Bucket</InlineCode> header is a hash of the route template (with
        IDs removed). Two requests to different channels hit different buckets; two requests to the
        same channel share a bucket.
      </Callout>

      <H2 id="global-rate-limit">Global Rate Limit</H2>
      <P>
        There is a global rate limit of <Strong>50 requests per second</Strong> across all routes. If
        exceeded, you&apos;ll receive a <InlineCode>429</InlineCode> with{" "}
        <InlineCode>global: true</InlineCode>. Global rate limits take precedence over per-route limits.
      </P>

      <H2 id="handling">Best Practices for Handling Rate Limits</H2>
      <UL>
        <li>Track <InlineCode>X-RateLimit-Remaining</InlineCode> and slow down before hitting 0</li>
        <li>Queue requests and process them sequentially per-bucket</li>
        <li>Respect <InlineCode>retry_after</InlineCode> — don&apos;t retry immediately</li>
        <li>Use exponential backoff for unexpected 429s</li>
        <li>Cache responses where possible to reduce API calls</li>
        <li>Use <InlineCode>GET</InlineCode> requests with <InlineCode>If-None-Match</InlineCode> for 304 caching</li>
        <li>Avoid burst requests — spread them out evenly</li>
        <li>Log rate limit headers to debug throttling issues</li>
      </UL>

      <H3 id="rate-limit-queue">Rate limit queue example (Node.js)</H3>
      <CodeBlock lang="javascript">{`class RateLimitQueue {
  constructor() {
    this.buckets = new Map(); // bucket -> { remaining, resetAfter }
  }

  async request(method, url, options) {
    const res = await fetch(url, options);

    // Update bucket info from headers
    const bucket = res.headers.get("X-RateLimit-Bucket");
    if (bucket) {
      this.buckets.set(bucket, {
        remaining: parseInt(res.headers.get("X-RateLimit-Remaining")),
        resetAfter: parseFloat(res.headers.get("X-RateLimit-Reset-After")),
      });
    }

    if (res.status === 429) {
      const body = await res.json();
      const wait = body.retry_after * 1000;
      await new Promise(r => setTimeout(r, wait));
      return this.request(method, url, options); // retry
    }

    return res;
  }
}`}</CodeBlock>

      <Callout type="warning" title="Cloudflare Bans">
        Repeatedly hitting rate limits may result in temporary IP bans. Always handle 429 responses
        gracefully and back off when instructed.
      </Callout>

      <H2 id="gateway-rate-limits">Gateway Rate Limits</H2>
      <P>
        The Gateway has its own rate limits separate from the REST API:
      </P>
      <Table headers={["Limit", "Value"]} rows={[
        ["Max events sent per 60 seconds", "120"],
        ["Max identifies per 5 seconds", "1"],
        ["Max concurrent identifies per 24 hours", "1,000"],
      ]} />
      <P>
        Exceeding the identify limit will result in an <InlineCode>Invalid Session</InlineCode> (op 8).
        Exceeding the event send limit may result in a close with code <InlineCode>4008</InlineCode>.
      </P>

      <H2 id="exempt-routes">Exempt Routes</H2>
      <P>
        Some routes are not rate limited or have very high limits:
      </P>
      <UL>
        <li><InlineCode>GET /gateway</InlineCode> — very high limit</li>
        <li><InlineCode>{"POST /interactions/{id}/{token}/callback"}</InlineCode> — exempt (must respond within 3s)</li>
      </UL>
    </DocPage>
  );
}
