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

export async function downloadGridFSFileById(fileId: string): Promise<{
  buffer: Buffer;
  contentType?: string;
  filename?: string;
} | null> {
  if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
    return null;
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection is not ready");
  }

  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: BUCKET_NAME,
  });

  const objectId = new mongoose.Types.ObjectId(fileId);
  const fileDoc = await bucket.find({ _id: objectId }).next();
  if (!fileDoc) {
    return null;
  }

  const chunks: Buffer[] = [];
  const downloadStream = bucket.openDownloadStream(objectId);
  downloadStream.on("data", (chunk: Buffer) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  });
  await finished(downloadStream);

  const metadata = (fileDoc.metadata ?? {}) as Record<string, unknown>;
  const contentType =
    (typeof metadata.contentType === "string" ? metadata.contentType : undefined) ??
    (typeof fileDoc.contentType === "string" ? fileDoc.contentType : undefined);

  return {
    buffer: Buffer.concat(chunks),
    contentType,
    filename: fileDoc.filename,
  };
}
