import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  
  // Authentication
  email?: string;
  passwordHash?: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  resetToken?: string;
  resetExpires?: Date;
  
  // Discord OAuth
  discordId?: string;
  discordUsername?: string;
  
  // Profile
  username: string;
  displayName?: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  status?: 'online' | 'idle' | 'dnd' | 'offline' | 'invisible';
  customStatus?: string;
  
  // Flags
  isBot: boolean;
  isSystem: boolean;
  isPremium: boolean;
  isBanned: boolean;
  banReason?: string;
  
  // Relationships
  friends: Types.ObjectId[];
  blockedUsers: Types.ObjectId[];
  pendingFriendRequests: {
    incoming: Types.ObjectId[];
    outgoing: Types.ObjectId[];
  };
  
  // Server memberships are stored in ServerMember model
  
  // Settings
  settings: {
    theme: 'dark' | 'light' | 'system';
    locale: string;
    notifications: {
      desktop: boolean;
      sounds: boolean;
      mentions: boolean;
    };
    privacy: {
      directMessages: 'everyone' | 'friends' | 'servers';
      friendRequests: 'everyone' | 'friends' | 'none';
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  // Authentication
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined
    lowercase: true,
    trim: true,
    index: true,
  },
  passwordHash: {
    type: String,
    select: false, // Don't include in queries by default
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    select: false,
  },
  verificationExpires: {
    type: Date,
    select: false,
  },
  resetToken: {
    type: String,
    select: false,
  },
  resetExpires: {
    type: Date,
    select: false,
  },
  
  // Discord OAuth
  discordId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  discordUsername: {
    type: String,
  },
  
  // Profile
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 32,
    index: true,
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 32,
  },
  avatar: {
    type: String,
    default: null,
  },
  banner: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    maxlength: 190,
    default: null,
  },
  status: {
    type: String,
    enum: ['online', 'idle', 'dnd', 'offline', 'invisible'],
    default: 'offline',
  },
  customStatus: {
    type: String,
    maxlength: 128,
    default: null,
  },
  isBot: {
    type: Boolean,
    default: false,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  banReason: {
    type: String,
    default: null,
  },
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  pendingFriendRequests: {
    incoming: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    outgoing: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  settings: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark',
    },
    locale: {
      type: String,
      default: 'en-US',
    },
    notifications: {
      desktop: { type: Boolean, default: true },
      sounds: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
    },
    privacy: {
      directMessages: {
        type: String,
        enum: ['everyone', 'friends', 'servers'],
        default: 'everyone',
      },
      friendRequests: {
        type: String,
        enum: ['everyone', 'friends', 'none'],
        default: 'everyone',
      },
    },
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      // Remove sensitive fields from JSON output
      delete ret.passwordHash;
      delete ret.verificationToken;
      delete ret.verificationExpires;
      delete ret.resetToken;
      delete ret.resetExpires;
      return ret;
    },
  },
});

// Indexes for efficient queries
UserSchema.index({ 'friends': 1 });
UserSchema.index({ 'pendingFriendRequests.incoming': 1 });
UserSchema.index({ 'pendingFriendRequests.outgoing': 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
