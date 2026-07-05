import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAppEmoji extends Document {
  _id: Types.ObjectId;
  applicationId: Types.ObjectId;
  name: string;
  image: string;
  animated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppEmojiSchema = new Schema<IAppEmoji>({
  applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 32 },
  image: { type: String, required: true },
  animated: { type: Boolean, default: false },
}, {
  timestamps: true,
});

AppEmojiSchema.index({ applicationId: 1, name: 1 }, { unique: true });

export const AppEmoji = mongoose.models.AppEmoji || mongoose.model<IAppEmoji>('AppEmoji', AppEmojiSchema);
