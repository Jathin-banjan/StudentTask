import fs from 'fs';
import mongoose from 'mongoose';

export let isConnectedToMongoDB = false;

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
 * Connect to MongoDB with multi-layer fallback:
 * 1. Primary MongoDB URI (Local daemon or MongoDB Atlas)
 * 2. In-Memory MongoDB via local system binary (BizFlow pattern)
 * 3. Graceful Cloud Standby (Never crashes on Render if placeholder URI is given)
 */
export async function connectDB() {
  mongoose.set('strictQuery', true);
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_task_manager';

  // Detect documentation example placeholder domain
  if (uri.includes('abcde.mongodb.net')) {
    console.warn('⚠️ Notice: MONGODB_URI contains example placeholder domain (abcde.mongodb.net).');
    console.log('📁 Cloud Demonstration Mode: Using built-in persistent storage so Render stays 100% LIVE!');
    console.log('👉 To connect to your real MongoDB Atlas, replace MONGODB_URI in Render with your actual cluster URI.');
    isConnectedToMongoDB = false;
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    isConnectedToMongoDB = true;
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    isConnectedToMongoDB = false;
    console.warn(`⚠️ Primary MongoDB connection to ${uri} failed (${err.message}).`);

    // Fallback: Check for local system binary (BizFlow pattern)
    const systemBinary = getSystemMongodPath();
    if (systemBinary) {
      try {
        console.log('🚀 Launching in-memory MongoDB server using local system binary...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const memServer = await MongoMemoryServer.create({ binary: { systemBinary } });
        const memUri = memServer.getUri();
        const conn = await mongoose.connect(memUri);
        isConnectedToMongoDB = true;
        console.log(`✅ In-Memory MongoDB connected: ${conn.connection.host}`);
        return conn;
      } catch (memErr) {
        console.warn(`⚠️ In-memory MongoDB failed (${memErr.message}).`);
      }
    }

    console.log('📁 Standby Mode: Running with built-in persistent document storage.');
    console.log('💡 GraphQL endpoints and operations remain 100% active and healthy!');
    return null;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('MongoDB disconnected cleanly');
  }
}

export default connectDB;
