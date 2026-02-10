import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserDeviceSession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  deviceName: string;
  platform: string;
  browser: string;
  ipAddress?: string;
  current: boolean;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserDeviceSessionSchema = new Schema<IUserDeviceSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  deviceName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  platform: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60,
  },
  browser: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  current: {
    type: Boolean,
    default: false,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

UserDeviceSessionSchema.index({ userId: 1, lastActiveAt: -1 });

export const UserDeviceSession = mongoose.models.UserDeviceSession || mongoose.model<IUserDeviceSession>('UserDeviceSession', UserDeviceSessionSchema);
