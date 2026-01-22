import Redis from 'ioredis';
import { config } from '../config';

let redis: Redis | null = null;
let subscriber: Redis | null = null;
let publisher: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: true,
      reconnectOnError: (err) => {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ECONNREFUSED'];
        return targetErrors.some(e => err.message.includes(e));
      },
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    redis.on('close', () => {
      console.log('⚠️ Redis connection closed');
    });
  }
  
  return redis;
}

// For pub/sub - need separate connections
export function getPublisher(): Redis {
  if (!publisher) {
    publisher = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    publisher.on('error', (err) => console.error('❌ Redis publisher error:', err.message));
  }
  return publisher;
}

export function getSubscriber(): Redis {
  if (!subscriber) {
    subscriber = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    subscriber.on('error', (err) => console.error('❌ Redis subscriber error:', err.message));
  }
  return subscriber;
}

// Cache utilities
export class CacheService {
  private redis: Redis;
  private defaultTTL: number = 300; // 5 minutes

  constructor() {
    this.redis = getRedis();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.setex(key, this.defaultTTL, serialized);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  // User presence
  async setUserOnline(userId: string, socketId: string): Promise<void> {
    await this.redis.hset('user:presence', userId, JSON.stringify({
      status: 'online',
      socketId,
      lastSeen: Date.now(),
    }));
    await this.redis.sadd('online:users', userId);
  }

  async setUserOffline(userId: string): Promise<void> {
    const presence = await this.redis.hget('user:presence', userId);
    if (presence) {
      const data = JSON.parse(presence);
      await this.redis.hset('user:presence', userId, JSON.stringify({
        ...data,
        status: 'offline',
        lastSeen: Date.now(),
      }));
    }
    await this.redis.srem('online:users', userId);
  }

  async getUserPresence(userId: string): Promise<{ status: string; lastSeen: number } | null> {
    const presence = await this.redis.hget('user:presence', userId);
    return presence ? JSON.parse(presence) : null;
  }

  async getOnlineUsers(): Promise<string[]> {
    return this.redis.smembers('online:users');
  }

  // Typing indicators
  async setTyping(channelId: string, userId: string): Promise<void> {
    const key = `typing:${channelId}`;
    await this.redis.hset(key, userId, Date.now().toString());
    await this.redis.expire(key, 10); // Expire after 10 seconds
  }

  async getTypingUsers(channelId: string): Promise<string[]> {
    const key = `typing:${channelId}`;
    const typing = await this.redis.hgetall(key);
    const now = Date.now();
    const threshold = 8000; // 8 seconds
    
    return Object.entries(typing)
      .filter(([, timestamp]) => now - parseInt(timestamp) < threshold)
      .map(([userId]) => userId);
  }
}

export const cache = new CacheService();

export async function disconnectRedis(): Promise<void> {
  if (redis) await redis.quit();
  if (subscriber) await subscriber.quit();
  if (publisher) await publisher.quit();
  console.log('🔌 Redis connections closed');
}
