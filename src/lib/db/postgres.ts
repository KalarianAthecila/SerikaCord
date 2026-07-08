import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, type PoolClient } from 'pg';
import { config } from '../config';
import * as schema from './schema';

let pool: Pool | null = null;
let _dbInstance: DB | null = null;
let isConnected = false;

export type DB = ReturnType<typeof drizzle<typeof schema>>;

export function getDb(): DB {
  if (!_dbInstance) {
    pool = new Pool({
      connectionString: config.POSTGRES_URI,
      max: config.POSTGRES_MAX_POOL_SIZE ?? 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    _dbInstance = drizzle(pool, { schema });

    pool.on('connect', () => {
      isConnected = true;
    });

    pool.on('error', (err) => {
      console.error('❌ PostgreSQL pool error:', err.message);
      isConnected = false;
    });

    console.log('✅ PostgreSQL pool created');
  }
  return _dbInstance;
}

// Lazy proxy so `import { db } from './postgres'` works without calling getDb() first
export const db = new Proxy({} as DB, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export async function connectDB(): Promise<DB> {
  if (isConnected && _dbInstance) {
    return _dbInstance;
  }

  const database = getDb();

  try {
    const client = await pool!.connect();
    await client.query('SELECT 1');
    client.release();
    isConnected = true;
    console.log('✅ PostgreSQL connected');
    return database;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    isConnected = false;
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!pool) return;
  await pool.end();
  pool = null;
  _dbInstance = null;
  isConnected = false;
  console.log('🔌 PostgreSQL disconnected');
}

export async function getClient(): Promise<PoolClient> {
  if (!pool) getDb();
  return pool!.connect();
}

export { schema };
