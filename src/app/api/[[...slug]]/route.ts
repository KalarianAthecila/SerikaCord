import { api, initializeAPI } from '@/lib/api';

// Initialize on first request
let initialized = false;
let initError: Error | null = null;

async function ensureInit() {
  if (initError) throw initError;
  if (!initialized) {
    try {
      await initializeAPI();
      initialized = true;
    } catch (err) {
      initError = err as Error;
      throw err;
    }
  }
}

function handleError(err: unknown): Response {
  console.error('[API Route] Unhandled error:', err);
  return new Response(JSON.stringify({ error: 'Internal server error', detail: err instanceof Error ? err.message : String(err) }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET = async (request: Request) => {
  try {
    await ensureInit();
    return await api.handle(request);
  } catch (err) {
    return handleError(err);
  }
};

export const POST = async (request: Request) => {
  try {
    await ensureInit();
    return await api.handle(request);
  } catch (err) {
    return handleError(err);
  }
};

export const PUT = async (request: Request) => {
  try {
    await ensureInit();
    return await api.handle(request);
  } catch (err) {
    return handleError(err);
  }
};

export const PATCH = async (request: Request) => {
  try {
    await ensureInit();
    return await api.handle(request);
  } catch (err) {
    return handleError(err);
  }
};

export const DELETE = async (request: Request) => {
  try {
    await ensureInit();
    return await api.handle(request);
  } catch (err) {
    return handleError(err);
  }
};
