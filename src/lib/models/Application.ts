import { eq, and, type SQL } from 'drizzle-orm';
import { normalizeId } from '../db/normalizeId';
import { db, schema } from '../db/postgres';

export type IApplication = typeof schema.applications.$inferSelect;

export const Application = {
  table: schema.applications,

  async findById(id: string) {
    const [row] = await db.select().from(schema.applications).where(eq(schema.applications.id, normalizeId(id))).limit(1);
    return row || null;
  },

  async findOne(filter: Record<string, unknown>) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'ownerId': conditions.push(eq(schema.applications.ownerId, normalizeId(value as string))); break;
        case 'teamId': conditions.push(eq(schema.applications.teamId, normalizeId(value as string))); break;
        case 'clientId': conditions.push(eq(schema.applications.clientId, normalizeId(value as string))); break;
        case 'botId': conditions.push(eq(schema.applications.botId, normalizeId(value as string))); break;
      }
    }
    let query = db.select().from(schema.applications);
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
        case 'ownerId': conditions.push(eq(schema.applications.ownerId, normalizeId(value as string))); break;
        case 'teamId': conditions.push(eq(schema.applications.teamId, normalizeId(value as string))); break;
      }
    }
    let query = db.select().from(schema.applications);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    return query;
  },

  async create(data: typeof schema.applications.$inferInsert) {
    const [row] = await db.insert(schema.applications).values(data).returning();
    return row;
  },

  async updateById(id: string, data: Partial<typeof schema.applications.$inferInsert>) {
    const [row] = await db.update(schema.applications).set({ ...data, updatedAt: new Date() }).where(eq(schema.applications.id, normalizeId(id))).returning();
    return row || null;
  },

  async deleteById(id: string) {
    await db.delete(schema.applications).where(eq(schema.applications.id, normalizeId(id)));
  },
};
