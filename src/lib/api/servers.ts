import { Elysia, t } from 'elysia';
import { Server, Channel, Role, ServerMember, Invite, ServerEmoji, ServerSticker, ServerBan, AdminLog } from '@/lib/models';
import { authenticateRequest } from '@/lib/services/auth';
import { checkRateLimit, getClientIP, sanitizeInput, isValidObjectId } from '@/lib/security';
import { cache } from '@/lib/db';
import { nanoid } from 'nanoid';
import { config } from '@/lib/config';
import { resolveEffectiveStatus } from '@/lib/services/presence';
import { Types } from 'mongoose';

// Helper function for auth
async function getAuth(headers: Record<string, string | undefined>, cookie: Record<string, { value?: unknown }>) {
  const authHeader = headers.authorization ?? null;
  const authToken = cookie.auth_token?.value;
  const cookies: Record<string, string> = {};
  if (typeof authToken === 'string') {
    cookies.auth_token = authToken;
  }
  return authenticateRequest(authHeader, cookies);
}

// Default permissions
const DEFAULT_PERMISSIONS = {
  everyone: '1071698660929',
  admin: '8',
};

interface PopulatedRole {
  _id: Types.ObjectId;
  name: string;
  color?: number | string | null;
  position?: number;
  permissions?: string;
  hoist?: boolean;
  mentionable?: boolean;
  managed?: boolean;
  isDefault?: boolean;
}

interface PopulatedMemberUser {
  _id: Types.ObjectId;
  username: string;
  displayName?: string;
  avatar?: string;
  status?: string;
  customStatus?: string;
  isPremium?: boolean;
  presenceLastHeartbeatAt?: Date | null;
}

function normalizeRoleColor(color?: number | string | null): string {
  if (typeof color === 'number' && Number.isFinite(color)) {
    return `#${Math.max(0, color).toString(16).padStart(6, '0').toUpperCase()}`;
  }

  if (typeof color === 'string' && color.trim()) {
    const stripped = color.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{6}$/.test(stripped)) {
      return `#${stripped.toUpperCase()}`;
    }
    const asNumber = Number.parseInt(stripped, 16);
    if (Number.isFinite(asNumber)) {
      return `#${Math.max(0, asNumber).toString(16).padStart(6, '0').toUpperCase()}`;
    }
  }

  return '#99AAB5';
}

function parseHexColorToNumber(color?: string | null): number {
  if (!color) return 0x99aab5;
  const stripped = color.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(stripped)) return 0x99aab5;
  return Number.parseInt(stripped, 16);
}

function normalizeRoleDto(role: PopulatedRole, memberCount: number = 0) {
  return {
    id: role._id.toString(),
    name: role.name,
    color: normalizeRoleColor(role.color),
    position: role.position ?? 0,
    permissions: role.permissions || '0',
    hoist: Boolean(role.hoist),
    mentionable: Boolean(role.mentionable),
    managed: Boolean(role.managed),
    isDefault: Boolean(role.isDefault),
    memberCount,
  };
}

async function getRoleMemberCountMap(serverId: string): Promise<Map<string, number>> {
  const aggregated = await ServerMember.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { serverId: new Types.ObjectId(serverId) } },
    { $unwind: '$roles' },
    { $group: { _id: '$roles', count: { $sum: 1 } } },
  ]);

  return new Map(aggregated.map((item) => [item._id.toString(), item.count]));
}

async function getNormalizedRoles(serverId: string) {
  const roles = await Role.find({ serverId }).sort({ position: -1 });
  const memberCountMap = await getRoleMemberCountMap(serverId);
  return roles.map((role) =>
    normalizeRoleDto(role as unknown as PopulatedRole, memberCountMap.get(role._id.toString()) || 0)
  );
}

function normalizeMemberDto(member: {
  _id: Types.ObjectId;
  userId?: PopulatedMemberUser | null;
  roles?: PopulatedRole[];
  joinedAt?: Date;
}) {
  const memberRoles = (member.roles || [])
    .map((role) => normalizeRoleDto(role))
    .sort((a, b) => b.position - a.position);
  const highestRole = memberRoles[0] || null;
  const highestHoistedRole = memberRoles.find((role) => role.hoist) || null;
  const userData = member.userId;

  return {
    id: userData?._id?.toString() || '',
    membershipId: member._id.toString(),
    username: userData?.username || 'Unknown',
    displayName: userData?.displayName || userData?.username || 'Unknown',
    avatar: userData?.avatar || null,
    status: resolveEffectiveStatus({
      status: userData?.status || 'offline',
      presenceLastHeartbeatAt: userData?.presenceLastHeartbeatAt || null,
    }),
    customStatus: userData?.customStatus || null,
    isPremium: Boolean(userData?.isPremium),
    joinedAt: member.joinedAt || null,
    roles: memberRoles,
    highestRole,
    highestHoistedRole,
  };
}

