import { auth } from "@/auth";
import { uploadBufferToGridFS } from "@/lib/gridfs";
import { connectDB } from "@/lib/mongodb";
import { sendSubmissionNotificationEmail } from "@/lib/email";
import { generateSubmissionPdfBuffer } from "@/lib/submission-pdf";
import {
  GUARANTOR_FILE_FIELDS,
  MAX_UPLOAD_BYTES,
  SUPPLIER_FILE_FIELDS,
} from "@/lib/submission-files";
import { toApplicationSubmission } from "@/lib/serialize-submission";
import Submission from "@/models/Submission";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

const payloadSchema = z.object({
  supplierData: z.any(),
  guarantorData: z.any(),
  supplierSignature: z.string().optional(),
  guarantorSignature: z.string().optional(),
  supplierDocumentNames: z.record(z.string(), z.string()).optional(),
  guarantorDocumentNames: z.record(z.string(), z.string()).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  if (session.user.role === "admin") {
    const docs = await Submission.find().sort({ submittedAt: -1 }).lean();
    return NextResponse.json(docs.map((d) => toApplicationSubmission(d)));
  }

  if (session.user.role !== "user") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const docs = await Submission.find({
    userId: new mongoose.Types.ObjectId(session.user.id),
  })
    .sort({ submittedAt: -1 })
    .lean();

  return NextResponse.json(docs.map((d) => toApplicationSubmission(d)));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "user") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const formData = await request.formData();
  const payloadRaw = formData.get("payload");
  if (typeof payloadRaw !== "string") {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }

  let parsedPayload: z.infer<typeof payloadSchema>;
  try {
    const json = JSON.parse(payloadRaw);
    const parsed = payloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    parsedPayload = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const supplierDocumentNames: Record<string, string> = {
    ...(parsedPayload.supplierDocumentNames ?? {}),
  };
  const guarantorDocumentNames: Record<string, string> = {
    ...(parsedPayload.guarantorDocumentNames ?? {}),
  };

  const supplierFileIds: Record<string, string> = {};
  const guarantorFileIds: Record<string, string> = {};
  const uploadedFileAttachments: Array<{ filename: string; content: Buffer }> = [];

  try {
    await Promise.all(
      SUPPLIER_FILE_FIELDS.map(async (key) => {
        const file = formData.get(key);
        if (!(file instanceof File) || file.size <= 0) {
          return;
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new Error(`File ${key} exceeds 10MB`);
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const id = await uploadBufferToGridFS(buffer, file.name, {
          field: key,
          owner: session.user.id,
          kind: "supplier",
        });
        supplierFileIds[key] = id;
        supplierDocumentNames[key] = file.name;
        uploadedFileAttachments.push({ filename: file.name, content: buffer });
      })
    );

    await Promise.all(
      GUARANTOR_FILE_FIELDS.map(async (key) => {
        const file = formData.get(key);
        if (!(file instanceof File) || file.size <= 0) {
          return;
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new Error(`File ${key} exceeds 10MB`);
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const id = await uploadBufferToGridFS(buffer, file.name, {
          field: key,
          owner: session.user.id,
          kind: "guarantor",
        });
        guarantorFileIds[key] = id;
        guarantorDocumentNames[key] = file.name;
        uploadedFileAttachments.push({ filename: file.name, content: buffer });
      })
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("exceeds 10MB")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }

  const submission = await Submission.create({
    userId: new mongoose.Types.ObjectId(session.user.id),
    status: "pending",
    supplierData: parsedPayload.supplierData,
    guarantorData: parsedPayload.guarantorData,
    supplierSignature: parsedPayload.supplierSignature ?? "",
    guarantorSignature: parsedPayload.guarantorSignature ?? "",
    supplierDocumentNames,
    guarantorDocumentNames,
    supplierFileIds,
    guarantorFileIds,
    submittedAt: new Date(),
  });

  void (async () => {
    try {
      const pdfBuffer = await generateSubmissionPdfBuffer({
        submissionId: submission._id.toString(),
        submittedAt: submission.submittedAt,
        supplierData: parsedPayload.supplierData,
        guarantorData: parsedPayload.guarantorData,
        supplierDocumentNames,
        guarantorDocumentNames,
      });

      await sendSubmissionNotificationEmail({
        submissionId: submission._id.toString(),
        supplierName:
          parsedPayload.supplierData?.registeredCompanyName ??
          parsedPayload.supplierData?.businessTradingName ??
          "",
        submittedAt: submission.submittedAt,
        pdfBuffer,
        uploadedFiles: uploadedFileAttachments,
      });
    } catch (error) {
      console.error("[submission-email] failed to send notification", error);
    }
  })();

  return NextResponse.json(
    { id: submission._id.toString(), submission: toApplicationSubmission(submission) },
    { status: 201 }
  );
}
