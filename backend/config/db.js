import mongoose from 'mongoose';

/**
 * MongoDB Database Connection Module
 * 
 * Demonstrates:
 * - Connecting to MongoDB using Mongoose ODM with custom timeouts
 * - Graceful fallback to persistent JSON document storage when
 *   MongoDB daemon is not actively running (ensures 100% flawless viva demo)
 */

export let isConnectedToMongoDB = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_task_manager';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnectedToMongoDB = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    isConnectedToMongoDB = false;
    console.warn(`⚠️ Local MongoDB daemon is inactive at ${uri} (${err.message})`);
    console.log(`📁 Demonstration Mode Active: Using persistent file-backed document storage ('backend/data/tasks.json').`);
    console.log(`💡 All GraphQL queries, mutations, additions, edits, and deletions will persist to disk!`);
    return null;
  }
};

export default connectDB;
