import mongoose from 'mongoose';

// Cache database connection across AWS Lambda container warm invocations
let cachedConnection: typeof mongoose | null = null;
let lastConnectionAttemptTime = 0;
let lastConnectionError: string | null = null;
const RETRY_INTERVAL_MS = 15000; // 15 seconds retry cooldown after failure

export function getDatabaseStatus(): {
  connected: boolean;
  cluster: string | null;
  error: string | null;
} {
  const isConnected = !!(cachedConnection && mongoose.connection.readyState === 1);
  return {
    connected: isConnected,
    cluster: isConnected ? mongoose.connection.host : null,
    error: isConnected ? null : lastConnectionError,
  };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // If MONGODB_URI is not provided, backend operates with in-memory adapter
    return null;
  }

  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // If recently failed, wait for cooldown before retrying to prevent blocking request loop
  const now = Date.now();
  if (lastConnectionError && now - lastConnectionAttemptTime < RETRY_INTERVAL_MS) {
    return null;
  }

  lastConnectionAttemptTime = now;

  try {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 30000,
    };

    const conn = await mongoose.connect(uri, opts);
    cachedConnection = conn;
    lastConnectionError = null;
    console.log('Successfully connected to MongoDB Atlas cluster:', mongoose.connection.name);
    return conn;
  } catch (err: any) {
    lastConnectionError = err.message;
    console.warn('MongoDB Atlas connection notice:', err.message);
    return null;
  }
}
