import mongoose, { Schema } from 'mongoose';

export interface IAllowedFileType {
  type: string;
  safe: boolean;
}

export interface IPlatformSettings {
  _id: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  connectionsEnabled: boolean;
  disabledProviders?: string[];
  globalAnnouncement?: string;
  announcementUpdatedAt?: Date;
  encryptionKey: string;
  oembedWhitelist?: string[];
  allowedFileTypes?: IAllowedFileType[];
  warnOnUnknownFileTypes?: boolean;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>({
  _id: {
    type: String,
    default: 'settings',
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  allowRegistration: {
    type: Boolean,
    default: true,
  },
  connectionsEnabled: {
    type: Boolean,
    default: true,
  },
  disabledProviders: {
    type: [String],
    default: [],
  },
  globalAnnouncement: {
    type: String,
    default: null,
  },
  announcementUpdatedAt: {
    type: Date,
  },
  encryptionKey: {
    type: String,
    required: true,
  },
  oembedWhitelist: {
    type: [String],
    default: [],
  },
  allowedFileTypes: {
    type: [{ type: { type: String, required: true }, safe: { type: Boolean, default: true } }],
    default: [],
  },
  warnOnUnknownFileTypes: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: { updatedAt: true, createdAt: false },
});

export const PlatformSettings = mongoose.models.PlatformSettings || 
  mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);

// Generate a secure encryption key
function generateEncryptionKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let key = '';
  for (let i = 0; i < 64; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Get or create platform settings (singleton)
export async function getPlatformSettings(): Promise<IPlatformSettings> {
  let settings = await PlatformSettings.findById('settings');
  
  if (!settings) {
    settings = await PlatformSettings.create({
      _id: 'settings',
      maintenanceMode: false,
      allowRegistration: true,
      encryptionKey: generateEncryptionKey(),
    });
  }
  
  return settings;
}

// Update platform settings
export async function updatePlatformSettings(updates: Partial<IPlatformSettings>): Promise<IPlatformSettings> {
  const settings = await PlatformSettings.findByIdAndUpdate(
    'settings',
    { $set: updates },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  
  if (!settings) {
    throw new Error('Failed to update settings');
  }
  
  return settings;
}

// Get encryption key (cached for performance)
let cachedEncryptionKey: string | null = null;

export async function getEncryptionKey(): Promise<string> {
  if (cachedEncryptionKey) {
    return cachedEncryptionKey;
  }
  
  const settings = await getPlatformSettings();
  cachedEncryptionKey = settings.encryptionKey;
  return cachedEncryptionKey;
}
