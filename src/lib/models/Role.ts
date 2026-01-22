import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRole extends Document {
  _id: Types.ObjectId;
  serverId: Types.ObjectId;
  name: string;
  color: number;
  hoist: boolean; // Show separately in sidebar
  icon?: string;
  unicodeEmoji?: string;
  position: number;
  permissions: string; // Bitfield as string
  managed: boolean; // Managed by integration
  mentionable: boolean;
  
  // Flags
  isDefault: boolean; // @everyone role
  
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>({
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
    maxlength: 100,
  },
  color: {
    type: Number,
    default: 0,
  },
  hoist: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: null,
  },
  unicodeEmoji: {
    type: String,
    default: null,
  },
  position: {
    type: Number,
    default: 0,
  },
  permissions: {
    type: String,
    default: '0',
  },
  managed: {
    type: Boolean,
    default: false,
  },
  mentionable: {
    type: Boolean,
    default: false,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Compound index for server roles
RoleSchema.index({ serverId: 1, position: 1 });
RoleSchema.index({ serverId: 1, isDefault: 1 });

export const Role = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
