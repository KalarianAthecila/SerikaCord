import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IServerSticker extends Document {
  _id: Types.ObjectId;
  serverId: Types.ObjectId;
  name: string;
  description?: string;
  imageUrl: string;
  tags: string[];
  available: boolean;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ServerStickerSchema = new Schema<IServerSticker>({
  serverId: {
    type: Schema.Types.ObjectId,
    ref: 'Server',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30,
  },
  description: {
    type: String,
    maxlength: 200,
    default: null,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30,
  }],
  available: {
    type: Boolean,
    default: true,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

ServerStickerSchema.index({ serverId: 1, name: 1 }, { unique: true });

export const ServerSticker = mongoose.models.ServerSticker || mongoose.model<IServerSticker>('ServerSticker', ServerStickerSchema);
