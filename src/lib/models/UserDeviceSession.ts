import { eq, and, type SQL } from 'drizzle-orm';
import { normalizeId } from '../db/normalizeId';
import { db, schema } from '../db/postgres';

export type IUserDeviceSession = typeof schema.userDeviceSessions.$inferSelect;

export const UserDeviceSession = {
  table: schema.userDeviceSessions,

  async findById(id: string) {
    const [row] = await db.select().from(schema.userDeviceSessions).where(eq(schema.userDeviceSessions.id, normalizeId(id))).limit(1);
    return row || null;
  },

  async findOne(filter: Record<string, unknown>) {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;
      switch (key) {
        case 'userId': conditions.push(eq(schema.userDeviceSessions.userId, normalizeId(value as string))); break;
      }
    }
    let query = db.select().from(schema.userDeviceSessions);
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
        case 'userId': conditions.push(eq(schema.userDeviceSessions.userId, normalizeId(value as string))); break;
      }
    }
    let query = db.select().from(schema.userDeviceSessions);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    return query;
  },

  async create(data: typeof schema.userDeviceSessions.$inferInsert) {
    const [row] = await db.insert(schema.userDeviceSessions).values(data).returning();
    return row;
  },

  async updateById(id: string, data: Partial<typeof schema.userDeviceSessions.$inferInsert>) {
    const [row] = await db.update(schema.userDeviceSessions).set({ ...data, updatedAt: new Date() }).where(eq(schema.userDeviceSessions.id, normalizeId(id))).returning();
    return row || null;
  },

  async deleteById(id: string) {
    await db.delete(schema.userDeviceSessions).where(eq(schema.userDeviceSessions.id, normalizeId(id)));
  },
};