export const serverRoutes = new Elysia({ prefix: '/servers' })
  // Get user's servers
  .get('/', async ({ headers, cookie, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    const memberships = await ServerMember.find({ userId: user._id })
      .populate({
        path: 'serverId',
        select: 'name icon banner ownerId memberCount onlineCount features premiumTier',
      });

    const servers = memberships
      .filter(m => m.serverId)
      .map(m => ({
        ...(m.serverId as unknown as { toJSON: () => Record<string, unknown> }).toJSON(),
        joinedAt: m.joinedAt,
        roles: m.roles,
      }));

    return { servers };
  })
  // Create server
  .post('/', async ({ headers, cookie, body, request, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    // Rate limit server creation
    const ip = getClientIP(request);
    const rateLimit = await checkRateLimit('serverCreate', `${user._id}:${ip}`);
    if (!rateLimit.success) {
      set.status = 429;
      return { error: 'Server creation rate limited', retryAfter: rateLimit.retryAfter };
    }

    // Check server limit
    const serverCount = await ServerMember.countDocuments({ userId: user._id });
    if (serverCount >= config.MAX_SERVERS_PER_USER) {
      set.status = 400;
      return { error: `You can only be in ${config.MAX_SERVERS_PER_USER} servers` };
    }

    const { name, icon } = body;
    const sanitizedName = sanitizeInput(name);

    // Create server
    const server = new Server({
      name: sanitizedName,
      icon,
      ownerId: user._id,
      memberCount: 1,
    });

    await server.save();

    // Create @everyone role
    const everyoneRole = new Role({
      serverId: server._id,
      name: '@everyone',
      position: 0,
      permissions: DEFAULT_PERMISSIONS.everyone,
      isDefault: true,
    });

    await everyoneRole.save();

    // Create default channels
    const textCategory = new Channel({
      serverId: server._id,
      name: 'Text Channels',
      type: 'category',
      position: 0,
    });

    await textCategory.save();

    const generalChannel = new Channel({
      serverId: server._id,
      name: 'general',
      type: 'text',
      position: 0,
      parentId: textCategory._id,
    });

    await generalChannel.save();

    // Create voice category and channel
    const voiceCategory = new Channel({
      serverId: server._id,
      name: 'Voice Channels',
      type: 'category',
      position: 1,
    });

    await voiceCategory.save();

    const generalVoice = new Channel({
      serverId: server._id,
      name: 'General',
      type: 'voice',
      position: 0,
      parentId: voiceCategory._id,
    });

    await generalVoice.save();

    // Set system channel
    server.systemChannelId = generalChannel._id;
    await server.save();

    // Add owner as member
    const membership = new ServerMember({
      serverId: server._id,
      userId: user._id,
      roles: [everyoneRole._id],
    });

    await membership.save();

    return {
      success: true,
      server: {
        ...server.toJSON(),
        channels: [textCategory, generalChannel, voiceCategory, generalVoice],
        roles: [everyoneRole],
      },
    };
  }, {
    body: t.Object({
      name: t.String({ minLength: 2, maxLength: 100 }),
      icon: t.Optional(t.String()),
    }),
  })
  // Create channel in server
  .post('/:serverId/channels', async ({ headers, cookie, params, body, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    const isBanned = await ServerBan.exists({ serverId: server._id, userId: user._id });
    if (isBanned) {
      set.status = 403;
      return { error: 'You are banned from this server' };
    }

    // Check if owner or has manage channels permission
    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'You do not have permission to create channels' };
    }

    const { name, type = 'text', parentId } = body;
    const sanitizedName = sanitizeInput(name);

    // If parentId provided, verify it's a valid category
    if (parentId) {
      const parentChannel = await Channel.findById(parentId);
      if (!parentChannel || parentChannel.type !== 'category') {
        set.status = 400;
        return { error: 'Invalid parent category' };
      }
    }

    // Get highest position in parent or server
    const highestChannel = await Channel.findOne({
      serverId: server._id,
      parentId: parentId || null,
    }).sort({ position: -1 });

    const position = highestChannel ? highestChannel.position + 1 : 0;

    const channel = new Channel({
      serverId: server._id,
      name: sanitizedName,
      type,
      position,
      parentId: parentId || null,
    });

    await channel.save();

    return {
      success: true,
      channel,
    };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
    body: t.Object({
      name: t.String({ minLength: 1, maxLength: 100 }),
      type: t.Optional(t.Union([t.Literal('text'), t.Literal('voice'), t.Literal('announcement'), t.Literal('category')])),
      parentId: t.Optional(t.String()),
    }),
  })
  // Get server details
  .get('/:serverId', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    // Check membership
    const membership = await ServerMember.findOne({
      serverId: params.serverId,
      userId: user._id,
    });

    if (!membership) {
      set.status = 403;
      return { error: 'You are not a member of this server' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    const channels = await Channel.find({ serverId: server._id }).sort({ position: 1 });
    const roles = await Role.find({ serverId: server._id }).sort({ position: -1 });

    return {
      server: {
        ...server.toJSON(),
        channels,
        roles,
        member: membership,
      },
    };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
  })
  // Get server settings
  .get('/:serverId/settings', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    const membership = await ServerMember.findOne({
      serverId: server._id,
      userId: user._id,
    });
    if (!membership) {
      set.status = 403;
      return { error: 'You are not a member of this server' };
    }

    return {
      settings: {
        widget: server.settings?.widget || { enabled: true, channelId: null },
        moderation: {
          verificationLevel: server.settings?.moderation?.verificationLevel || server.verificationLevel,
          explicitContentFilter: server.settings?.moderation?.explicitContentFilter || server.explicitContentFilter,
          require2FA: server.settings?.moderation?.require2FA || false,
        },
        safety: server.settings?.safety || { raidProtection: false, antiSpam: true, mentionSpamLimit: 5 },
        integrations: server.settings?.integrations || {
          discord: false,
          twitch: false,
          youtube: false,
          webhooks: false,
        },
        soundboard: server.settings?.soundboard || {
          enabled: true,
          volume: 100,
        },
      },
    };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
  })
  // Update server settings
  .patch('/:serverId/settings', async ({ headers, cookie, params, body, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'You do not have permission to edit this server' };
    }

    const payload = body as any;
    const nextSettings = {
      ...(server.settings || {}),
      ...(payload.settings || {}),
      widget: {
        ...(server.settings?.widget || {}),
        ...(payload.settings?.widget || {}),
      },
      moderation: {
        ...(server.settings?.moderation || {}),
        ...(payload.settings?.moderation || {}),
      },
      safety: {
        ...(server.settings?.safety || {}),
        ...(payload.settings?.safety || {}),
      },
      integrations: {
        ...(server.settings?.integrations || {}),
        ...(payload.settings?.integrations || {}),
      },
      soundboard: {
        ...(server.settings?.soundboard || {}),
        ...(payload.settings?.soundboard || {}),
      },
    } as any;

    if (nextSettings.moderation?.verificationLevel) {
      server.verificationLevel = nextSettings.moderation.verificationLevel;
    }
    if (nextSettings.moderation?.explicitContentFilter) {
      server.explicitContentFilter = nextSettings.moderation.explicitContentFilter;
    }

    server.settings = nextSettings;
    await server.save();
    await cache.del(`server:${server._id}`);

    return {
      success: true,
      settings: server.settings,
    };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
    body: t.Object({
      settings: t.Object({}, { additionalProperties: true }),
    }),
  })
  // Update server
  .patch('/:serverId', async ({ headers, cookie, params, body, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    // Check if owner or has manage server permission
    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'You do not have permission to edit this server' };
    }

    const { name, description, icon, banner, systemChannelId, rulesChannelId, afkChannelId, afkTimeout, verificationLevel, explicitContentFilter } = body;

    if (name !== undefined) server.name = sanitizeInput(name);
    if (description !== undefined) server.description = sanitizeInput(description);
    if (icon !== undefined) server.icon = icon;
    if (banner !== undefined) server.banner = banner;
    if (systemChannelId !== undefined) server.systemChannelId = systemChannelId || undefined;
    if (rulesChannelId !== undefined) server.rulesChannelId = rulesChannelId || undefined;
    if (afkChannelId !== undefined) server.afkChannelId = afkChannelId || undefined;
    if (afkTimeout !== undefined) server.afkTimeout = afkTimeout;
    if (verificationLevel !== undefined) server.verificationLevel = verificationLevel;
    if (explicitContentFilter !== undefined) server.explicitContentFilter = explicitContentFilter;

    // Keep extended settings document in sync with legacy fields
    server.settings = {
      ...(server.settings || {}),
      moderation: {
        ...(server.settings?.moderation || {}),
        verificationLevel: verificationLevel ?? server.settings?.moderation?.verificationLevel ?? server.verificationLevel,
        explicitContentFilter: explicitContentFilter ?? server.settings?.moderation?.explicitContentFilter ?? server.explicitContentFilter,
      },
      widget: {
        enabled: server.settings?.widget?.enabled ?? true,
        channelId: server.settings?.widget?.channelId ?? null,
      },
      safety: {
        raidProtection: server.settings?.safety?.raidProtection ?? false,
        antiSpam: server.settings?.safety?.antiSpam ?? true,
        mentionSpamLimit: server.settings?.safety?.mentionSpamLimit ?? 5,
      },
      integrations: {
        discord: server.settings?.integrations?.discord ?? false,
        twitch: server.settings?.integrations?.twitch ?? false,
        youtube: server.settings?.integrations?.youtube ?? false,
        webhooks: server.settings?.integrations?.webhooks ?? false,
      },
      soundboard: {
        enabled: server.settings?.soundboard?.enabled ?? true,
        volume: server.settings?.soundboard?.volume ?? 100,
      },
    } as any;

    await server.save();

    // Invalidate cache
    await cache.del(`server:${server._id}`);

    return { success: true, server };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
      description: t.Optional(t.String({ maxLength: 1024 })),
      icon: t.Optional(t.Union([t.String(), t.Null()])),
      banner: t.Optional(t.Union([t.String(), t.Null()])),
      systemChannelId: t.Optional(t.Union([t.String(), t.Null()])),
      rulesChannelId: t.Optional(t.Union([t.String(), t.Null()])),
      afkChannelId: t.Optional(t.Union([t.String(), t.Null()])),
      afkTimeout: t.Optional(t.Number()),
      verificationLevel: t.Optional(t.Union([
        t.Literal('none'),
        t.Literal('low'),
        t.Literal('medium'),
        t.Literal('high'),
        t.Literal('very_high'),
      ])),
      explicitContentFilter: t.Optional(t.Union([
        t.Literal('disabled'),
        t.Literal('members_without_roles'),
        t.Literal('all_members'),
      ])),
    }),
  })
  // Delete server
  .delete('/:serverId', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'Only the server owner can delete the server' };
    }

    // Delete all related data
    await Promise.all([
      Channel.deleteMany({ serverId: server._id }),
      Role.deleteMany({ serverId: server._id }),
      ServerMember.deleteMany({ serverId: server._id }),
      Invite.deleteMany({ serverId: server._id }),
    ]);

    await server.deleteOne();

    return { success: true };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
  })
  // Get server members
  .get('/:serverId/members', async ({ headers, cookie, params, query, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    const membership = await ServerMember.findOne({
      serverId: params.serverId,
      userId: user._id,
    });

    if (!membership) {
      set.status = 403;
      return { error: 'You are not a member of this server' };
    }

    const limit = Math.min(parseInt(query.limit || '50'), 1000);
    const after = query.after;

    const filter: Record<string, unknown> = { serverId: params.serverId };
    if (after) {
      filter._id = { $gt: after };
    }

    const members = await ServerMember.find(filter)
      .limit(limit)
      .populate('userId', 'username displayName avatar status customStatus isPremium presenceLastHeartbeatAt')
      .populate('roles', 'name color position permissions hoist mentionable managed isDefault');

    return {
      members: members.map((member) =>
        normalizeMemberDto(member as unknown as {
          _id: Types.ObjectId;
          userId?: PopulatedMemberUser | null;
          roles?: PopulatedRole[];
          joinedAt?: Date;
        })
      ),
    };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
    query: t.Object({
      limit: t.Optional(t.String()),
      after: t.Optional(t.String()),
    }),
  })
  // Assign member roles
  .patch('/:serverId/members/:memberUserId/roles', async ({ headers, cookie, params, body, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId) || !isValidObjectId(params.memberUserId)) {
      set.status = 400;
      return { error: 'Invalid ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'Only the server owner can assign roles' };
    }

    const member = await ServerMember.findOne({
      serverId: params.serverId,
      userId: params.memberUserId,
    });

    if (!member) {
      set.status = 404;
      return { error: 'Member not found' };
    }

    const everyoneRole = await Role.findOne({
      serverId: params.serverId,
      isDefault: true,
    });

    if (!everyoneRole) {
      set.status = 500;
      return { error: 'Default role is missing for this server' };
    }

    const requestedRoleIds = Array.from(new Set((body.roleIds || []).filter((id): id is string => isValidObjectId(id))));
    const requestedWithEveryone = Array.from(new Set([everyoneRole._id.toString(), ...requestedRoleIds]));

    const validRoles = await Role.find({
      serverId: params.serverId,
      _id: { $in: requestedWithEveryone.map((id) => new Types.ObjectId(id)) },
    }).select('_id');

    if (validRoles.length !== requestedWithEveryone.length) {
      set.status = 400;
      return { error: 'One or more provided role IDs are invalid for this server' };
    }

    member.roles = requestedWithEveryone.map((id) => new Types.ObjectId(id));
    await member.save();

    const populatedMember = await ServerMember.findById(member._id)
      .populate('userId', 'username displayName avatar status customStatus isPremium presenceLastHeartbeatAt')
      .populate('roles', 'name color position permissions hoist mentionable managed isDefault');

    if (!populatedMember) {
      set.status = 404;
      return { error: 'Member not found' };
    }

    return {
      member: normalizeMemberDto(populatedMember as unknown as {
        _id: Types.ObjectId;
        userId?: PopulatedMemberUser | null;
        roles?: PopulatedRole[];
        joinedAt?: Date;
      }),
    };
  }, {
    params: t.Object({
      serverId: t.String(),
      memberUserId: t.String(),
    }),
    body: t.Object({
      roleIds: t.Array(t.String()),
    }),
  })
  // Leave server
  .delete('/:serverId/members/@me', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    if (server.ownerId.equals(user._id)) {
      set.status = 400;
      return { error: 'Server owner cannot leave. Transfer ownership first or delete the server.' };
    }

    await ServerMember.deleteOne({
      serverId: params.serverId,
      userId: user._id,
    });

    // Update member count
    server.memberCount = Math.max(0, server.memberCount - 1);
    await server.save();

    return { success: true };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
  })
  // Create invite
  .post('/:serverId/invites', async ({ headers, cookie, params, body, request, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    const membership = await ServerMember.findOne({
      serverId: params.serverId,
      userId: user._id,
    });

    if (!membership) {
      set.status = 403;
      return { error: 'You are not a member of this server' };
    }

    // Rate limit
    const ip = getClientIP(request);
    const rateLimit = await checkRateLimit('invite', `${user._id}:${ip}`);
    if (!rateLimit.success) {
      set.status = 429;
      return { error: 'Invite creation rate limited', retryAfter: rateLimit.retryAfter };
    }

    // Get default channel
    const channel = await Channel.findOne({
      serverId: params.serverId,
      type: { $in: ['text', 'announcement'] },
    }).sort({ position: 1 });

    if (!channel) {
      set.status = 400;
      return { error: 'No valid channel for invite' };
    }

    const { maxUses = 0, maxAge = 86400, temporary = false } = body;

    const invite = new Invite({
      code: nanoid(8),
      serverId: params.serverId,
      channelId: channel._id,
      inviterId: user._id,
      maxUses,
      maxAge,
      temporary,
      expiresAt: maxAge > 0 ? new Date(Date.now() + maxAge * 1000) : null,
    });

    await invite.save();

    return {
      success: true,
      invite: {
        code: invite.code,
        expiresAt: invite.expiresAt,
        maxUses: invite.maxUses,
        uses: 0,
      },
    };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
    body: t.Object({
      maxUses: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
      maxAge: t.Optional(t.Number({ minimum: 0, maximum: 604800 })),
      temporary: t.Optional(t.Boolean()),
    }),
  })
  // Get server channels
  .get('/:serverId/channels', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    // Check membership
    const membership = await ServerMember.findOne({
      serverId: params.serverId,
      userId: user._id,
    });

    if (!membership) {
      set.status = 403;
      return { error: 'You are not a member of this server' };
    }

    const channels = await Channel.find({ serverId: params.serverId }).sort({ position: 1 });
    // Transform _id to id for frontend compatibility
    return channels.map(ch => ({
      id: ch._id.toString(),
      name: ch.name,
      type: ch.type,
      serverId: ch.serverId?.toString(),
      position: ch.position,
      parentId: ch.parentId?.toString() || null,
      topic: ch.topic,
      nsfw: ch.nsfw,
      rateLimitPerUser: ch.rateLimitPerUser,
      lastMessageId: ch.lastMessageId?.toString() || null,
    }));
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
  })
  // Get server roles
  .get('/:serverId/roles', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    // Check membership
    const membership = await ServerMember.findOne({
      serverId: params.serverId,
      userId: user._id,
    });

    if (!membership) {
      set.status = 403;
      return { error: 'You are not a member of this server' };
    }

    const roles = await getNormalizedRoles(params.serverId);
    return { roles };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
  })
  // Create server role
  .post('/:serverId/roles', async ({ headers, cookie, params, body, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    // Only owner can create roles for now
    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'Only the server owner can create roles' };
    }

    // Get highest position
    const highestRole = await Role.findOne({ serverId: params.serverId }).sort({ position: -1 });
    const newPosition = (highestRole?.position || 0) + 1;

    const role = new Role({
      serverId: params.serverId,
      name: body.name || 'new role',
      color: parseHexColorToNumber(body.color),
      position: newPosition,
      permissions: body.permissions || DEFAULT_PERMISSIONS.everyone,
      hoist: body.hoist || false,
      mentionable: body.mentionable || false,
    });

    await role.save();

    const roles = await getNormalizedRoles(params.serverId);
    const createdRole = roles.find((item) => item.id === role._id.toString());

    return { role: createdRole || normalizeRoleDto(role as unknown as PopulatedRole) };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
    body: t.Object({
      name: t.Optional(t.String({ maxLength: 100 })),
      color: t.Optional(t.String()),
      permissions: t.Optional(t.String()),
      hoist: t.Optional(t.Boolean()),
      mentionable: t.Optional(t.Boolean()),
    }),
  })
  // Update server role
  .patch('/:serverId/roles/:roleId', async ({ headers, cookie, params, body, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId) || !isValidObjectId(params.roleId)) {
      set.status = 400;
      return { error: 'Invalid ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'Only the server owner can edit roles' };
    }

    const role = await Role.findOne({ _id: params.roleId, serverId: params.serverId });
    if (!role) {
      set.status = 404;
      return { error: 'Role not found' };
    }

    // Cannot edit @everyone name
    if (role.isDefault && body.name && body.name !== '@everyone') {
      set.status = 400;
      return { error: 'Cannot rename the @everyone role' };
    }

    if (body.name !== undefined) role.name = body.name;
    if (body.color !== undefined) role.color = parseHexColorToNumber(body.color);
    if (body.permissions !== undefined) role.permissions = body.permissions;
    if (body.hoist !== undefined) role.hoist = body.hoist;
    if (body.mentionable !== undefined) role.mentionable = body.mentionable;

    await role.save();

    const roles = await getNormalizedRoles(params.serverId);
    const updatedRole = roles.find((item) => item.id === role._id.toString());
    return { role: updatedRole || normalizeRoleDto(role as unknown as PopulatedRole) };
  }, {
    params: t.Object({
      serverId: t.String(),
      roleId: t.String(),
    }),
    body: t.Object({
      name: t.Optional(t.String({ maxLength: 100 })),
      color: t.Optional(t.String()),
      permissions: t.Optional(t.String()),
      hoist: t.Optional(t.Boolean()),
      mentionable: t.Optional(t.Boolean()),
    }),
  })
  // Reorder server roles
  .patch('/:serverId/roles/reorder', async ({ headers, cookie, params, body, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'Only the server owner can reorder roles' };
    }

    const orderedRoleIds = body.orderedRoleIds || [];
    if (orderedRoleIds.length === 0) {
      set.status = 400;
      return { error: 'orderedRoleIds is required' };
    }

    const uniqueRoleIds = Array.from(new Set(orderedRoleIds));
    if (uniqueRoleIds.length !== orderedRoleIds.length) {
      set.status = 400;
      return { error: 'orderedRoleIds contains duplicates' };
    }

    if (!uniqueRoleIds.every((roleId) => isValidObjectId(roleId))) {
      set.status = 400;
      return { error: 'orderedRoleIds contains invalid role IDs' };
    }

    const reorderableRoles = await Role.find({
      serverId: params.serverId,
      isDefault: false,
    }).select('_id position');

    if (reorderableRoles.length !== uniqueRoleIds.length) {
      set.status = 400;
      return { error: 'orderedRoleIds must include every non-default role exactly once' };
    }

    const existingIds = new Set(reorderableRoles.map((role) => role._id.toString()));
    if (!uniqueRoleIds.every((roleId) => existingIds.has(roleId))) {
      set.status = 400;
      return { error: 'orderedRoleIds contains role IDs that do not belong to this server' };
    }

    const highestPosition = uniqueRoleIds.length;
    await Promise.all(
      uniqueRoleIds.map((roleId, index) =>
        Role.updateOne(
          { _id: roleId, serverId: params.serverId, isDefault: false },
          { $set: { position: highestPosition - index } }
        )
      )
    );

    const roles = await getNormalizedRoles(params.serverId);
    return { roles };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
    body: t.Object({
      orderedRoleIds: t.Array(t.String()),
    }),
  })
  // Delete server role
  .delete('/:serverId/roles/:roleId', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId) || !isValidObjectId(params.roleId)) {
      set.status = 400;
      return { error: 'Invalid ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'Only the server owner can delete roles' };
    }

    const role = await Role.findOne({ _id: params.roleId, serverId: params.serverId });
    if (!role) {
      set.status = 404;
      return { error: 'Role not found' };
    }

    if (role.isDefault) {
      set.status = 400;
      return { error: 'Cannot delete the @everyone role' };
    }

    // Remove role from all members
    await ServerMember.updateMany(
      { serverId: params.serverId },
      { $pull: { roles: params.roleId } }
    );

    await role.deleteOne();

    const roles = await getNormalizedRoles(params.serverId);
    return { success: true, roles };
  }, {
    params: t.Object({
      serverId: t.String(),
      roleId: t.String(),
    }),
  })
  // Get server widget data (public endpoint)
  .get('/:serverId/widget', async ({ params, set }) => {
    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    if (server.settings?.widget?.enabled === false) {
      set.status = 403;
      return { error: 'Server widget is disabled' };
    }
    
    // Get online members
    const members = await ServerMember.find({ serverId: params.serverId })
      .populate('userId', 'username displayName avatar status presenceLastHeartbeatAt')
      .limit(50);
    
    // Get channels
    const channels = await Channel.find({ serverId: params.serverId, type: { $in: ['text', 'voice'] } })
      .select('name type')
      .limit(10);

    const widgetChannelId = server.settings?.widget?.channelId?.toString();
    
    // Get an active invite
    const invite = await Invite.findOne({ 
      serverId: params.serverId,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    }).sort({ createdAt: -1 });

    const transformedMembers = members.map(m => {
      const userData = m.userId as unknown as PopulatedMemberUser;
      return {
        id: userData._id.toString(),
        username: userData.username,
        displayName: userData.displayName,
        avatar: userData.avatar,
        status: resolveEffectiveStatus({
          status: userData.status || 'offline',
          presenceLastHeartbeatAt: userData.presenceLastHeartbeatAt || null,
        }),
      };
    });

    const onlineCount = transformedMembers.filter(m => m.status !== 'offline').length;

    return {
      id: server._id.toString(),
      name: server.name,
      icon: server.icon,
      memberCount: server.memberCount || members.length,
      onlineCount,
      inviteCode: invite?.code,
      channels: channels.map(c => ({
        id: c._id.toString(),
        name: c.name,
        type: c.type,
        isWidgetChannel: widgetChannelId ? c._id.toString() === widgetChannelId : false,
      })),
      members: transformedMembers,
    };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
  })
  // Get server emojis
  .get('/:serverId/emojis', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const membership = await ServerMember.findOne({
      serverId: params.serverId,
      userId: user._id,
    });

    if (!membership) {
      set.status = 403;
      return { error: 'You are not a member of this server' };
    }

    const emojis = await ServerEmoji.find({ serverId: params.serverId, available: true });
    return { emojis };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
  })
  // Upload server emoji
  .post('/:serverId/emojis', async ({ headers, cookie, params, body, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    // Check permissions (owner or admin)
    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'Only the server owner can upload emojis' };
    }

    // Check emoji limit (50 for non-premium, 100 for premium)
    const emojiCount = await ServerEmoji.countDocuments({ serverId: params.serverId });
    const maxEmojis = server.premiumTier >= 1 ? 100 : 50;
    if (emojiCount >= maxEmojis) {
      set.status = 400;
      return { error: `You can only have ${maxEmojis} custom emojis` };
    }

    const emoji = new ServerEmoji({
      serverId: params.serverId,
      name: sanitizeInput(body.name),
      imageUrl: body.imageUrl,
      animated: body.animated || false,
      uploadedBy: user._id,
    });

    await emoji.save();

    return { emoji };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
    body: t.Object({
      name: t.String({ minLength: 2, maxLength: 32 }),
      imageUrl: t.String(),
      animated: t.Optional(t.Boolean()),
    }),
  })
  // Delete server emoji
  .delete('/:serverId/emojis/:emojiId', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId) || !isValidObjectId(params.emojiId)) {
      set.status = 400;
      return { error: 'Invalid ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'Only the server owner can delete emojis' };
    }

    const emoji = await ServerEmoji.findOne({ _id: params.emojiId, serverId: params.serverId });
    if (!emoji) {
      set.status = 404;
      return { error: 'Emoji not found' };
    }

    await emoji.deleteOne();

    return { success: true };
  }, {
    params: t.Object({
      serverId: t.String(),
      emojiId: t.String(),
    }),
  })
  // Get server stickers
  .get('/:serverId/stickers', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const membership = await ServerMember.findOne({
      serverId: params.serverId,
      userId: user._id,
    });

    if (!membership) {
      set.status = 403;
      return { error: 'You are not a member of this server' };
    }

    const stickers = await ServerSticker.find({ serverId: params.serverId, available: true }).sort({ createdAt: -1 });
    return { stickers };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
  })
  // Create server sticker
  .post('/:serverId/stickers', async ({ headers, cookie, params, body, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'Only the server owner can upload stickers' };
    }

    const stickerCount = await ServerSticker.countDocuments({ serverId: params.serverId });
    const maxStickers = server.premiumTier >= 1 ? 30 : 15;
    if (stickerCount >= maxStickers) {
      set.status = 400;
      return { error: `Sticker limit reached (${maxStickers})` };
    }

    const sticker = new ServerSticker({
      serverId: params.serverId,
      name: sanitizeInput(body.name),
      description: body.description ? sanitizeInput(body.description) : undefined,
      imageUrl: body.imageUrl,
      tags: body.tags || [],
      uploadedBy: user._id,
    });
    await sticker.save();

    return { sticker };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
    body: t.Object({
      name: t.String({ minLength: 2, maxLength: 30 }),
      imageUrl: t.String(),
      description: t.Optional(t.String({ maxLength: 200 })),
      tags: t.Optional(t.Array(t.String({ maxLength: 30 }))),
    }),
  })
  // Delete server sticker
  .delete('/:serverId/stickers/:stickerId', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId) || !isValidObjectId(params.stickerId)) {
      set.status = 400;
      return { error: 'Invalid ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'Only the server owner can delete stickers' };
    }

    await ServerSticker.deleteOne({ _id: params.stickerId, serverId: params.serverId });
    return { success: true };
  }, {
    params: t.Object({
      serverId: t.String(),
      stickerId: t.String(),
    }),
  })
  // Get server invites
  .get('/:serverId/invites', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    // Only owner can view all invites
    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'You do not have permission to view invites' };
    }

    const invites = await Invite.find({ serverId: params.serverId })
      .populate('inviterId', 'username displayName avatar')
      .populate('channelId', 'name type')
      .sort({ createdAt: -1 });

    // Transform invites to include channel data
    const transformedInvites = invites.map(invite => ({
      code: invite.code,
      uses: invite.uses,
      maxUses: invite.maxUses,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
      channel: invite.channelId ? {
        id: (invite.channelId as any)._id?.toString() || invite.channelId.toString(),
        name: (invite.channelId as any).name || 'unknown',
        type: (invite.channelId as any).type || 'text',
      } : null,
      createdBy: invite.inviterId ? {
        id: (invite.inviterId as any)._id?.toString() || invite.inviterId.toString(),
        username: (invite.inviterId as any).username || 'Unknown',
        displayName: (invite.inviterId as any).displayName,
        avatar: (invite.inviterId as any).avatar,
      } : null,
    }));

    return { invites: transformedInvites };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
  })
  // Delete invite
  .delete('/:serverId/invites/:code', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    // Only owner can delete invites
    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'You do not have permission to delete invites' };
    }

    await Invite.deleteOne({ code: params.code, serverId: params.serverId });
    return { success: true };
  }, {
    params: t.Object({
      serverId: t.String(),
      code: t.String(),
    }),
  })
  // Get server bans
  .get('/:serverId/bans', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    // Only owner can view bans
    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'You do not have permission to view bans' };
    }

    const bans = await ServerBan.find({ serverId: params.serverId })
      .populate('userId', 'username displayName avatar')
      .populate('bannedBy', 'username displayName')
      .sort({ createdAt: -1 });

    return {
      bans: bans.map((ban: any) => ({
        id: ban.userId?._id?.toString() || ban.userId?.toString(),
        username: ban.userId?.displayName || ban.userId?.username || 'Unknown',
        avatar: ban.userId?.avatar,
        reason: ban.reason,
        bannedAt: ban.createdAt,
        bannedBy: {
          id: ban.bannedBy?._id?.toString() || ban.bannedBy?.toString(),
          username: ban.bannedBy?.displayName || ban.bannedBy?.username || 'Unknown',
        },
      })),
    };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
  })
  // Ban user
  .post('/:serverId/bans/:userId', async ({ headers, cookie, params, body, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId) || !isValidObjectId(params.userId)) {
      set.status = 400;
      return { error: 'Invalid ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'You do not have permission to ban users' };
    }

    if (server.ownerId.toString() === params.userId) {
      set.status = 400;
      return { error: 'You cannot ban the server owner' };
    }

    const targetUser = await ServerMember.findOne({
      serverId: params.serverId,
      userId: params.userId,
    });
    if (!targetUser) {
      set.status = 404;
      return { error: 'User is not a server member' };
    }

    await ServerBan.findOneAndUpdate(
      { serverId: params.serverId, userId: params.userId },
      {
        $set: {
          bannedBy: user._id,
          reason: body.reason || null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await ServerMember.deleteOne({ serverId: params.serverId, userId: params.userId });
    await Server.updateOne({ _id: params.serverId }, { $inc: { memberCount: -1 } });

    await AdminLog.create({
      adminId: user._id,
      action: 'ban_user',
      targetType: 'server',
      targetId: params.serverId,
      reason: body.reason || null,
      details: { userId: params.userId },
    });

    return { success: true };
  }, {
    params: t.Object({
      serverId: t.String(),
      userId: t.String(),
    }),
    body: t.Object({
      reason: t.Optional(t.String({ maxLength: 512 })),
    }),
  })
  // Unban user
  .delete('/:serverId/bans/:userId', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    // Only owner can unban
    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'You do not have permission to unban users' };
    }

    await ServerBan.deleteOne({ serverId: params.serverId, userId: params.userId });

    await AdminLog.create({
      adminId: user._id,
      action: 'unban_user',
      targetType: 'server',
      targetId: params.serverId,
      details: { userId: params.userId },
    });

    return { success: true };
  }, {
    params: t.Object({
      serverId: t.String(),
      userId: t.String(),
    }),
  })
  // Get server audit log
  .get('/:serverId/audit-log', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    if (!server.ownerId.equals(user._id)) {
      set.status = 403;
      return { error: 'You do not have permission to view audit log' };
    }

    const logs = await AdminLog.find({ targetType: 'server', targetId: params.serverId })
      .populate('adminId', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(100);

    return {
      logs: logs.map((log: any) => ({
        id: log._id.toString(),
        action: log.action,
        reason: log.reason,
        details: log.details,
        createdAt: log.createdAt,
        admin: {
          id: log.adminId?._id?.toString(),
          username: log.adminId?.displayName || log.adminId?.username || 'Unknown',
          avatar: log.adminId?.avatar,
        },
      })),
    };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
  })
  // Join server by ID (for explore page)
  .post('/:serverId/join', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    if (!isValidObjectId(params.serverId)) {
      set.status = 400;
      return { error: 'Invalid server ID' };
    }

    const server = await Server.findById(params.serverId);
    if (!server) {
      set.status = 404;
      return { error: 'Server not found' };
    }

    // Check if server is discoverable/public (for now, only allow official servers)
    if (!server.isOfficial && !server.isVerified) {
      set.status = 403;
      return { error: 'This server is not discoverable. You need an invite to join.' };
    }

    // Check if already a member
    const existingMembership = await ServerMember.findOne({
      serverId: server._id,
      userId: user._id,
    });

    if (existingMembership) {
      set.status = 400;
      return { error: 'Already a member of this server' };
    }

    // Check server limit
    const serverCount = await ServerMember.countDocuments({ userId: user._id });
    if (serverCount >= config.MAX_SERVERS_PER_USER) {
      set.status = 400;
      return { error: `You can only be in ${config.MAX_SERVERS_PER_USER} servers` };
    }

    // Get @everyone role
    const everyoneRole = await Role.findOne({
      serverId: server._id,
      isDefault: true,
    });

    // Create membership
    const membership = new ServerMember({
      serverId: server._id,
      userId: user._id,
      roles: everyoneRole ? [everyoneRole._id] : [],
    });

    await membership.save();

    // Update server member count
    server.memberCount += 1;
    await server.save();

    return {
      success: true,
      server: {
        id: server._id,
        name: server.name,
        icon: server.icon,
      },
    };
  }, {
    params: t.Object({
      serverId: t.String(),
    }),
  });

