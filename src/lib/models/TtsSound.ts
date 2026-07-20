import { eq, and, asc, type SQL } from 'drizzle-orm';
import { normalizeId, buildCondition } from '../db/normalizeId';
import { db, schema } from '../db/postgres';

export type ITtsSound = typeof schema.ttsSounds.$inferSelect;

export const TtsSound = {
  table: schema.ttsSounds,

  async findById(id: string) {
    const [row] = await db.select().from(schema.ttsSounds).where(eq(schema.ttsSounds.id, normalizeId(id))).limit(1);
    return row || null;
  },

  async find(filter: Record<string, unknown> = {}) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'id': conditions.push(buildCondition(schema.ttsSounds.id, value, true)); break;
        case 'triggerWord': conditions.push(eq(schema.ttsSounds.triggerWord, value as string)); break;
        case 'enabled': conditions.push(eq(schema.ttsSounds.enabled, value as boolean)); break;
      }
    }
    let query = db.select().from(schema.ttsSounds);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    return query.orderBy(asc(schema.ttsSounds.triggerWord));
  },

  async create(data: typeof schema.ttsSounds.$inferInsert) {
    const [row] = await db.insert(schema.ttsSounds).values(data).returning();
    return row;
  },

  async updateById(id: string, data: Partial<typeof schema.ttsSounds.$inferInsert>) {
    const [row] = await db.update(schema.ttsSounds).set({ ...data, updatedAt: new Date() }).where(eq(schema.ttsSounds.id, normalizeId(id))).returning();
    return row || null;
  },

  async deleteById(id: string) {
    await db.delete(schema.ttsSounds).where(eq(schema.ttsSounds.id, normalizeId(id)));
  },
};
