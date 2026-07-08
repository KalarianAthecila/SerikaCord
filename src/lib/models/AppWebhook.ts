import { eq, and, type SQL } from 'drizzle-orm';
import { normalizeId } from '../db/normalizeId';
import { db, schema } from '../db/postgres';

export type IAppWebhook = typeof schema.appWebhooks.$inferSelect;

export const AppWebhook = {
  table: schema.appWebhooks,

  async findById(id: string) {
    const [row] = await db.select().from(schema.appWebhooks).where(eq(schema.appWebhooks.id, normalizeId(id))).limit(1);
    return row || null;
  },

  async findOne(filter: Record<string, unknown>) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'applicationId': conditions.push(eq(schema.appWebhooks.applicationId, normalizeId(value as string))); break;
      }
    }
    let query = db.select().from(schema.appWebhooks);
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
        case 'applicationId': conditions.push(eq(schema.appWebhooks.applicationId, normalizeId(value as string))); break;
      }
    }
    let query = db.select().from(schema.appWebhooks);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    return query;
  },

  async create(data: typeof schema.appWebhooks.$inferInsert) {
    const [row] = await db.insert(schema.appWebhooks).values(data).returning();
    return row;
  },

  async updateById(id: string, data: Partial<typeof schema.appWebhooks.$inferInsert>) {
    const [row] = await db.update(schema.appWebhooks).set({ ...data, updatedAt: new Date() }).where(eq(schema.appWebhooks.id, normalizeId(id))).returning();
    return row || null;
  },

  async deleteById(id: string) {
    await db.delete(schema.appWebhooks).where(eq(schema.appWebhooks.id, normalizeId(id)));
  },
};
