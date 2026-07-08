CREATE TABLE "admin_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" "admin_action_type" NOT NULL,
	"target_type" "admin_target_type" NOT NULL,
	"target_id" text NOT NULL,
	"details" jsonb,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_commands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"guild_id" uuid,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb,
	"default_permission" boolean DEFAULT true,
	"type" integer DEFAULT 1,
	"version" text DEFAULT '1',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_emojis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"name" text NOT NULL,
	"image" text NOT NULL,
	"animated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"secret" text,
	"events" text[] DEFAULT '{}',
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text DEFAULT '',
	"icon" text,
	"cover_image" text,
	"bot_id" uuid,
	"bot_token" text,
	"bot_public" boolean DEFAULT true,
	"bot_require_code_grant" boolean DEFAULT false,
	"client_id" text NOT NULL,
	"client_secret" text NOT NULL,
	"redirect_uris" text[] DEFAULT '{}',
	"scopes" text[] DEFAULT '{"identify"}',
	"install_params" jsonb,
	"custom_install_url" text,
	"rpc_origins" text[] DEFAULT '{}',
	"verified" boolean DEFAULT false,
	"verification_status" "verification_status" DEFAULT 'none',
	"server_count" integer DEFAULT 0,
	"tags" text[] DEFAULT '{}',
	"terms_of_service_url" text,
	"privacy_policy_url" text,
	"flags" integer DEFAULT 0,
	"gateway_intents" integer DEFAULT 0,
	"interactions_endpoint_url" text,
	"public_key" text,
	"private_key_pem" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "applications_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "authorized_apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"scopes" text[] DEFAULT '{}',
	"approved_at" timestamp DEFAULT now(),
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "channel_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" uuid NOT NULL,
	"server_id" uuid,
	"name" text NOT NULL,
	"avatar" text,
	"token" text NOT NULL,
	"url" text NOT NULL,
	"creator_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" uuid,
	"name" text NOT NULL,
	"type" "channel_type" NOT NULL,
	"topic" text,
	"position" integer DEFAULT 0,
	"parent_id" uuid,
	"last_message_id" uuid,
	"last_pin_timestamp" timestamp,
	"rate_limit_per_user" integer DEFAULT 0,
	"nsfw" boolean DEFAULT false,
	"bitrate" integer DEFAULT 64000,
	"user_limit" integer DEFAULT 0,
	"rtc_region" text,
	"default_auto_archive_duration" integer DEFAULT 1440,
	"default_thread_rate_limit_per_user" integer DEFAULT 0,
	"available_tags" jsonb DEFAULT '[]'::jsonb,
	"default_reaction_emoji" jsonb,
	"default_sort_order" text,
	"default_forum_layout" text DEFAULT 'not_set',
	"forum_mode" "forum_mode" DEFAULT 'posts',
	"ticket_access_role_ids" uuid[] DEFAULT '{}',
	"owner_id" uuid,
	"archived" boolean DEFAULT false,
	"locked" boolean DEFAULT false,
	"thread_member_ids" uuid[] DEFAULT '{}',
	"applied_tags" text[] DEFAULT '{}',
	"message_count" integer DEFAULT 0,
	"recipient_ids" uuid[] DEFAULT '{}',
	"permission_overwrites" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "developer_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"owner_id" uuid NOT NULL,
	"members" jsonb DEFAULT '[]'::jsonb,
	"description" text,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"description" text,
	"type" "experiment_type" DEFAULT 'feature_flag',
	"status" "experiment_status" DEFAULT 'draft',
	"rollout_percentage" integer DEFAULT 0,
	"variants" jsonb DEFAULT '[]'::jsonb,
	"filters" jsonb DEFAULT '[]'::jsonb,
	"user_buckets" jsonb DEFAULT '{}'::jsonb,
	"user_overrides" jsonb DEFAULT '[]'::jsonb,
	"excluded_users" jsonb DEFAULT '[]'::jsonb,
	"metrics" jsonb DEFAULT '{}'::jsonb,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"started_at" timestamp,
	"ended_at" timestamp,
	"target_instances" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "experiments_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"instance_id" text NOT NULL,
	"type" "instance_type" DEFAULT 'self_hosted',
	"status" "instance_status" DEFAULT 'pending',
	"api_key" text NOT NULL,
	"api_key_prefix" text NOT NULL,
	"secret_key" text NOT NULL,
	"owner_id" uuid,
	"owner_email" text,
	"config" jsonb DEFAULT '{}'::jsonb,
	"stats" jsonb DEFAULT '{}'::jsonb,
	"allowed_ips" text[] DEFAULT '{}',
	"last_seen_ip" text,
	"last_seen_at" timestamp,
	"approved_at" timestamp,
	"approved_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "instances_domain_unique" UNIQUE("domain"),
	CONSTRAINT "instances_instance_id_unique" UNIQUE("instance_id")
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"server_id" uuid NOT NULL,
	"channel_id" uuid NOT NULL,
	"inviter_id" uuid NOT NULL,
	"uses" integer DEFAULT 0,
	"max_uses" integer DEFAULT 0,
	"max_age" integer DEFAULT 86400,
	"temporary" boolean DEFAULT false,
	"type" "invite_type" DEFAULT 'normal',
	"is_vanity" boolean DEFAULT false,
	"metadata" jsonb,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invites_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" uuid NOT NULL,
	"server_id" uuid,
	"author_id" uuid NOT NULL,
	"content" text DEFAULT '',
	"type" "message_type" DEFAULT 'default',
	"referenced_message_id" uuid,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"embeds" jsonb DEFAULT '[]'::jsonb,
	"sticker" jsonb,
	"mention_everyone" boolean DEFAULT false,
	"mentioned_user_ids" uuid[] DEFAULT '{}',
	"mentioned_role_ids" uuid[] DEFAULT '{}',
	"mentioned_channel_ids" uuid[] DEFAULT '{}',
	"reactions" jsonb DEFAULT '[]'::jsonb,
	"pinned" boolean DEFAULT false,
	"edited" boolean DEFAULT false,
	"edited_timestamp" timestamp,
	"thread_id" uuid,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" text PRIMARY KEY DEFAULT 'settings' NOT NULL,
	"maintenance_mode" boolean DEFAULT false,
	"allow_registration" boolean DEFAULT true,
	"connections_enabled" boolean DEFAULT true,
	"disabled_providers" text[] DEFAULT '{}',
	"global_announcement" text,
	"announcement_updated_at" timestamp,
	"encryption_key" text NOT NULL,
	"oembed_whitelist" text[] DEFAULT '{}',
	"allowed_file_types" jsonb DEFAULT '[]'::jsonb,
	"warn_on_unknown_file_types" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rich_presence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text DEFAULT 'other',
	"name" text NOT NULL,
	"details" text,
	"state" text,
	"large_image_url" text,
	"large_image_text" text,
	"small_image_url" text,
	"small_image_text" text,
	"started_at" timestamp,
	"ends_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" integer DEFAULT 0,
	"hoist" boolean DEFAULT false,
	"icon" text,
	"unicode_emoji" text,
	"position" integer DEFAULT 0,
	"permissions" text DEFAULT '0',
	"managed" boolean DEFAULT false,
	"mentionable" boolean DEFAULT false,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "server_bans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"banned_by" uuid NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "server_emojis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" uuid NOT NULL,
	"name" text NOT NULL,
	"image_url" text NOT NULL,
	"animated" boolean DEFAULT false,
	"available" boolean DEFAULT true,
	"managed" boolean DEFAULT false,
	"require_colons" boolean DEFAULT true,
	"roles" uuid[] DEFAULT '{}',
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "server_member_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'pending',
	"answers" jsonb DEFAULT '[]'::jsonb,
	"processed_by" uuid,
	"processed_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "server_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"nickname" text,
	"avatar" text,
	"banner" text,
	"roles" uuid[] DEFAULT '{}',
	"communication_disabled_until" timestamp,
	"deaf" boolean DEFAULT false,
	"mute" boolean DEFAULT false,
	"pending" boolean DEFAULT false,
	"joined_at" timestamp DEFAULT now(),
	"premium_since" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "server_stickers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text NOT NULL,
	"tags" text[] DEFAULT '{}',
	"available" boolean DEFAULT true,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"banner" text,
	"splash" text,
	"owner_id" uuid NOT NULL,
	"system_channel_id" uuid,
	"rules_channel_id" uuid,
	"public_updates_channel_id" uuid,
	"afk_channel_id" uuid,
	"afk_timeout" integer DEFAULT 300,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"join_mode" text DEFAULT 'invite_only',
	"soundboard_sounds" jsonb DEFAULT '[]'::jsonb,
	"features" text[] DEFAULT '{}',
	"verification_level" text DEFAULT 'none',
	"explicit_content_filter" text DEFAULT 'disabled',
	"default_notifications" text DEFAULT 'only_mentions',
	"premium_tier" integer DEFAULT 0,
	"premium_subscription_count" integer DEFAULT 0,
	"is_partnered" boolean DEFAULT false,
	"partnered_at" timestamp,
	"is_discoverable" boolean DEFAULT false,
	"discoverable_at" timestamp,
	"discovery_splash" text,
	"discovery_description" text,
	"discovery_categories" text[] DEFAULT '{}',
	"is_age_gated" boolean DEFAULT false,
	"vanity_url_code" text,
	"vanity_url_uses" integer DEFAULT 0,
	"mfa_level" integer DEFAULT 0,
	"member_count" integer DEFAULT 1,
	"online_count" integer DEFAULT 0,
	"is_template" boolean DEFAULT false,
	"template_id" text,
	"welcome_screen" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "servers_vanity_url_code_unique" UNIQUE("vanity_url_code")
);
--> statement-breakpoint
CREATE TABLE "user_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "connection_provider" NOT NULL,
	"account_id" text NOT NULL,
	"username" text,
	"display_name" text,
	"visible" boolean DEFAULT true,
	"avatar" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_device_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"device_name" text NOT NULL,
	"platform" text NOT NULL,
	"browser" text NOT NULL,
	"ip_address" text,
	"current" boolean DEFAULT false,
	"last_active_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"password_hash" text,
	"is_verified" boolean DEFAULT false,
	"verification_token" text,
	"verification_expires" timestamp,
	"reset_token" text,
	"reset_expires" timestamp,
	"discord_id" text,
	"discord_username" text,
	"username" text NOT NULL,
	"display_name" text,
	"avatar" text,
	"banner" text,
	"bio" text,
	"pronouns" text,
	"timezone" text,
	"show_timezone" boolean DEFAULT false,
	"status" "user_status" DEFAULT 'offline',
	"custom_status" text,
	"presence_last_heartbeat_at" timestamp DEFAULT now(),
	"presence_last_disconnect_at" timestamp,
	"badges" text[] DEFAULT '{}',
	"customization" jsonb DEFAULT '{}'::jsonb,
	"gif_favorites" jsonb DEFAULT '[]'::jsonb,
	"is_bot" boolean DEFAULT false,
	"is_system" boolean DEFAULT false,
	"is_premium" boolean DEFAULT false,
	"premium_since" timestamp,
	"premium_tier" text,
	"is_banned" boolean DEFAULT false,
	"ban_reason" text,
	"is_staff" boolean DEFAULT false,
	"staff_role" text,
	"friends" uuid[] DEFAULT '{}',
	"blocked_users" uuid[] DEFAULT '{}',
	"pending_friend_requests" jsonb DEFAULT '{"incoming":[],"outgoing":[]}'::jsonb,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE INDEX "admin_logs_admin_id_idx" ON "admin_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "admin_logs_action_idx" ON "admin_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "admin_logs_target_id_idx" ON "admin_logs" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "admin_logs_created_at_idx" ON "admin_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "admin_logs_action_created_at_idx" ON "admin_logs" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "app_commands_application_id_idx" ON "app_commands" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "app_commands_guild_id_idx" ON "app_commands" USING btree ("guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX "app_commands_application_id_guild_id_name_unique" ON "app_commands" USING btree ("application_id","guild_id","name");--> statement-breakpoint
