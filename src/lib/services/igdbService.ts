/**
 * IGDB (igdb.com) game metadata proxy.
 *
 * IGDB authenticates via Twitch application tokens, so we reuse SerikaCord's
 * Twitch client credentials (see config.TWITCH_CLIENT_ID/SECRET). Secrets never
 * leave the server — the desktop client only ever talks to our proxy endpoint.
 *
 * Docs: https://api-docs.igdb.com/#authentication
 */

import { config } from '../config';

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_BASE = 'https://api.igdb.com/v4';

export interface IgdbGame {
  id: number;
  name: string;
  /** Absolute https URL to a cover image (t_cover_big), if available. */
  coverUrl: string | null;
  summary: string | null;
}

interface TokenState {
  token: string;
  /** Epoch ms at which the token should be considered expired. */
  expiresAt: number;
}

let tokenState: TokenState | null = null;
let inflightToken: Promise<string | null> | null = null;

// Cache resolved lookups (by normalized query) so repeated presence heartbeats
// for the same game don't hammer IGDB.
const RESULT_TTL_MS = 60 * 60 * 1000; // 1 hour
const resultCache = new Map<string, { value: IgdbGame | null; expiresAt: number }>();

function haveCredentials(): boolean {
  return Boolean(config.TWITCH_CLIENT_ID && config.TWITCH_CLIENT_SECRET);
}

/** Fetch (and cache) a Twitch app access token for IGDB. */
async function getAccessToken(): Promise<string | null> {
  if (!haveCredentials()) return null;
  if (tokenState && tokenState.expiresAt > Date.now() + 60_000) return tokenState.token;
  if (inflightToken) return inflightToken;

  inflightToken = (async () => {
    try {
      const params = new URLSearchParams({
        client_id: config.TWITCH_CLIENT_ID,
        client_secret: config.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
      });
      const res = await fetch(`${TWITCH_TOKEN_URL}?${params.toString()}`, { method: 'POST' });
      if (!res.ok) return null;
      const data = (await res.json()) as { access_token?: string; expires_in?: number };
      if (!data.access_token) return null;
      tokenState = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
      };
      return tokenState.token;
    } catch {
      return null;
    } finally {
      inflightToken = null;
    }
  })();

  return inflightToken;
}

/** Upgrade an IGDB image reference to a full https cover URL. */
function coverUrlFromImageId(imageId: string | undefined): string | null {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
}

/**
 * Resolve a running application/executable name to a known IGDB game.
 * Returns null when nothing confidently matches (or credentials are missing).
 */
export async function lookupGame(query: string): Promise<IgdbGame | null> {
  const q = query.trim();
  if (!q) return null;

  const key = q.toLowerCase();
  const cached = resultCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const token = await getAccessToken();
  if (!token) return null;

  try {
    // IGDB uses its own Apicalypse query language in the POST body.
    const escaped = q.replace(/"/g, '\\"');
    const body = `search "${escaped}"; fields name,cover.image_id,summary; where category = (0,8,9,11) & version_parent = null; limit 5;`;
    const res = await fetch(`${IGDB_BASE}/games`, {
      method: 'POST',
      headers: {
        'Client-ID': config.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'text/plain',
        Accept: 'application/json',
      },
      body,
    });

    if (res.status === 401) {
      // Token might have been revoked — drop it so the next call refreshes.
      tokenState = null;
    }
    if (!res.ok) {
      resultCache.set(key, { value: null, expiresAt: Date.now() + RESULT_TTL_MS });
      return null;
    }

    const rows = (await res.json()) as Array<{
      id: number;
      name: string;
      summary?: string;
      cover?: { image_id?: string };
    }>;

    if (!Array.isArray(rows) || rows.length === 0) {
      resultCache.set(key, { value: null, expiresAt: Date.now() + RESULT_TTL_MS });
      return null;
    }

    // Prefer an exact (case-insensitive) name match, else the top search hit.
    const exact = rows.find((r) => r.name?.toLowerCase() === key);
    const chosen = exact ?? rows[0];

    const value: IgdbGame = {
      id: chosen.id,
      name: chosen.name,
      coverUrl: coverUrlFromImageId(chosen.cover?.image_id),
      summary: chosen.summary ?? null,
    };
    resultCache.set(key, { value, expiresAt: Date.now() + RESULT_TTL_MS });
    return value;
  } catch {
    return null;
  }
}
