import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IServerBan extends Document {
  _id: Types.ObjectId;
  serverId: Types.ObjectId;
  userId: Types.ObjectId;
  bannedBy: Types.ObjectId;
  reason?: string;
  createdAt: Date;
}

const ServerBanSchema = new Schema<IServerBan>({
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
  bannedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    maxlength: 512,
    default: null,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

ServerBanSchema.index({ serverId: 1, userId: 1 }, { unique: true });

export const ServerBan = mongoose.models.ServerBan || mongoose.model<IServerBan>('ServerBan', ServerBanSchema);