CREATE INDEX "app_emojis_application_id_idx" ON "app_emojis" USING btree ("application_id");--> statement-breakpoint
CREATE UNIQUE INDEX "app_emojis_application_id_name_unique" ON "app_emojis" USING btree ("application_id","name");--> statement-breakpoint
CREATE INDEX "app_webhooks_application_id_idx" ON "app_webhooks" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "app_webhooks_application_id_created_at_idx" ON "app_webhooks" USING btree ("application_id","created_at");--> statement-breakpoint
CREATE INDEX "applications_owner_id_idx" ON "applications" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "applications_team_id_idx" ON "applications" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "applications_client_id_idx" ON "applications" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "applications_owner_id_created_at_idx" ON "applications" USING btree ("owner_id","created_at");--> statement-breakpoint
CREATE INDEX "authorized_apps_user_id_idx" ON "authorized_apps" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "authorized_apps_user_id_name_idx" ON "authorized_apps" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "channel_webhooks_channel_id_idx" ON "channel_webhooks" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "channel_webhooks_server_id_idx" ON "channel_webhooks" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "channels_server_id_idx" ON "channels" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "channels_type_idx" ON "channels" USING btree ("type");--> statement-breakpoint
CREATE INDEX "channels_server_id_position_idx" ON "channels" USING btree ("server_id","position");--> statement-breakpoint
CREATE INDEX "channels_server_id_parent_id_idx" ON "channels" USING btree ("server_id","parent_id");--> statement-breakpoint
CREATE INDEX "channels_parent_id_archived_last_message_idx" ON "channels" USING btree ("parent_id","archived","last_message_id");--> statement-breakpoint
CREATE INDEX "developer_teams_owner_id_idx" ON "developer_teams" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "developer_teams_owner_id_created_at_idx" ON "developer_teams" USING btree ("owner_id","created_at");--> statement-breakpoint
CREATE INDEX "experiments_status_idx" ON "experiments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "experiments_type_idx" ON "experiments" USING btree ("type");--> statement-breakpoint
CREATE INDEX "experiments_created_at_idx" ON "experiments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "instances_status_idx" ON "instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "instances_type_idx" ON "instances" USING btree ("type");--> statement-breakpoint
CREATE INDEX "instances_api_key_prefix_idx" ON "instances" USING btree ("api_key_prefix");--> statement-breakpoint
CREATE INDEX "invites_code_idx" ON "invites" USING btree ("code");--> statement-breakpoint
CREATE INDEX "invites_server_id_idx" ON "invites" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "invites_is_vanity_idx" ON "invites" USING btree ("is_vanity");--> statement-breakpoint
CREATE INDEX "invites_code_is_vanity_idx" ON "invites" USING btree ("code","is_vanity");--> statement-breakpoint
CREATE INDEX "invites_expires_at_idx" ON "invites" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "messages_channel_id_idx" ON "messages" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "messages_server_id_idx" ON "messages" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "messages_author_id_idx" ON "messages" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "messages_channel_id_created_at_idx" ON "messages" USING btree ("channel_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_server_id_created_at_idx" ON "messages" USING btree ("server_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_author_id_created_at_idx" ON "messages" USING btree ("author_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_channel_id_pinned_idx" ON "messages" USING btree ("channel_id","pinned");--> statement-breakpoint
CREATE INDEX "messages_channel_id_is_deleted_created_at_idx" ON "messages" USING btree ("channel_id","is_deleted","created_at");--> statement-breakpoint
CREATE INDEX "messages_channel_id_author_id_created_at_idx" ON "messages" USING btree ("channel_id","author_id","created_at");--> statement-breakpoint
CREATE INDEX "rich_presence_user_id_idx" ON "rich_presence" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "rich_presence_expires_at_idx" ON "rich_presence" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "rich_presence_user_id_type_name_unique" ON "rich_presence" USING btree ("user_id","type","name");--> statement-breakpoint
CREATE INDEX "roles_server_id_idx" ON "roles" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "roles_server_id_position_idx" ON "roles" USING btree ("server_id","position");--> statement-breakpoint
CREATE INDEX "roles_server_id_is_default_idx" ON "roles" USING btree ("server_id","is_default");--> statement-breakpoint
CREATE INDEX "server_bans_server_id_idx" ON "server_bans" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "server_bans_user_id_idx" ON "server_bans" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "server_bans_server_id_user_id_unique" ON "server_bans" USING btree ("server_id","user_id");--> statement-breakpoint
CREATE INDEX "server_emojis_server_id_idx" ON "server_emojis" USING btree ("server_id");--> statement-breakpoint
CREATE UNIQUE INDEX "server_emojis_server_id_name_unique" ON "server_emojis" USING btree ("server_id","name");--> statement-breakpoint
CREATE INDEX "server_member_applications_server_id_idx" ON "server_member_applications" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "server_member_applications_user_id_idx" ON "server_member_applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "server_member_applications_status_idx" ON "server_member_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "server_member_applications_server_id_user_id_status_idx" ON "server_member_applications" USING btree ("server_id","user_id","status");--> statement-breakpoint
CREATE INDEX "server_members_server_id_idx" ON "server_members" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "server_members_user_id_idx" ON "server_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "server_members_server_id_user_id_unique" ON "server_members" USING btree ("server_id","user_id");--> statement-breakpoint
CREATE INDEX "server_members_server_id_joined_at_idx" ON "server_members" USING btree ("server_id","joined_at");--> statement-breakpoint
CREATE INDEX "server_stickers_server_id_idx" ON "server_stickers" USING btree ("server_id");--> statement-breakpoint
CREATE UNIQUE INDEX "server_stickers_server_id_name_unique" ON "server_stickers" USING btree ("server_id","name");--> statement-breakpoint
CREATE INDEX "servers_owner_id_idx" ON "servers" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "servers_join_mode_idx" ON "servers" USING btree ("join_mode");--> statement-breakpoint
CREATE INDEX "servers_is_partnered_idx" ON "servers" USING btree ("is_partnered");--> statement-breakpoint
CREATE INDEX "servers_is_discoverable_idx" ON "servers" USING btree ("is_discoverable");--> statement-breakpoint
CREATE INDEX "user_connections_user_id_idx" ON "user_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_connections_provider_idx" ON "user_connections" USING btree ("provider");--> statement-breakpoint
CREATE UNIQUE INDEX "user_connections_user_id_provider_account_id_unique" ON "user_connections" USING btree ("user_id","provider","account_id");--> statement-breakpoint
CREATE INDEX "user_device_sessions_user_id_idx" ON "user_device_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_device_sessions_user_id_last_active_at_idx" ON "user_device_sessions" USING btree ("user_id","last_active_at");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_discord_id_idx" ON "users" USING btree ("discord_id");--> statement-breakpoint
CREATE INDEX "users_friends_idx" ON "users" USING btree ("friends");