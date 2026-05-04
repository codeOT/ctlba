import type { ApplicationSubmission } from "@/app/components/forms/types";

type SubmissionLike = {
  _id: { toString(): string };
  submittedAt?: Date;
  createdAt?: Date;
  status: string;
  supplierData: unknown;
  guarantorData: unknown;
  supplierSignature?: string;
  guarantorSignature?: string;
  supplierDocumentNames?: Record<string, string>;
  guarantorDocumentNames?: Record<string, string>;
};

export function toApplicationSubmission(doc: SubmissionLike): ApplicationSubmission {
  const id = doc._id.toString();
  return {
    id,
    submittedAt: doc.submittedAt
      ? new Date(doc.submittedAt).toLocaleString()
      : new Date(doc.createdAt ?? Date.now()).toLocaleString(),
    status: doc.status as ApplicationSubmission["status"],
    supplierData: doc.supplierData as ApplicationSubmission["supplierData"],
    guarantorData: doc.guarantorData as ApplicationSubmission["guarantorData"],
    supplierSignatureProvided: Boolean(doc.supplierSignature),
    guarantorSignatureProvided: Boolean(doc.guarantorSignature),
    supplierDocumentNames: (doc.supplierDocumentNames ?? {}) as Record<
      string,
      string
    >,
    guarantorDocumentNames: (doc.guarantorDocumentNames ?? {}) as Record<
      string,
      string
    >,
  };
}
