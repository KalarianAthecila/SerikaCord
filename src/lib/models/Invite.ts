import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInvite extends Document {
  _id: Types.ObjectId;
  code: string;
  serverId: Types.ObjectId;
  channelId: Types.ObjectId;
  inviterId: Types.ObjectId;
  
  uses: number;
  maxUses: number; // 0 = unlimited
  maxAge: number; // in seconds, 0 = never expires
  temporary: boolean; // Kick when disconnect if not assigned role
  
  expiresAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema = new Schema<IInvite>({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  serverId: {
    type: Schema.Types.ObjectId,
    ref: 'Server',
    required: true,
    index: true,
  },
  channelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
  },
  inviterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uses: {
    type: Number,
    default: 0,
  },
  maxUses: {
    type: Number,
    default: 0, // Unlimited
  },
  maxAge: {
    type: Number,
    default: 86400, // 24 hours
  },
  temporary: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Auto-expire invites
InviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Invite = mongoose.models.Invite || mongoose.model<IInvite>('Invite', InviteSchema);
