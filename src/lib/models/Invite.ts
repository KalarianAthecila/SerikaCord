import { eq, and, type SQL } from 'drizzle-orm';
import { normalizeId } from '../db/normalizeId';
import { db, schema } from '../db/postgres';

export type IInvite = typeof schema.invites.$inferSelect;

export const Invite = {
  table: schema.invites,

  async findById(id: string) {
    const [row] = await db.select().from(schema.invites).where(eq(schema.invites.id, normalizeId(id))).limit(1);
    return row || null;
  },

  async findOne(filter: Record<string, unknown>) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'code': conditions.push(eq(schema.invites.code, value as string)); break;
        case 'serverId': conditions.push(eq(schema.invites.serverId, normalizeId(value as string))); break;
        case 'isVanity': conditions.push(eq(schema.invites.isVanity, value as boolean)); break;
      }
    }
    let query = db.select().from(schema.invites);
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
        case 'code': conditions.push(eq(schema.invites.code, value as string)); break;
        case 'serverId': conditions.push(eq(schema.invites.serverId, normalizeId(value as string))); break;
        case 'isVanity': conditions.push(eq(schema.invites.isVanity, value as boolean)); break;
      }
    }
    let query = db.select().from(schema.invites);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    return query;
  },

  async create(data: typeof schema.invites.$inferInsert) {
    const [row] = await db.insert(schema.invites).values(data).returning();
    return row;
  },

  async updateById(id: string, data: Partial<typeof schema.invites.$inferInsert>) {
    const [row] = await db.update(schema.invites).set({ ...data, updatedAt: new Date() }).where(eq(schema.invites.id, normalizeId(id))).returning();
    return row || null;
  },

  async deleteById(id: string) {
    await db.delete(schema.invites).where(eq(schema.invites.id, normalizeId(id)));
  },
};
