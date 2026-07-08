import { MongoClient, ObjectId } from 'mongodb';
import { Pool } from 'pg';

const MONGO_URI = process.env.MONGO_URI || '';
const POSTGRES_URI = process.env.POSTGRES_URI || '';

// Extract DB name from MONGO_URI or use default
const MONGO_DB = process.env.MONGO_DB_NAME || 'serikacord';

// Build proper MongoDB connection string with authSource
function buildMongoUri(uri: string, dbName: string): string {
  if (uri.includes('?')) {
    // Already has query params, just ensure authSource is set
    if (!uri.includes('authSource=')) {
      return uri + '&authSource=admin';
    }
    return uri;
  }
  // No query params, add directConnection and authSource
  // Also ensure the path includes the db name
  let base = uri;
  if (base.endsWith('/')) {
    base = base + dbName;
  } else if (!base.match(/\/[a-zA-Z]/)) {
    // No database in path
    base = base + '/' + dbName;
  }
  return base + '?directConnection=true&authSource=admin';
}

// ─── ObjectId → UUID conversion ───────────────────────────
// ObjectId is 24 hex chars (12 bytes). We pad to 32 hex chars (16 bytes)
// and format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
function objectIdToUuid(oid: string): string {
  const hex = oid.toString();
  // Pad to 32 chars
  const padded = hex.padEnd(32, '0');
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
}

// Convert any value: ObjectId → UUID string, recurse into arrays/objects
// Dates inside objects/arrays are converted to ISO strings for JSON compatibility
function convertValue(val: any): any {
  if (val === null || val === undefined) return null;
  if (val instanceof ObjectId) return objectIdToUuid(val.toString());
  if (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val) && val !== '000000000000000000000000') {
    return objectIdToUuid(val);
  }
  if (Array.isArray(val)) return val.map(convertValue);
  if (val instanceof Date) return val;
  if (typeof val === 'object') {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (k === '_id' && v instanceof ObjectId) {
        continue;
      }
      // Convert Date objects inside jsonb to ISO strings
      if (v instanceof Date) {
        result[k] = v.toISOString();
      } else {
        result[k] = convertValue(v);
      }
    }
    return result;
  }
  return val;
}

// Map MongoDB document fields to Postgres schema columns
// Remove _id (converted to id), __v, and convert ObjectIds
function transformDoc(doc: any, fieldMappings?: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};

  // Convert _id to id
  if (doc._id !== undefined) {
    if (doc._id instanceof ObjectId) {
      result.id = objectIdToUuid(doc._id.toString());
    } else {
      // String _id (like platformsettings)
      result.id = doc._id;
    }
  }

  for (const [key, value] of Object.entries(doc)) {
    if (key === '_id' || key === '__v') continue;

    const targetKey = fieldMappings?.[key] || key;
    result[targetKey] = convertValue(value);
  }

  return result;
}

