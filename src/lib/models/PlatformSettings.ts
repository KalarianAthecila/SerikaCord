import { eq } from 'drizzle-orm';
import { normalizeId } from '../db/normalizeId';
import { db, schema } from '../db/postgres';
import { config } from '../config';

export type IAllowedFileType = {
  type: string;
  safe: boolean;
};

export type IPlatformSettings = typeof schema.platformSettings.$inferSelect;

export const PlatformSettings = {
  table: schema.platformSettings,

  async findById(id: string = 'settings') {
    const [row] = await db.select().from(schema.platformSettings).where(eq(schema.platformSettings.id, normalizeId(id))).limit(1);
    return row || null;
  },
};

function generateEncryptionKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let key = '';
  for (let i = 0; i < 64; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

const DEFAULT_ALLOWED_FILE_TYPES: IAllowedFileType[] = [
  ...config.ALLOWED_IMAGE_TYPES.map((type) => ({ type, safe: true })),
  ...config.ALLOWED_FILE_TYPES
    .filter((type) => !config.ALLOWED_IMAGE_TYPES.includes(type as typeof config.ALLOWED_IMAGE_TYPES[number]))
    .map((type) => ({ type, safe: true })),
];

export async function getPlatformSettings(): Promise<IPlatformSettings> {
  let [settings] = await db.select().from(schema.platformSettings).where(eq(schema.platformSettings.id, 'settings')).limit(1);

  if (!settings) {
    [settings] = await db.insert(schema.platformSettings).values({
      id: 'settings',
      maintenanceMode: false,
      allowRegistration: true,
      encryptionKey: generateEncryptionKey(),
      allowedFileTypes: DEFAULT_ALLOWED_FILE_TYPES,
    }).returning();
  }

  return settings!;
}

export async function updatePlatformSettings(updates: Partial<IPlatformSettings>): Promise<IPlatformSettings> {
  const [settings] = await db.update(schema.platformSettings)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(schema.platformSettings.id, 'settings'))
    .returning();

  if (!settings) {
    const [created] = await db.insert(schema.platformSettings).values({
      id: 'settings',
      ...updates,
      encryptionKey: updates.encryptionKey || generateEncryptionKey(),
    } as typeof schema.platformSettings.$inferInsert).returning();
    return created;
  }

  return settings;
}

let cachedEncryptionKey: string = '';

export async function getEncryptionKey(): Promise<string> {
  if (cachedEncryptionKey) {
    return cachedEncryptionKey;
  }

  const settings = await getPlatformSettings();
  cachedEncryptionKey = settings.encryptionKey ?? generateEncryptionKey();
  return cachedEncryptionKey;
}
