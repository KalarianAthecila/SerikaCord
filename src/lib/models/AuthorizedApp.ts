import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuthorizedApp extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  description?: string;
  icon?: string;
  scopes: string[];
  approvedAt: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorizedAppSchema = new Schema<IAuthorizedApp>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  description: {
    type: String,
    maxlength: 300,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
  scopes: [{
    type: String,
    trim: true,
  }],
  approvedAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

AuthorizedAppSchema.index({ userId: 1, name: 1 });

export const AuthorizedApp = mongoose.models.AuthorizedApp || mongoose.model<IAuthorizedApp>('AuthorizedApp', AuthorizedAppSchema);
