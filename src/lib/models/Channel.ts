import mongoose, { Schema, Document, Types } from 'mongoose';

export type ChannelType =
  | 'text'
  | 'voice'
  | 'category'
  | 'announcement'
  | 'stage'
  | 'forum'
  | 'public_thread'
  | 'private_thread'
  | 'dm'
  | 'group_dm';

/** How a forum channel behaves: normal discussion posts, or a ticket system. */
export type ForumMode = 'posts' | 'tickets';

export interface IPermissionOverwrite {
  id: Types.ObjectId;
  type: 'role' | 'member';
  allow: string; // Bitfield as string
  deny: string; // Bitfield as string
}

export interface IChannel extends Document {
  _id: Types.ObjectId;
  serverId?: Types.ObjectId; // Null for DMs
  name: string;
  type: ChannelType;
  topic?: string;
  position: number;
  parentId?: Types.ObjectId; // Category parent
  
  // For text channels
  lastMessageId?: Types.ObjectId;
  lastPinTimestamp?: Date;
  rateLimitPerUser: number; // Slowmode in seconds
  nsfw: boolean;
  
  // For voice channels
  bitrate: number;
  userLimit: number;
  rtcRegion?: string;
  
  // For forum channels
  defaultAutoArchiveDuration: number;
  defaultThreadRateLimitPerUser: number;
  availableTags: Array<{
    id: string;
    name: string;
    moderated: boolean;
    emojiId?: string;
    emojiName?: string;
  }>;
  defaultReactionEmoji?: {
    emojiId?: string;
    emojiName?: string;
  };
  defaultSortOrder?: 'latest_activity' | 'creation_date';
  defaultForumLayout?: 'not_set' | 'list_view' | 'gallery_view';
  forumMode: ForumMode; // 'posts' (normal forum) or 'tickets'
  ticketAccessRoleIds: Types.ObjectId[]; // Roles that can see every ticket in a ticket-mode forum

  // For threads (public_thread / private_thread) — a thread's parentId points at
  // its forum/text channel, and messages are stored against the thread's own _id.
  ownerId?: Types.ObjectId; // Thread creator
  archived: boolean;
  locked: boolean;
  threadMemberIds: Types.ObjectId[]; // Explicit members (private threads / tickets)
  appliedTags: string[]; // availableTags ids applied to this thread
  messageCount: number;

  // For DMs
  recipientIds: Types.ObjectId[];
  
  // Permissions
  permissionOverwrites: IPermissionOverwrite[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const PermissionOverwriteSchema = new Schema<IPermissionOverwrite>({
  id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  type: {
    type: String,
    enum: ['role', 'member'],
    required: true,
  },
  allow: {
    type: String,
    default: '0',
  },
  deny: {
    type: String,
    default: '0',
  },
}, { _id: false });

const ChannelSchema = new Schema<IChannel>({
  serverId: {
    type: Schema.Types.ObjectId,
    ref: 'Server',
    index: true,
    default: null,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  type: {
    type: String,
    enum: ['text', 'voice', 'category', 'announcement', 'stage', 'forum', 'public_thread', 'private_thread', 'dm', 'group_dm'],
    required: true,
    index: true,
  },
  topic: {
    type: String,
    maxlength: 1024,
    default: null,
  },
  position: {
    type: Number,
    default: 0,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    default: null,
  },
  lastMessageId: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  lastPinTimestamp: {
    type: Date,
    default: null,
  },
  rateLimitPerUser: {
    type: Number,
    default: 0,
    min: 0,
    max: 21600, // 6 hours
  },
  nsfw: {
    type: Boolean,
    default: false,
  },
  bitrate: {
    type: Number,
    default: 64000,
    min: 8000,
    max: 384000,
  },
  userLimit: {
    type: Number,
    default: 0,
    min: 0,
    max: 99,
  },
  rtcRegion: {
    type: String,
    default: null,
  },
  defaultAutoArchiveDuration: {
    type: Number,
    default: 1440, // 24 hours
    enum: [60, 1440, 4320, 10080], // 1 hour, 24 hours, 3 days, 1 week
  },
  defaultThreadRateLimitPerUser: {
    type: Number,
    default: 0,
    min: 0,
    max: 21600,
  },
  availableTags: [{
    id: String,
    name: String,
    moderated: { type: Boolean, default: false },
    emojiId: String,
    emojiName: String,
  }],
  defaultReactionEmoji: {
    emojiId: String,
    emojiName: String,
  },
  defaultSortOrder: {
    type: String,
    enum: ['latest_activity', 'creation_date'],
    default: null,
  },
  defaultForumLayout: {
    type: String,
    enum: ['not_set', 'list_view', 'gallery_view'],
    default: 'not_set',
  },
  forumMode: {
    type: String,
    enum: ['posts', 'tickets'],
    default: 'posts',
  },
  ticketAccessRoleIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Role',
  }],
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  archived: {
    type: Boolean,
    default: false,
  },
  locked: {
    type: Boolean,
    default: false,
  },
  threadMemberIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  appliedTags: [{
    type: String,
  }],
  messageCount: {
    type: Number,
    default: 0,
  },
  recipientIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  permissionOverwrites: [PermissionOverwriteSchema],
}, {
  timestamps: true,
});

// Indexes
ChannelSchema.index({ serverId: 1, position: 1 });
ChannelSchema.index({ serverId: 1, parentId: 1 });
// Listing threads under a forum/text channel, most-recently-active first
ChannelSchema.index({ parentId: 1, archived: 1, lastMessageId: -1 });
ChannelSchema.index({ recipientIds: 1 }, { sparse: true });

export const Channel = mongoose.models.Channel || mongoose.model<IChannel>('Channel', ChannelSchema);
