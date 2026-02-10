import { Elysia, t } from 'elysia';
import { authenticateRequest } from '@/lib/services/auth';

type GifItem = {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  source: 'serika';
  tags: string[];
};

const SERIKA_GIFS_API = process.env.SERIKA_GIFS_API || 'https://gifs.serika.dev/api';

async function getAuth(headers: Record<string, string | undefined>, cookie: Record<string, { value?: unknown }>) {
  const authHeader = headers.authorization ?? null;
  const authToken = cookie.auth_token?.value;
  const cookies: Record<string, string> = {};
  if (typeof authToken === 'string') {
    cookies.auth_token = authToken;
  }
  return authenticateRequest(authHeader, cookies);
}

async function searchSerikaGifs(query: string, limit: number): Promise<GifItem[]> {
  const endpoint = query.trim().length > 0
    ? `${SERIKA_GIFS_API}/gifs?search=${encodeURIComponent(query)}&limit=${limit}&page=1`
    : `${SERIKA_GIFS_API}/gifs?sort=trending&limit=${limit}&page=1`;

  const headers: HeadersInit = {};
  if (process.env.SERIKA_GIFS_API_KEY) {
    headers['X-API-Key'] = process.env.SERIKA_GIFS_API_KEY;
  }

  const res = await fetch(endpoint, { headers });
  if (!res.ok) {
    return [];
  }

  const data = await res.json() as {
    gifs?: Array<{
      id?: string;
      slug?: string;
      title?: string;
      url?: string;
      thumbnailUrl?: string;
      tags?: Array<{ name?: string; slug?: string } | string>;
    }>;
  };

  const gifs: GifItem[] = [];
  for (const item of data.gifs || []) {
    const gifUrl = item.url;
    if (!gifUrl) continue;

    const tags = (item.tags || []).map((tag) => {
      if (typeof tag === 'string') return tag;
      return tag.slug || tag.name || '';
    }).filter(Boolean);

    gifs.push({
      id: item.id || item.slug || gifUrl,
      title: item.title || 'GIF',
      url: gifUrl,
      previewUrl: item.thumbnailUrl || gifUrl,
      source: 'serika',
      tags,
    });
  }
  return gifs;
}

export const gifRoutes = new Elysia({ prefix: '/gifs' })
  .get('/search', async ({ headers, cookie, query, set }) => {
    const { user, error } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: error || 'Unauthorized' };
    }

    const q = (query.q || '').trim();
    const limit = Math.min(parseInt(query.limit || '24', 10), 50);

    try {
      const serikaResults = await searchSerikaGifs(q, limit);
      return { gifs: serikaResults };
    } catch {
      set.status = 502;
      return { error: 'Serika GIF service is unavailable', gifs: [] };
    }
  }, {
    query: t.Object({
      q: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  });
