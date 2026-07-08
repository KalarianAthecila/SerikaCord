import { eq, sql, and, type SQL } from 'drizzle-orm';
import { normalizeId, buildCondition } from '../db/normalizeId';
import { db, schema } from '../db/postgres';

export type IRole = typeof schema.roles.$inferSelect;

export const Role = {
  table: schema.roles,

  async findById(id: string) {
    const [row] = await db.select().from(schema.roles).where(eq(schema.roles.id, normalizeId(id))).limit(1);
    return row || null;
  },

  async findOne(filter: Record<string, unknown>) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'id': conditions.push(buildCondition(schema.roles.id, value, true)); break;
        case 'serverId': conditions.push(buildCondition(schema.roles.serverId, value, true)); break;
        case 'isDefault': conditions.push(eq(schema.roles.isDefault, value as boolean)); break;
      }
    }
    const [row] = await db.select().from(schema.roles).where(conditions.length > 0 ? and(...conditions) : undefined).limit(1);
    return row || null;
  },

  async find(filter: Record<string, unknown> = {}) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'id': conditions.push(buildCondition(schema.roles.id, value, true)); break;
        case 'serverId': conditions.push(buildCondition(schema.roles.serverId, value, true)); break;
        case 'isDefault': conditions.push(eq(schema.roles.isDefault, value as boolean)); break;
      }
    }
    let query = db.select().from(schema.roles);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    return query;
  },

  async create(data: typeof schema.roles.$inferInsert) {
    const [row] = await db.insert(schema.roles).values(data).returning();
    return row;
  },

  async updateById(id: string, data: Partial<typeof schema.roles.$inferInsert>) {
    const [row] = await db.update(schema.roles).set({ ...data, updatedAt: new Date() }).where(eq(schema.roles.id, normalizeId(id))).returning();
    return row || null;
  },

  async deleteById(id: string) {
    await db.delete(schema.roles).where(eq(schema.roles.id, normalizeId(id)));
  },
};
