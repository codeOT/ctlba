import { auth } from "@/auth";
import { uploadBufferToGridFS } from "@/lib/gridfs";
import { connectDB } from "@/lib/mongodb";
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

const patchSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

const updatePayloadSchema = z.object({
  supplierData: z.any(),
  guarantorData: z.any(),
  supplierSignature: z.string().optional(),
  guarantorSignature: z.string().optional(),
  supplierDocumentNames: z.record(z.string(), z.string()).optional(),
  guarantorDocumentNames: z.record(z.string(), z.string()).optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();

  const filter =
    session.user.role === "admin"
      ? { _id: new mongoose.Types.ObjectId(id) }
      : {
          _id: new mongoose.Types.ObjectId(id),
          userId: new mongoose.Types.ObjectId(session.user.id),
        };

  const submission = await Submission.findOne(filter);
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ submission: toApplicationSubmission(submission) });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();

  if (session.user.role === "admin") {
    let body: z.infer<typeof patchSchema>;
    try {
      const json = await request.json();
      const parsed = patchSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid body" }, { status: 400 });
      }
      body = parsed.data;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const updated = await Submission.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ submission: toApplicationSubmission(updated) });
  }

  if (session.user.role !== "user") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await Submission.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(session.user.id),
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending submissions can be edited" },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const payloadRaw = formData.get("payload");
  if (typeof payloadRaw !== "string") {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }

  let parsedPayload: z.infer<typeof updatePayloadSchema>;
  try {
    const json = JSON.parse(payloadRaw);
    const parsed = updatePayloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    parsedPayload = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const supplierDocumentNames: Record<string, string> = {
    ...(existing.supplierDocumentNames as Record<string, string>),
    ...(parsedPayload.supplierDocumentNames ?? {}),
  };
  const guarantorDocumentNames: Record<string, string> = {
    ...(existing.guarantorDocumentNames as Record<string, string>),
    ...(parsedPayload.guarantorDocumentNames ?? {}),
  };
  const supplierFileIds: Record<string, string> = {
    ...(existing.supplierFileIds as Record<string, string>),
  };
  const guarantorFileIds: Record<string, string> = {
    ...(existing.guarantorFileIds as Record<string, string>),
  };

  try {
    for (const key of SUPPLIER_FILE_FIELDS) {
      const file = formData.get(key);
      if (file instanceof File && file.size > 0) {
        if (file.size > MAX_UPLOAD_BYTES) {
          return NextResponse.json(
            { error: `File ${key} exceeds 10MB` },
            { status: 400 }
          );
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadId = await uploadBufferToGridFS(buffer, file.name, {
          field: key,
          owner: session.user.id,
          kind: "supplier",
          mode: "edit",
        });
        supplierFileIds[key] = uploadId;
        supplierDocumentNames[key] = file.name;
      }
    }

    for (const key of GUARANTOR_FILE_FIELDS) {
      const file = formData.get(key);
      if (file instanceof File && file.size > 0) {
        if (file.size > MAX_UPLOAD_BYTES) {
          return NextResponse.json(
            { error: `File ${key} exceeds 10MB` },
            { status: 400 }
          );
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadId = await uploadBufferToGridFS(buffer, file.name, {
          field: key,
          owner: session.user.id,
          kind: "guarantor",
          mode: "edit",
        });
        guarantorFileIds[key] = uploadId;
        guarantorDocumentNames[key] = file.name;
      }
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }

  existing.supplierData = parsedPayload.supplierData;
  existing.guarantorData = parsedPayload.guarantorData;
  existing.supplierSignature = parsedPayload.supplierSignature ?? "";
  existing.guarantorSignature = parsedPayload.guarantorSignature ?? "";
  existing.supplierDocumentNames = supplierDocumentNames;
  existing.guarantorDocumentNames = guarantorDocumentNames;
  existing.supplierFileIds = supplierFileIds;
  existing.guarantorFileIds = guarantorFileIds;
  await existing.save();

  return NextResponse.json({ submission: toApplicationSubmission(existing) });
}
