import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IServerMember extends Document {
  _id: Types.ObjectId;
  serverId: Types.ObjectId;
  userId: Types.ObjectId;
  
  nickname?: string;
  avatar?: string; // Server-specific avatar
  banner?: string; // Server-specific banner
  
  roles: Types.ObjectId[];
  
  // Timeouts
  communicationDisabledUntil?: Date;
  
  // Flags
  deaf: boolean;
  mute: boolean;
  pending: boolean; // Pending membership screening
  
  // Timestamps
  joinedAt: Date;
  premiumSince?: Date; // Boosting since
  
  createdAt: Date;
  updatedAt: Date;
}

const ServerMemberSchema = new Schema<IServerMember>({
  serverId: {
    type: Schema.Types.ObjectId,
    ref: 'Server',
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: 32,
    default: null,
  },
  avatar: {
    type: String,
    default: null,
  },
  banner: {
    type: String,
    default: null,
  },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role',
  }],
  communicationDisabledUntil: {
    type: Date,
    default: null,
  },
  deaf: {
    type: Boolean,
    default: false,
  },
  mute: {
    type: Boolean,
    default: false,
  },
  pending: {
    type: Boolean,
    default: false,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  premiumSince: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Ensure unique member per server
ServerMemberSchema.index({ serverId: 1, userId: 1 }, { unique: true });
ServerMemberSchema.index({ serverId: 1, joinedAt: -1 });

export const ServerMember = mongoose.models.ServerMember || mongoose.model<IServerMember>('ServerMember', ServerMemberSchema);
