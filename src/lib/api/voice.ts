import { Elysia, t } from 'elysia';
import { authenticateRequest } from '@/lib/services/auth';
import { config } from '@/lib/config';

async function getAuth(headers: Record<string, string | undefined>, cookie: Record<string, { value?: unknown }>) {
  const authHeader = headers.authorization ?? null;
  const authToken = cookie.auth_token?.value;
  const cookies: Record<string, string> = {};
  if (typeof authToken === 'string') {
    cookies.auth_token = authToken;
  }
  return authenticateRequest(authHeader, cookies);
}

type VoiceParticipant = {
  userId: string;
  username: string;
  audio: boolean;
  video: boolean;
  joinedAt: string;
};

const roomState = new Map<string, Map<string, VoiceParticipant>>();

function getRoom(roomId: string) {
  if (!roomState.has(roomId)) {
    roomState.set(roomId, new Map());
  }
  return roomState.get(roomId)!;
}

export const voiceRoutes = new Elysia({ prefix: '/voice' })
  .post('/token', async ({ headers, cookie, body, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!config.FEATURE_FLAGS.voice_video_enabled) {
      set.status = 503;
      return { error: 'Voice/video is disabled' };
    }

    const roomId = body.roomId;
    const expiresAt = Date.now() + 5 * 60 * 1000;

    return {
      token: `local-${user._id}-${roomId}-${expiresAt}`,
      roomId,
      expiresAt,
      provider: 'local',
    };
  }, {
    body: t.Object({
      roomId: t.String({ minLength: 1 }),
      channelId: t.Optional(t.String()),
    }),
  })
  .post('/join', async ({ headers, cookie, body, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    const room = getRoom(body.roomId);
    room.set(user._id.toString(), {
      userId: user._id.toString(),
      username: user.displayName || user.username,
      audio: body.audio ?? true,
      video: body.video ?? false,
      joinedAt: new Date().toISOString(),
    });

    return {
      success: true,
      roomId: body.roomId,
      participants: Array.from(room.values()),
    };
  }, {
    body: t.Object({
      roomId: t.String({ minLength: 1 }),
      channelId: t.Optional(t.String()),
      audio: t.Optional(t.Boolean()),
      video: t.Optional(t.Boolean()),
    }),
  })
  .post('/leave', async ({ headers, cookie, body, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    const room = roomState.get(body.roomId);
    if (!room) {
      return { success: true };
    }

    room.delete(user._id.toString());
    if (room.size === 0) {
      roomState.delete(body.roomId);
    }

    return {
      success: true,
      roomId: body.roomId,
      participants: room ? Array.from(room.values()) : [],
    };
  }, {
    body: t.Object({
      roomId: t.String({ minLength: 1 }),
    }),
  })
  .get('/state/:roomId', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    const room = roomState.get(params.roomId);
    return {
      roomId: params.roomId,
      participants: room ? Array.from(room.values()) : [],
    };
  }, {
    params: t.Object({
      roomId: t.String(),
    }),
  });
