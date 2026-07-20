import { eq, and, type SQL } from 'drizzle-orm';
import { normalizeId } from '../db/normalizeId';
import { db, schema } from '../db/postgres';

export type IAppEmoji = typeof schema.appEmojis.$inferSelect;

export const AppEmoji = {
  table: schema.appEmojis,

  async findById(id: string) {
    const [row] = await db.select().from(schema.appEmojis).where(eq(schema.appEmojis.id, normalizeId(id))).limit(1);
    return row || null;
  },

  async findOne(filter: Record<string, unknown>) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'applicationId': conditions.push(eq(schema.appEmojis.applicationId, normalizeId(value as string))); break;
      }
    }
    let query = db.select().from(schema.appEmojis);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    const [row] = await query.limit(1);
    return row || null;
  },

  async find(filter: Record<string, unknown> = {}) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'applicationId': conditions.push(eq(schema.appEmojis.applicationId, normalizeId(value as string))); break;
      }
    }
    let query = db.select().from(schema.appEmojis);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    return query;
  },

  async create(data: typeof schema.appEmojis.$inferInsert) {
    const [row] = await db.insert(schema.appEmojis).values(data).returning();
    return row;
  },

  async updateById(id: string, data: Partial<typeof schema.appEmojis.$inferInsert>) {
    const [row] = await db.update(schema.appEmojis).set({ ...data, updatedAt: new Date() }).where(eq(schema.appEmojis.id, normalizeId(id))).returning();
    return row || null;
  },

  async deleteById(id: string) {
    await db.delete(schema.appEmojis).where(eq(schema.appEmojis.id, normalizeId(id)));
  },
};
