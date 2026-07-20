import { eq, and, type SQL } from 'drizzle-orm';
import { normalizeId } from '../db/normalizeId';
import { db, schema } from '../db/postgres';

export type IServerBan = typeof schema.serverBans.$inferSelect;

export const ServerBan = {
  table: schema.serverBans,

  async findById(id: string) {
    const [row] = await db.select().from(schema.serverBans).where(eq(schema.serverBans.id, normalizeId(id))).limit(1);
    return row || null;
  },

  async findOne(filter: Record<string, unknown>) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'serverId': conditions.push(eq(schema.serverBans.serverId, normalizeId(value as string))); break;
        case 'userId': conditions.push(eq(schema.serverBans.userId, normalizeId(value as string))); break;
      }
    }
    let query = db.select().from(schema.serverBans);
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
        case 'serverId': conditions.push(eq(schema.serverBans.serverId, normalizeId(value as string))); break;
        case 'userId': conditions.push(eq(schema.serverBans.userId, normalizeId(value as string))); break;
      }
    }
    let query = db.select().from(schema.serverBans);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    return query;
  },

  async create(data: typeof schema.serverBans.$inferInsert) {
    const [row] = await db.insert(schema.serverBans).values(data).returning();
    return row;
  },

  async updateById(id: string, data: Partial<typeof schema.serverBans.$inferInsert>) {
    const [row] = await db.update(schema.serverBans).set(data).where(eq(schema.serverBans.id, normalizeId(id))).returning();
    return row || null;
  },

  async deleteById(id: string) {
    await db.delete(schema.serverBans).where(eq(schema.serverBans.id, normalizeId(id)));
  },
};
