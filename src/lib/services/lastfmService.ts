/**
 * Last.fm "now scrobbling" fetcher.
 *
 * Last.fm has a public API endpoint (user.getRecentTracks) that requires
 * only an API key (no user auth) — perfect for showing "Currently Listening"
 * on profile cards from a manually-linked Last.fm username.
 *
 * Album cover art is fetched from the Cover Art Archive
 * (https://coverartarchive.org) using the MusicBrainz release-group MBID
 * returned by Last.fm. If the Cover Art Archive has no art for the release,
 * we fall back to the image URLs provided by Last.fm.
 *
 * Results are cached per-username for CACHE_TTL_MS to keep load low even when
 * many profile cards are open at once.
 */

import { config } from '../config';

export interface LastFmTrack {
  name: string;
  artist: string;
  album: string | null;
  albumArt: string | null;
  url: string;
  nowPlaying: boolean;
}

interface CacheEntry {
  value: LastFmTrack | null;
  expiresAt: number;
}

const CACHE_TTL_MS = 30_000;
const REQUEST_TIMEOUT_MS = 5_000;
const COVER_ART_TIMEOUT_MS = 3_000;
const cache = new Map<string, CacheEntry>();

/**
 * Fetch the front-cover thumbnail (500px) URL from the Cover Art Archive
 * for a given MusicBrainz release-group MBID.
 *
 * The Cover Art Archive responds with a 307 redirect to the actual image
 * on archive.org. We use `redirect: 'manual'` to capture the Location
 * header without downloading the image bytes.
 */
async function fetchCoverArtUrl(mbid: string, signal: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch(
      `https://coverartarchive.org/release-group/${mbid}/front-500`,
      { redirect: 'manual', signal, cache: 'no-store' },
    );
    if ((res.status === 307 || res.status === 308) && res.headers.get('location')) {
      const location = res.headers.get('location')!;
      // Upgrade HTTP to HTTPS for security
      return location.startsWith('http://') ? 'https://' + location.slice(7) : location;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getLastFmNowPlaying(username: string): Promise<LastFmTrack | null> {
  const apiKey = config.LASTFM_API_KEY;
  if (!username || !apiKey) return null;

  const key = username.toLowerCase();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${apiKey}&format=json&limit=1`;
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });

    if (!res.ok) {
      cache.set(key, { value: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return null;
    }

    const data = await res.json() as Record<string, unknown>;
    const tracks = (data as any)?.recenttracks?.track;
    if (!tracks) {
      cache.set(key, { value: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return null;
    }

    const track = Array.isArray(tracks) ? tracks[0] : tracks;
    if (!track) {
      cache.set(key, { value: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return null;
    }

    const isNowPlaying = track['@attr']?.nowplaying === 'true';

    // Only return if actually scrobbling right now
    if (!isNowPlaying) {
      cache.set(key, { value: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return null;
    }

    // Try Cover Art Archive first using the album's MusicBrainz release-group MBID
    let albumArt: string | null = null;
    const albumMbid = track.album?.mbid;
    if (albumMbid) {
      const coverController = new AbortController();
      const coverTimeout = setTimeout(() => coverController.abort(), COVER_ART_TIMEOUT_MS);
      albumArt = await fetchCoverArtUrl(albumMbid, coverController.signal);
      clearTimeout(coverTimeout);
    }

    // Fall back to Last.fm's own image URLs if Cover Art Archive had nothing
    if (!albumArt) {
      const images: Array<{ '#text': string; size: string }> = track.image || [];
      albumArt = images.find(img => img.size === 'extralarge')?.['#text']
        || images.find(img => img.size === 'large')?.['#text']
        || null;
    }

    const value: LastFmTrack = {
      name: track.name || 'Unknown Track',
      artist: track.artist?.['#text'] || track.artist?.name || 'Unknown Artist',
      album: track.album?.['#text'] || null,
      albumArt: albumArt || null,
      url: track.url || `https://www.last.fm/user/${username}`,
      nowPlaying: true,
    };

    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  } catch {
    cache.set(key, { value: null, expiresAt: Date.now() + CACHE_TTL_MS });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