// Invite routes
export const inviteRoutes = new Elysia({ prefix: '/invites' })
  // Get invite info
  .get('/:code', async ({ params, set }) => {
    const invite = await Invite.findOne({ code: params.code })
      .populate('serverId', 'name icon memberCount onlineCount');

    if (!invite) {
      set.status = 404;
      return { error: 'Invite not found or expired' };
    }

    return {
      code: invite.code,
      server: invite.serverId,
      expiresAt: invite.expiresAt,
    };
  }, {
    params: t.Object({
      code: t.String(),
    }),
  })
  // Join via invite
  .post('/:code', async ({ headers, cookie, params, set }) => {
    const { user, error: authError } = await getAuth(headers, cookie as Record<string, { value?: unknown }>);
    if (!user) {
      set.status = 401;
      return { error: authError || 'Unauthorized' };
    }

    const invite = await Invite.findOne({ code: params.code });

    if (!invite) {
      set.status = 404;
      return { error: 'Invite not found or expired' };
    }

    const isBanned = await ServerBan.exists({ serverId: invite.serverId, userId: user._id });
    if (isBanned) {
      set.status = 403;
      return { error: 'You are banned from this server' };
    }

    // Check if already a member
    const existingMembership = await ServerMember.findOne({
      serverId: invite.serverId,
      userId: user._id,
    });

    if (existingMembership) {
      set.status = 400;
      return { error: 'Already a member of this server' };
    }

    // Check server limit
    const serverCount = await ServerMember.countDocuments({ userId: user._id });
    if (serverCount >= config.MAX_SERVERS_PER_USER) {
      set.status = 400;
      return { error: `You can only be in ${config.MAX_SERVERS_PER_USER} servers` };
    }

    // Check max uses
    if (invite.maxUses > 0 && invite.uses >= invite.maxUses) {
      set.status = 400;
      return { error: 'Invite has reached maximum uses' };
    }

    // Get @everyone role
    const everyoneRole = await Role.findOne({
      serverId: invite.serverId,
      isDefault: true,
    });

    // Create membership
    const membership = new ServerMember({
      serverId: invite.serverId,
      userId: user._id,
      roles: everyoneRole ? [everyoneRole._id] : [],
    });

    await membership.save();

    // Update invite uses
    invite.uses += 1;
    await invite.save();

    // Update server member count
    await Server.updateOne(
      { _id: invite.serverId },
      { $inc: { memberCount: 1 } }
    );

    const server = await Server.findById(invite.serverId);

    return {
      success: true,
      server: {
        id: server?._id,
        name: server?.name,
        icon: server?.icon,
      },
    };
  }, {
    params: t.Object({
      code: t.String(),
    }),
  });
