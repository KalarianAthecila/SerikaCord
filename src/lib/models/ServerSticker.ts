import { eq, and, type SQL } from 'drizzle-orm';
import { normalizeId, buildCondition } from '../db/normalizeId';
import { db, schema } from '../db/postgres';

export type IServerSticker = typeof schema.serverStickers.$inferSelect;

export const ServerSticker = {
  table: schema.serverStickers,

  async findById(id: string) {
    const [row] = await db.select().from(schema.serverStickers).where(eq(schema.serverStickers.id, normalizeId(id))).limit(1);
    return row || null;
  },

  async findOne(filter: Record<string, unknown>) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'id': conditions.push(buildCondition(schema.serverStickers.id, value, true)); break;
        case 'serverId': conditions.push(buildCondition(schema.serverStickers.serverId, value, true)); break;
        case 'available': conditions.push(eq(schema.serverStickers.available, value as boolean)); break;
      }
    }
    let query = db.select().from(schema.serverStickers);
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
        case 'id': conditions.push(buildCondition(schema.serverStickers.id, value, true)); break;
        case 'serverId': conditions.push(buildCondition(schema.serverStickers.serverId, value, true)); break;
        case 'available': conditions.push(eq(schema.serverStickers.available, value as boolean)); break;
      }
    }
    let query = db.select().from(schema.serverStickers);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    return query;
  },

  async create(data: typeof schema.serverStickers.$inferInsert) {
    const [row] = await db.insert(schema.serverStickers).values(data).returning();
    return row;
  },

  async updateById(id: string, data: Partial<typeof schema.serverStickers.$inferInsert>) {
    const [row] = await db.update(schema.serverStickers).set({ ...data, updatedAt: new Date() }).where(eq(schema.serverStickers.id, normalizeId(id))).returning();
    return row || null;
  },

  async deleteById(id: string) {
    await db.delete(schema.serverStickers).where(eq(schema.serverStickers.id, normalizeId(id)));
  },
};
