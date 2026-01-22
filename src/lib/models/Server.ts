import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IServer extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  icon?: string;
  banner?: string;
  splash?: string; // Invite splash image
  ownerId: Types.ObjectId;
  
  // Settings
  systemChannelId?: Types.ObjectId;
  rulesChannelId?: Types.ObjectId;
  publicUpdatesChannelId?: Types.ObjectId;
  afkChannelId?: Types.ObjectId;
  afkTimeout: number; // in seconds
  
  // Features
  features: string[];
  verificationLevel: 'none' | 'low' | 'medium' | 'high' | 'very_high';
  explicitContentFilter: 'disabled' | 'members_without_roles' | 'all_members';
  defaultNotifications: 'all_messages' | 'only_mentions';
  
  // Boost info
  premiumTier: 0 | 1 | 2 | 3;
  premiumSubscriptionCount: number;
  
  // Partnership & Discovery
  isPartnered: boolean;
  partneredAt?: Date;
  isDiscoverable: boolean;
  discoverableAt?: Date;
  discoverySplash?: string;
  discoveryDescription?: string;
  discoveryCategories: string[];
  
  // Invite
  vanityUrlCode?: string;
  vanityUrlUses: number;
  
  // Security
  mfaLevel: 0 | 1;
  
  // Counts (denormalized for performance)
  memberCount: number;
  onlineCount: number;
  
  // Templates
  isTemplate: boolean;
  templateId?: string;
  
  // Welcome Screen
  welcomeScreen?: {
    description?: string;
    channels: Array<{
      channelId: Types.ObjectId;
      description: string;
      emoji?: string;
    }>;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ServerSchema = new Schema<IServer>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 1024,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
  banner: {
    type: String,
    default: null,
  },
  splash: {
    type: String,
    default: null,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  systemChannelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
  },
  rulesChannelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
  },
  publicUpdatesChannelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
  },
  afkChannelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
  },
  afkTimeout: {
    type: Number,
    default: 300, // 5 minutes
    enum: [60, 300, 900, 1800, 3600], // 1, 5, 15, 30, 60 minutes
  },
  features: [{
    type: String,
  }],
  verificationLevel: {
    type: String,
    enum: ['none', 'low', 'medium', 'high', 'very_high'],
    default: 'none',
  },
  explicitContentFilter: {
    type: String,
    enum: ['disabled', 'members_without_roles', 'all_members'],
    default: 'disabled',
  },
  defaultNotifications: {
    type: String,
    enum: ['all_messages', 'only_mentions'],
    default: 'only_mentions',
  },
  premiumTier: {
    type: Number,
    enum: [0, 1, 2, 3],
    default: 0,
  },
  premiumSubscriptionCount: {
    type: Number,
    default: 0,
  },
  isPartnered: {
    type: Boolean,
    default: false,
    index: true,
  },
  partneredAt: {
    type: Date,
    default: null,
  },
  isDiscoverable: {
    type: Boolean,
    default: false,
    index: true,
  },
  discoverableAt: {
    type: Date,
    default: null,
  },
  discoverySplash: {
    type: String,
    default: null,
  },
  discoveryDescription: {
    type: String,
    maxlength: 300,
    default: null,
  },
  discoveryCategories: [{
    type: String,
  }],
  vanityUrlCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  vanityUrlUses: {
    type: Number,
    default: 0,
  },
  mfaLevel: {
    type: Number,
    enum: [0, 1],
    default: 0,
  },
  memberCount: {
    type: Number,
    default: 1,
  },
  onlineCount: {
    type: Number,
    default: 0,
  },
  isTemplate: {
    type: Boolean,
    default: false,
  },
  templateId: {
    type: String,
    default: null,
  },
  welcomeScreen: {
    description: { type: String, maxlength: 300, default: null },
    channels: [{
      channelId: { type: Schema.Types.ObjectId, ref: 'Channel' },
      description: { type: String, maxlength: 50 },
      emoji: { type: String, default: null },
    }],
  },
}, {
  timestamps: true,
});

// Indexes
ServerSchema.index({ name: 'text', description: 'text' });

export const Server = mongoose.models.Server || mongoose.model<IServer>('Server', ServerSchema);
