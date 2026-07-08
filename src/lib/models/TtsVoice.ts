import { eq, and, asc, type SQL } from 'drizzle-orm';
import { normalizeId, buildCondition } from '../db/normalizeId';
import { db, schema } from '../db/postgres';

export type ITtsVoice = typeof schema.ttsVoices.$inferSelect;

export const TtsVoice = {
  table: schema.ttsVoices,

  async findById(id: string) {
    const [row] = await db.select().from(schema.ttsVoices).where(eq(schema.ttsVoices.id, normalizeId(id))).limit(1);
    return row || null;
  },

  async find(filter: Record<string, unknown> = {}) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'id': conditions.push(buildCondition(schema.ttsVoices.id, value, true)); break;
        case 'name': conditions.push(eq(schema.ttsVoices.name, value as string)); break;
        case 'provider': conditions.push(eq(schema.ttsVoices.provider, value as string)); break;
        case 'enabled': conditions.push(eq(schema.ttsVoices.enabled, value as boolean)); break;
        case 'isDefault': conditions.push(eq(schema.ttsVoices.isDefault, value as boolean)); break;
      }
    }
    let query = db.select().from(schema.ttsVoices);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    return query.orderBy(asc(schema.ttsVoices.name));
  },

  async findDefault() {
    const [row] = await db.select().from(schema.ttsVoices).where(eq(schema.ttsVoices.isDefault, true)).limit(1);
    return row || null;
  },

  async create(data: typeof schema.ttsVoices.$inferInsert) {
    const [row] = await db.insert(schema.ttsVoices).values(data).returning();
    return row;
  },

  async updateById(id: string, data: Partial<typeof schema.ttsVoices.$inferInsert>) {
    const [row] = await db.update(schema.ttsVoices).set({ ...data, updatedAt: new Date() }).where(eq(schema.ttsVoices.id, normalizeId(id))).returning();
    return row || null;
  },

  async clearDefault() {
    await db.update(schema.ttsVoices).set({ isDefault: false, updatedAt: new Date() }).where(eq(schema.ttsVoices.isDefault, true));
  },

  async setDefault(id: string) {
    await db.update(schema.ttsVoices).set({ isDefault: false, updatedAt: new Date() }).where(eq(schema.ttsVoices.isDefault, true));
    const [row] = await db.update(schema.ttsVoices).set({ isDefault: true, updatedAt: new Date() }).where(eq(schema.ttsVoices.id, normalizeId(id))).returning();
    return row || null;
  },

  async deleteById(id: string) {
    await db.delete(schema.ttsVoices).where(eq(schema.ttsVoices.id, normalizeId(id)));
  },
};
