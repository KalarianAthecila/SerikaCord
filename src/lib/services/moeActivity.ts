import { config } from '../config';

/**
 * Client for serika.moe's live "now watching" presence.
 *
 * A SerikaCord user's `_id` is the same id as their Serika account (see
 * src/lib/services/auth.ts), and serika.moe stores the account link keyed by
 * that id. So we can ask serika.moe "what is account <userId> watching?"
 * directly, guarded by a shared service key.
 *
 * Results are cached briefly so profile cards / member lists that render many
 * users don't hammer serika.moe.
 */

export interface MoeActivity {
  titleName: string;
  episodeName: string | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  progressSeconds: number;
  durationSeconds: number | null;
  posterUrl: string | null;
  isPaused: boolean;
  startedAt: string;
  updatedAt: string;
}

interface CacheEntry {
  value: MoeActivity | null;
  expiresAt: number;
}

const CACHE_TTL_MS = 20_000;
const REQUEST_TIMEOUT_MS = 5_000;
const cache = new Map<string, CacheEntry>();

/**
 * Fetch the live watch activity for a Serika account id (== SerikaCord user id).
 * Returns null when the account isn't linked, isn't watching, or on any error.
 */
export async function getMoeActivity(accountId: string): Promise<MoeActivity | null> {
  if (!accountId || !config.SERIKA_MOE_SERVICE_KEY) return null;

  const cached = cache.get(accountId);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `${config.SERIKA_MOE_URL}/api/serika-account/status?accountId=${encodeURIComponent(accountId)}`;
    const res = await fetch(url, {
      headers: { 'x-service-key': config.SERIKA_MOE_SERVICE_KEY },
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!res.ok) {
      cache.set(accountId, { value: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return null;
    }

    const data = (await res.json()) as { linked?: boolean; activity?: MoeActivity | null };
    const value = data.activity ?? null;
    cache.set(accountId, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  } catch {
    // Network error / timeout — treat as "not watching", cache briefly.
    cache.set(accountId, { value: null, expiresAt: Date.now() + CACHE_TTL_MS });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
