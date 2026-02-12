export interface RolePermissionDefinition {
  key: string;
  label: string;
  description: string;
  bit: bigint;
}

export interface RolePermissionCategory {
  id: string;
  label: string;
  permissions: RolePermissionDefinition[];
}

export const ROLE_PERMISSION_CATEGORIES: RolePermissionCategory[] = [
  {
    id: "general",
    label: "General",
    permissions: [
      {
        key: "administrator",
        label: "Administrator",
        description: "Grants all permissions and bypasses channel-specific permission checks.",
        bit: 1n << 3n,
      },
      {
        key: "view_audit_log",
        label: "View Audit Log",
        description: "Allows viewing the server audit log.",
        bit: 1n << 7n,
      },
      {
        key: "manage_server",
        label: "Manage Server",
        description: "Allows editing server settings.",
        bit: 1n << 5n,
      },
      {
        key: "manage_roles",
        label: "Manage Roles",
        description: "Allows creating, editing, and deleting roles.",
        bit: 1n << 28n,
      },
      {
        key: "manage_channels",
        label: "Manage Channels",
        description: "Allows creating, editing, and deleting channels.",
        bit: 1n << 4n,
      },
      {
        key: "kick_members",
        label: "Kick Members",
        description: "Allows kicking members from the server.",
        bit: 1n << 1n,
      },
      {
        key: "ban_members",
        label: "Ban Members",
        description: "Allows banning members from the server.",
        bit: 1n << 2n,
      },
      {
        key: "create_invite",
        label: "Create Invite",
        description: "Allows creating invite links.",
        bit: 1n << 0n,
      },
      {
        key: "change_nickname",
        label: "Change Nickname",
        description: "Allows changing your own nickname.",
        bit: 1n << 26n,
      },
      {
        key: "manage_nicknames",
        label: "Manage Nicknames",
        description: "Allows changing nicknames for other members.",
        bit: 1n << 27n,
      },
    ],
  },
  {
    id: "text",
    label: "Text",
    permissions: [
      {
        key: "view_channel",
        label: "View Channels",
        description: "Allows viewing channels and reading messages.",
        bit: 1n << 10n,
      },
      {
        key: "send_messages",
        label: "Send Messages",
        description: "Allows sending messages in text channels.",
        bit: 1n << 11n,
      },
      {
        key: "send_messages_in_threads",
        label: "Send Messages in Threads",
        description: "Allows sending messages in thread channels.",
        bit: 1n << 38n,
      },
      {
        key: "embed_links",
        label: "Embed Links",
        description: "Allows posting rich embeds in messages.",
        bit: 1n << 14n,
      },
      {
        key: "attach_files",
        label: "Attach Files",
        description: "Allows uploading files and images.",
        bit: 1n << 15n,
      },
      {
        key: "read_message_history",
        label: "Read Message History",
        description: "Allows reading previous channel messages.",
        bit: 1n << 16n,
      },
      {
        key: "mention_everyone",
        label: "Mention Everyone",
        description: "Allows using @everyone and @here mentions.",
        bit: 1n << 17n,
      },
      {
        key: "add_reactions",
        label: "Add Reactions",
        description: "Allows adding reactions to messages.",
        bit: 1n << 6n,
      },
      {
        key: "manage_messages",
        label: "Manage Messages",
        description: "Allows deleting or pinning any message.",
        bit: 1n << 13n,
      },
      {
        key: "manage_threads",
        label: "Manage Threads",
        description: "Allows managing and moderating threads.",
        bit: 1n << 34n,
      },
    ],
  },
  {
    id: "voice",
    label: "Voice",
    permissions: [
      {
        key: "connect",
        label: "Connect",
        description: "Allows joining voice channels.",
        bit: 1n << 20n,
      },
      {
        key: "speak",
        label: "Speak",
        description: "Allows speaking in voice channels.",
        bit: 1n << 21n,
      },
      {
        key: "video",
        label: "Video",
        description: "Allows using camera in voice channels.",
        bit: 1n << 9n,
      },
      {
        key: "mute_members",
        label: "Mute Members",
        description: "Allows muting other members.",
        bit: 1n << 22n,
      },
      {
        key: "deafen_members",
        label: "Deafen Members",
        description: "Allows deafening other members.",
        bit: 1n << 23n,
      },
      {
        key: "move_members",
        label: "Move Members",
        description: "Allows moving members between voice channels.",
        bit: 1n << 24n,
      },
      {
        key: "priority_speaker",
        label: "Priority Speaker",
        description: "Allows using priority speaker in voice channels.",
        bit: 1n << 8n,
      },
      {
        key: "use_voice_activity",
        label: "Use Voice Activity",
        description: "Allows voice activity instead of push-to-talk.",
        bit: 1n << 25n,
      },
    ],
  },
  {
    id: "advanced",
    label: "Advanced",
    permissions: [
      {
        key: "manage_webhooks",
        label: "Manage Webhooks",
        description: "Allows creating and editing webhooks.",
        bit: 1n << 29n,
      },
      {
        key: "manage_emojis_and_stickers",
        label: "Manage Emoji and Stickers",
        description: "Allows managing server emoji and stickers.",
        bit: 1n << 30n,
      },
      {
        key: "manage_events",
        label: "Manage Events",
        description: "Allows managing scheduled events.",
        bit: 1n << 33n,
      },
      {
        key: "moderate_members",
        label: "Timeout Members",
        description: "Allows timing out members.",
        bit: 1n << 40n,
      },
    ],
  },
];
