-- Performance indexes for SerikaCord PostgreSQL
-- Run this after migration to ensure optimal query performance

-- GIN index on channels.recipient_ids for fast @> array contains queries (DM lookups)
CREATE INDEX IF NOT EXISTS channels_recipient_ids_gin_idx ON channels USING GIN (recipient_ids);

-- Composite index for message cursor pagination (channelId + isDeleted + createdAt)
-- This is the most critical index for message loading performance
CREATE INDEX IF NOT EXISTS messages_channel_id_is_deleted_created_at_idx ON messages (channel_id, is_deleted, created_at DESC);

-- Index for mentionedUserIds array lookups
CREATE INDEX IF NOT EXISTS messages_mentioned_user_ids_gin_idx ON messages USING GIN (mentioned_user_ids);

-- Index for mentionedRoleIds array lookups
CREATE INDEX IF NOT EXISTS messages_mentioned_role_ids_gin_idx ON messages USING GIN (mentioned_role_ids);

-- Verify all indexes exist
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;