async function migrate() {
  console.log('🚀 Starting MongoDB → Postgres migration...\n');

  const mongoClient = new MongoClient(buildMongoUri(MONGO_URI, MONGO_DB));
  const pool = new Pool({ connectionString: POSTGRES_URI });

  try {
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB');
    const db = mongoClient.db(MONGO_DB);

    const pgClient = await pool.connect();
    console.log('✅ Connected to Postgres\n');

    // Migration order (respect FK-like relationships)
    const collections = [
      { name: 'users', table: 'users' },
      { name: 'servers', table: 'servers' },
      { name: 'channels', table: 'channels' },
      { name: 'roles', table: 'roles' },
      { name: 'servermembers', table: 'server_members' },
      { name: 'messages', table: 'messages' },
      { name: 'invites', table: 'invites' },
      { name: 'serveremojis', table: 'server_emojis' },
      { name: 'serverstickers', table: 'server_stickers' },
      { name: 'serverbans', table: 'server_bans' },
      { name: 'servermemberapplications', table: 'server_member_applications' },
      { name: 'adminlogs', table: 'admin_logs' },
      { name: 'platformsettings', table: 'platform_settings' },
      { name: 'authorizedapps', table: 'authorized_apps' },
      { name: 'userdevicesessions', table: 'user_device_sessions' },
      { name: 'userconnections', table: 'user_connections' },
      { name: 'experiments', table: 'experiments' },
      { name: 'instances', table: 'instances' },
      { name: 'applications', table: 'applications' },
      { name: 'developerteams', table: 'developer_teams' },
      { name: 'appwebhooks', table: 'app_webhooks' },
      { name: 'appemojis', table: 'app_emojis' },
      { name: 'appcommands', table: 'app_commands' },
      { name: 'richpresences', table: 'rich_presence' },
      { name: 'channelwebhooks', table: 'channel_webhooks' },
    ];

    // Field name mappings (MongoDB camelCase → Postgres snake_case)
    const fieldMappings: Record<string, Record<string, string>> = {
      users: {
        passwordHash: 'password_hash',
        isVerified: 'is_verified',
        verificationToken: 'verification_token',
        verificationExpires: 'verification_expires',
        resetToken: 'reset_token',
        resetExpires: 'reset_expires',
        discordId: 'discord_id',
        discordUsername: 'discord_username',
        displayName: 'display_name',
        showTimezone: 'show_timezone',
        customStatus: 'custom_status',
        presenceLastHeartbeatAt: 'presence_last_heartbeat_at',
        presenceLastDisconnectAt: 'presence_last_disconnect_at',
        gifFavorites: 'gif_favorites',
        isBot: 'is_bot',
        isSystem: 'is_system',
        isPremium: 'is_premium',
        premiumSince: 'premium_since',
        premiumTier: 'premium_tier',
        isBanned: 'is_banned',
        banReason: 'ban_reason',
        isStaff: 'is_staff',
        staffRole: 'staff_role',
        blockedUsers: 'blocked_users',
        pendingFriendRequests: 'pending_friend_requests',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      servers: {
        ownerId: 'owner_id',
        systemChannelId: 'system_channel_id',
        rulesChannelId: 'rules_channel_id',
        publicUpdatesChannelId: 'public_updates_channel_id',
        afkChannelId: 'afk_channel_id',
        afkTimeout: 'afk_timeout',
        joinMode: 'join_mode',
        soundboardSounds: 'soundboard_sounds',
        verificationLevel: 'verification_level',
        explicitContentFilter: 'explicit_content_filter',
        defaultNotifications: 'default_notifications',
        premiumTier: 'premium_tier',
        premiumSubscriptionCount: 'premium_subscription_count',
        isPartnered: 'is_partnered',
        partneredAt: 'partnered_at',
        isDiscoverable: 'is_discoverable',
        discoverableAt: 'discoverable_at',
        discoverySplash: 'discovery_splash',
        discoveryDescription: 'discovery_description',
        discoveryCategories: 'discovery_categories',
        isAgeGated: 'is_age_gated',
        vanityUrlCode: 'vanity_url_code',
        vanityUrlUses: 'vanity_url_uses',
        mfaLevel: 'mfa_level',
        memberCount: 'member_count',
        onlineCount: 'online_count',
        isTemplate: 'is_template',
        templateId: 'template_id',
        welcomeScreen: 'welcome_screen',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      channels: {
        serverId: 'server_id',
        parentId: 'parent_id',
        lastMessageId: 'last_message_id',
        lastPinTimestamp: 'last_pin_timestamp',
        rateLimitPerUser: 'rate_limit_per_user',
        userLimit: 'user_limit',
        rtcRegion: 'rtc_region',
        defaultAutoArchiveDuration: 'default_auto_archive_duration',
        defaultThreadRateLimitPerUser: 'default_thread_rate_limit_per_user',
        availableTags: 'available_tags',
        defaultReactionEmoji: 'default_reaction_emoji',
        defaultSortOrder: 'default_sort_order',
        defaultForumLayout: 'default_forum_layout',
        forumMode: 'forum_mode',
        ticketAccessRoleIds: 'ticket_access_role_ids',
        ownerId: 'owner_id',
        threadMemberIds: 'thread_member_ids',
        appliedTags: 'applied_tags',
        messageCount: 'message_count',
        recipientIds: 'recipient_ids',
        permissionOverwrites: 'permission_overwrites',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      roles: {
        serverId: 'server_id',
        unicodeEmoji: 'unicode_emoji',
        isDefault: 'is_default',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      servermembers: {
        serverId: 'server_id',
        userId: 'user_id',
        communicationDisabledUntil: 'communication_disabled_until',
        premiumSince: 'premium_since',
        joinedAt: 'joined_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      messages: {
        channelId: 'channel_id',
        serverId: 'server_id',
        authorId: 'author_id',
        referencedMessageId: 'referenced_message_id',
        mentionEveryone: 'mention_everyone',
        mentionedUserIds: 'mentioned_user_ids',
        mentionedRoleIds: 'mentioned_role_ids',
        mentionedChannelIds: 'mentioned_channel_ids',
        editedTimestamp: 'edited_timestamp',
        threadId: 'thread_id',
        isDeleted: 'is_deleted',
        deletedAt: 'deleted_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      invites: {
        serverId: 'server_id',
        channelId: 'channel_id',
        inviterId: 'inviter_id',
        maxUses: 'max_uses',
        maxAge: 'max_age',
        isVanity: 'is_vanity',
        expiresAt: 'expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      serveremojis: {
        serverId: 'server_id',
        imageUrl: 'image_url',
        requireColons: 'require_colons',
        uploadedBy: 'uploaded_by',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      serverstickers: {
        serverId: 'server_id',
        imageUrl: 'image_url',
        uploadedBy: 'uploaded_by',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      serverbans: {
        serverId: 'server_id',
        userId: 'user_id',
        bannedBy: 'banned_by',
        createdAt: 'created_at',
      },
      servermemberapplications: {
        serverId: 'server_id',
        userId: 'user_id',
        processedBy: 'processed_by',
        processedAt: 'processed_at',
        rejectionReason: 'rejection_reason',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      adminlogs: {
        adminId: 'admin_id',
        targetType: 'target_type',
        targetId: 'target_id',
        createdAt: 'created_at',
      },
      platformsettings: {
        maintenanceMode: 'maintenance_mode',
        allowRegistration: 'allow_registration',
        connectionsEnabled: 'connections_enabled',
        disabledProviders: 'disabled_providers',
        globalAnnouncement: 'global_announcement',
        announcementUpdatedAt: 'announcement_updated_at',
        encryptionKey: 'encryption_key',
        oembedWhitelist: 'oembed_whitelist',
        allowedFileTypes: 'allowed_file_types',
        warnOnUnknownFileTypes: 'warn_on_unknown_file_types',
        updatedAt: 'updated_at',
      },
      authorizedapps: {
        userId: 'user_id',
        approvedAt: 'approved_at',
        lastUsedAt: 'last_used_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      userdevicesessions: {
        userId: 'user_id',
        deviceName: 'device_name',
        ipAddress: 'ip_address',
        lastActiveAt: 'last_active_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      userconnections: {
        userId: 'user_id',
        accountId: 'account_id',
        displayName: 'display_name',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      experiments: {
        rolloutPercentage: 'rollout_percentage',
        userBuckets: 'user_buckets',
        userOverrides: 'user_overrides',
        excludedUsers: 'excluded_users',
        createdBy: 'created_by',
        updatedBy: 'updated_by',
        startedAt: 'started_at',
        endedAt: 'ended_at',
        targetInstances: 'target_instances',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      instances: {
        instanceId: 'instance_id',
        apiKey: 'api_key',
        apiKeyPrefix: 'api_key_prefix',
        secretKey: 'secret_key',
        ownerId: 'owner_id',
        ownerEmail: 'owner_email',
        allowedIps: 'allowed_ips',
        lastSeenIp: 'last_seen_ip',
        lastSeenAt: 'last_seen_at',
        approvedAt: 'approved_at',
        approvedBy: 'approved_by',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      applications: {
        ownerId: 'owner_id',
        teamId: 'team_id',
        coverImage: 'cover_image',
        botId: 'bot_id',
        botToken: 'bot_token',
        botPublic: 'bot_public',
        botRequireCodeGrant: 'bot_require_code_grant',
        clientId: 'client_id',
        clientSecret: 'client_secret',
        redirectUris: 'redirect_uris',
        installParams: 'install_params',
        customInstallUrl: 'custom_install_url',
        rpcOrigins: 'rpc_origins',
        verificationStatus: 'verification_status',
        serverCount: 'server_count',
        termsOfServiceUrl: 'terms_of_service_url',
        privacyPolicyUrl: 'privacy_policy_url',
        gatewayIntents: 'gateway_intents',
        interactionsEndpointUrl: 'interactions_endpoint_url',
        publicKey: 'public_key',
        privateKeyPem: 'private_key_pem',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      developerteams: {
        ownerId: 'owner_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      appwebhooks: {
        applicationId: 'application_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      appemojis: {
        applicationId: 'application_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      appcommands: {
        applicationId: 'application_id',
        guildId: 'guild_id',
        defaultPermission: 'default_permission',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      richpresences: {
        userId: 'user_id',
        largeImageUrl: 'large_image_url',
        largeImageText: 'large_image_text',
        smallImageUrl: 'small_image_url',
        smallImageText: 'small_image_text',
        startedAt: 'started_at',
        endsAt: 'ends_at',
        expiresAt: 'expires_at',
        updatedAt: 'updated_at',
      },
      channelwebhooks: {
        channelId: 'channel_id',
        serverId: 'server_id',
        creatorId: 'creator_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    };

    let totalMigrated = 0;

    for (const { name, table } of collections) {
      const collection = db.collection(name);
      const count = await collection.countDocuments();
      if (count === 0) {
        console.log(`⏭️  ${name}: 0 documents, skipping`);
        continue;
      }

      const mapping = fieldMappings[name] || {};
      const docs = await collection.find({}).toArray();
      let inserted = 0;
      let errors = 0;

      // Get actual Postgres columns for this table
      const colRes = await pgClient.query(`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
      `, [table]);
      const pgColumns = new Set(colRes.rows.map((r: any) => r.column_name));
      const jsonbColumns = new Set(colRes.rows.filter((r: any) => r.data_type === 'jsonb').map((r: any) => r.column_name));

      for (const doc of docs) {
        const transformed = transformDoc(doc, mapping);

        // Filter to only columns that exist in Postgres table
        const columns = Object.keys(transformed).filter(c => pgColumns.has(c));
        const values = columns.map(c => {
          const val = transformed[c];
          // Stringify jsonb values that are objects/arrays
          if (jsonbColumns.has(c) && val !== null && typeof val === 'object') {
            return JSON.stringify(val);
          }
          return val;
        });
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        try {
          await pgClient.query(
            `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
            values
          );
          inserted++;
        } catch (err: any) {
          errors++;
          if (errors <= 3) {
            console.error(`  ❌ Error inserting into ${table}:`, err.message);
            console.error('  Doc id:', transformed.id);
          }
        }
      }

      console.log(`✅ ${name} → ${table}: ${inserted}/${count} migrated${errors > 0 ? `, ${errors} errors` : ''}`);
      totalMigrated += inserted;
    }

    console.log(`\n🎉 Migration complete! ${totalMigrated} total documents migrated.`);

    // Verify counts
    console.log('\n📊 Verification:');
    for (const { name, table } of collections) {
      const res = await pgClient.query(`SELECT COUNT(*) FROM "${table}"`);
      const pgCount = parseInt(res.rows[0].count);
      const mongoCount = await db.collection(name).countDocuments();
      const status = pgCount === mongoCount ? '✅' : '⚠️';
      console.log(`  ${status} ${table}: ${pgCount} (MongoDB: ${mongoCount})`);
    }

    pgClient.release();
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await mongoClient.close();
    await pool.end();
  }
}

migrate();
