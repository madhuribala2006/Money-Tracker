import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;
let connectionAttempted = false;
let connectionError: string | null = null;

export async function connectDB(): Promise<boolean> {
  if (isConnected) return true;
  connectionAttempted = true;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Database] MONGODB_URI not provided. Using local persistent file storage.');
    return false;
  }

  try {
    // Attempt connection with short timeout so server boots instantly even if local MongoDB is not listening
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 3000,
    });
    isConnected = true;
    connectionError = null;
    console.log('[Database] Successfully connected to MongoDB at', uri.replace(/\/\/.*@/, '//***@'));
    return true;
  } catch (err: any) {
    connectionError = err.message || 'Unknown MongoDB connection error';
    console.warn(`[Database] MongoDB connection failed (${connectionError}). Using local persistent file storage instead.`);
    return false;
  }
}

export function getDatabaseStatus() {
  return {
    isConnected,
    connectionAttempted,
    connectionError,
    engine: isConnected ? 'MongoDB' : 'Local persistent file store',
    mongooseReadyState: mongoose.connection.readyState,
  };
}
