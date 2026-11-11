import fs from 'fs';
import mongoose from 'mongoose';

let memServer = null;

/**
 * Locate local MongoDB server binary on Windows
 * (BizFlow 360 pattern: avoids downloading binary from the internet)
 */
function getSystemMongodPath() {
  if (process.env.MONGOMS_SYSTEM_BINARY && fs.existsSync(process.env.MONGOMS_SYSTEM_BINARY)) {
    return process.env.MONGOMS_SYSTEM_BINARY;
  }
  const candidatePaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

/**
 * Connect to MongoDB with automatic In-Memory fallback
 * (Matching BizFlow 360 database architecture)
 */
export async function connectDB() {
  mongoose.set('strictQuery', true);
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_task_manager';

  try {
    // Attempt standard connection to MongoDB daemon / Atlas
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });

    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️ Standard MongoDB connection to ${uri} failed (${err.message}).`);
    console.log('🚀 Spinning up in-memory MongoDB server using local system binary for instant zero-config execution (BizFlow pattern)...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const systemBinary = getSystemMongodPath();
      const options = systemBinary ? { binary: { systemBinary } } : {};

      memServer = await MongoMemoryServer.create(options);
      const memUri = memServer.getUri();
      const conn = await mongoose.connect(memUri);

      console.log(`✅ In-Memory MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB fallback:', memErr.message);
      throw memErr;
    }
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('MongoDB disconnected cleanly');
  }
  if (memServer) {
    await memServer.stop();
  }
}

export default connectDB;
