import mongoose from "mongoose";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";

const BUCKET_NAME = "submission_uploads";

export async function uploadBufferToGridFS(
  buffer: Buffer,
  filename: string,
  metadata: Record<string, unknown>
): Promise<string> {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection is not ready");
  }

  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: BUCKET_NAME,
  });

  const uploadStream = bucket.openUploadStream(filename, { metadata });
  Readable.from(buffer).pipe(uploadStream);
  await finished(uploadStream);
  return uploadStream.id.toString();
}
