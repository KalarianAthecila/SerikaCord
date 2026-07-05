import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAppWebhook extends Document {
  _id: Types.ObjectId;
  applicationId: Types.ObjectId;
  name: string;
  url: string;
  secret?: string | null;
  events: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppWebhookSchema = new Schema<IAppWebhook>({
  applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  url: { type: String, required: true },
  secret: { type: String, default: null },
  events: { type: [String], default: [] },
  active: { type: Boolean, default: true },
}, {
  timestamps: true,
});

AppWebhookSchema.index({ applicationId: 1, createdAt: -1 });

export const AppWebhook = mongoose.models.AppWebhook || mongoose.model<IAppWebhook>('AppWebhook', AppWebhookSchema);
