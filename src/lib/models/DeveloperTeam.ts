import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDeveloperTeam extends Document {
  _id: Types.ObjectId;
  name: string;
  icon?: string | null;
  ownerId: Types.ObjectId;
  members: {
    userId: Types.ObjectId;
    username: string;
    avatar?: string | null;
    role: 'owner' | 'admin' | 'developer' | 'viewer';
    joinedAt: Date;
  }[];
  description?: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeveloperTeamSchema = new Schema<IDeveloperTeam>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  icon: { type: String, default: null },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  members: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['owner', 'admin', 'developer', 'viewer'], default: 'developer' },
    joinedAt: { type: Date, default: Date.now },
  }],
  description: { type: String, default: null, maxlength: 500 },
  verified: { type: Boolean, default: false },
}, {
  timestamps: true,
});

DeveloperTeamSchema.index({ ownerId: 1, createdAt: -1 });
DeveloperTeamSchema.index({ 'members.userId': 1 });

export const DeveloperTeam = mongoose.models.DeveloperTeam || mongoose.model<IDeveloperTeam>('DeveloperTeam', DeveloperTeamSchema);
