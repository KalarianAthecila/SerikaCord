import mongoose, { Schema, Document, Types } from 'mongoose';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'interviewed';

export interface IApplicationAnswer {
  question: string;
  answer: string;
  isPrivate?: boolean;
}

export interface IServerMemberApplication extends Document {
  _id: Types.ObjectId;
  serverId: Types.ObjectId;
  userId: Types.ObjectId;
  status: ApplicationStatus;
  answers: IApplicationAnswer[];
  processedBy?: Types.ObjectId;
  processedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServerMemberApplicationSchema = new Schema<IServerMemberApplication>({
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'interviewed'],
    default: 'pending',
    index: true,
  },
  answers: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    isPrivate: { type: Boolean, default: true },
  }],
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  processedAt: {
    type: Date,
    default: null,
  },
  rejectionReason: {
    type: String,
    maxlength: 500,
    default: null,
  },
}, {
  timestamps: true,
});

// Ensure one active application per user per server
ServerMemberApplicationSchema.index({ serverId: 1, userId: 1, status: 1 });

export const ServerMemberApplication = mongoose.models.ServerMemberApplication || mongoose.model<IServerMemberApplication>('ServerMemberApplication', ServerMemberApplicationSchema);
