/**
 * Last.fm "now scrobbling" fetcher.
 *
 * Last.fm has a public API endpoint (user.getRecentTracks) that requires
 * only an API key (no user auth) — perfect for showing "Currently Listening"
 * on profile cards from a manually-linked Last.fm username.
 *
 * Album cover art prefers Last.fm's own image URLs. When Last.fm returns no
 * art (or only its grey placeholder star), we fall back to the Cover Art
 * Archive (https://coverartarchive.org): first via any MusicBrainz MBID
 * Last.fm supplied, then by resolving the release-group MBID from the artist +
 * album name through the MusicBrainz search API.
 *
 * Results are cached per-username for CACHE_TTL_MS to keep load low even when
 * many profile cards are open at once.
 */

import { config } from '../config';

// Last.fm serves this exact image hash as its "no cover art" placeholder.
const LASTFM_PLACEHOLDER_HASH = '2a96cbd8b46e442fc41c2b86b821562f';
// Identify ourselves to MusicBrainz per their API etiquette requirements.
const MUSICBRAINZ_UA = 'SerikaCord/1.0 (https://serika.chat)';

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
const COVER_ART_TIMEOUT_MS = 6_000;
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
  // Last.fm's mbid may be a release or a release-group id — try both endpoints.
  for (const kind of ['release', 'release-group'] as const) {
    try {
      const res = await fetch(
        `https://coverartarchive.org/${kind}/${mbid}/front-500`,
        { redirect: 'manual', signal, cache: 'no-store' },
      );
      if ((res.status === 307 || res.status === 308) && res.headers.get('location')) {
        const location = res.headers.get('location')!;
        // Upgrade HTTP to HTTPS for security
        return location.startsWith('http://') ? 'https://' + location.slice(7) : location;
      }
    } catch {
      // try the next endpoint / give up
    }
  }
  return null;
}

/**
 * Resolve a MusicBrainz release-group MBID from an artist + album name via the
 * MusicBrainz search API — used when Last.fm didn't supply an mbid itself.
 */
async function lookupReleaseGroupMbid(artist: string, album: string, signal: AbortSignal): Promise<string | null> {
  try {
    const query = encodeURIComponent(`release:"${album}" AND artist:"${artist}"`);
    const res = await fetch(
      `https://musicbrainz.org/ws/2/release-group/?query=${query}&fmt=json&limit=1`,
      { signal, cache: 'no-store', headers: { 'User-Agent': MUSICBRAINZ_UA } },
    );
    if (!res.ok) return null;
    const data = await res.json() as { 'release-groups'?: Array<{ id?: string }> };
    return data['release-groups']?.[0]?.id || null;
  } catch {
    return null;
  }
}

/** Best real Last.fm cover image, ignoring the grey placeholder star. */
function pickLastFmImage(track: any): string | null {
  const images: Array<{ '#text': string; size: string }> = track.image || [];
  const url = images.find(img => img.size === 'extralarge')?.['#text']
    || images.find(img => img.size === 'large')?.['#text']
    || images.find(img => img.size === 'medium')?.['#text']
    || null;
  if (!url || url.includes(LASTFM_PLACEHOLDER_HASH)) return null;
  return url;
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

    // Prefer Last.fm's own art; fall back to the Cover Art Archive when Last.fm
    // has none (or only its placeholder star).
    let albumArt: string | null = pickLastFmImage(track);

    if (!albumArt) {
      const coverController = new AbortController();
      const coverTimeout = setTimeout(() => coverController.abort(), COVER_ART_TIMEOUT_MS);
      try {
        const albumMbid: string | undefined = track.album?.mbid;
        if (albumMbid) {
          albumArt = await fetchCoverArtUrl(albumMbid, coverController.signal);
        }
        // No mbid from Last.fm (common) — resolve one from artist + album.
        if (!albumArt) {
          const artist = track.artist?.['#text'] || track.artist?.name;
          const album = track.album?.['#text'];
          if (artist && album) {
            const rgMbid = await lookupReleaseGroupMbid(artist, album, coverController.signal);
            if (rgMbid) albumArt = await fetchCoverArtUrl(rgMbid, coverController.signal);
          }
        }
      } finally {
        clearTimeout(coverTimeout);
      }
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
