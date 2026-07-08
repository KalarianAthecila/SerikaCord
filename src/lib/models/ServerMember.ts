import { eq, and, type SQL } from 'drizzle-orm';
import { normalizeId, buildCondition } from '../db/normalizeId';
import { db, schema } from '../db/postgres';

export type IServerMember = typeof schema.serverMembers.$inferSelect;

export const ServerMember = {
  table: schema.serverMembers,

  async findById(id: string) {
    const [row] = await db.select().from(schema.serverMembers).where(eq(schema.serverMembers.id, normalizeId(id))).limit(1);
    return row || null;
  },

  async findOne(filter: Record<string, unknown>) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'id': conditions.push(buildCondition(schema.serverMembers.id, value, true)); break;
        case 'serverId': conditions.push(buildCondition(schema.serverMembers.serverId, value, true)); break;
        case 'userId': conditions.push(buildCondition(schema.serverMembers.userId, value, true)); break;
      }
    }
    let query = db.select().from(schema.serverMembers);
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
        case 'id': conditions.push(buildCondition(schema.serverMembers.id, value, true)); break;
        case 'serverId': conditions.push(buildCondition(schema.serverMembers.serverId, value, true)); break;
        case 'userId': conditions.push(buildCondition(schema.serverMembers.userId, value, true)); break;
      }
    }
    let query = db.select().from(schema.serverMembers);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    return query;
  },

  async create(data: typeof schema.serverMembers.$inferInsert) {
    const [row] = await db.insert(schema.serverMembers).values(data).returning();
    return row;
  },

  async updateById(id: string, data: Partial<typeof schema.serverMembers.$inferInsert>) {
    const [row] = await db.update(schema.serverMembers).set({ ...data, updatedAt: new Date() }).where(eq(schema.serverMembers.id, normalizeId(id))).returning();
    return row || null;
  },

  async deleteById(id: string) {
    await db.delete(schema.serverMembers).where(eq(schema.serverMembers.id, normalizeId(id)));
  },
};
