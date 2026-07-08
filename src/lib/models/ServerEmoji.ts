import { eq, and, type SQL } from 'drizzle-orm';
import { normalizeId, buildCondition } from '../db/normalizeId';
import { db, schema } from '../db/postgres';

export type IServerEmoji = typeof schema.serverEmojis.$inferSelect;

export const ServerEmoji = {
  table: schema.serverEmojis,

  async findById(id: string) {
    const [row] = await db.select().from(schema.serverEmojis).where(eq(schema.serverEmojis.id, normalizeId(id))).limit(1);
    return row || null;
  },

  async findOne(filter: Record<string, unknown>) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'id': conditions.push(buildCondition(schema.serverEmojis.id, value, true)); break;
        case 'serverId': conditions.push(buildCondition(schema.serverEmojis.serverId, value, true)); break;
        case 'available': conditions.push(eq(schema.serverEmojis.available, value as boolean)); break;
      }
    }
    let query = db.select().from(schema.serverEmojis);
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
        case 'id': conditions.push(buildCondition(schema.serverEmojis.id, value, true)); break;
        case 'serverId': conditions.push(buildCondition(schema.serverEmojis.serverId, value, true)); break;
        case 'available': conditions.push(eq(schema.serverEmojis.available, value as boolean)); break;
      }
    }
    let query = db.select().from(schema.serverEmojis);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    return query;
  },

  async create(data: typeof schema.serverEmojis.$inferInsert) {
    const [row] = await db.insert(schema.serverEmojis).values(data).returning();
    return row;
  },

  async updateById(id: string, data: Partial<typeof schema.serverEmojis.$inferInsert>) {
    const [row] = await db.update(schema.serverEmojis).set({ ...data, updatedAt: new Date() }).where(eq(schema.serverEmojis.id, normalizeId(id))).returning();
    return row || null;
  },

  async deleteById(id: string) {
    await db.delete(schema.serverEmojis).where(eq(schema.serverEmojis.id, normalizeId(id)));
  },
};
