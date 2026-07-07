import mongoose from 'mongoose';
import { config } from '../config';

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(config.MONGO_URI, {
      dbName: config.MONGO_DB_NAME,
      // A pool of 10 queues requests once ~10 are in flight; every queued
      // request then waits up to socketTimeoutMS, which is what produced the
      // "message took 50s to send" behaviour under concurrency. Give the pool
      // real headroom and keep warm connections around.
      maxPoolSize: config.MONGO_MAX_POOL_SIZE ?? 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Fail fast instead of hanging when the pool is saturated.
      waitQueueTimeoutMS: 10000,
      compressors: ['zlib'],
    });

    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  
  await mongoose.disconnect();
  isConnected = false;
  console.log('🔌 MongoDB disconnected');
}

export { mongoose };
