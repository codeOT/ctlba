import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as { mongoose?: MongooseCache };

const cache: MongooseCache = globalForMongoose.mongoose ?? {
  conn: null,
  promise: null,
};

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = cache;
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri);
  }
  cache.conn = await cache.promise;

  const { ensureAdminFromEnv } = await import("@/lib/ensure-admin-from-env");
  await ensureAdminFromEnv();

  return cache.conn;
}
