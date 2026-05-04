import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const from =
  process.env.EMAIL_FROM ?? "LBA Portal <onboarding@resend.dev>";

const submissionNotificationRecipients = (
  process.env.SUBMISSION_NOTIFY_TO ||
  "legal@cardinaltorch.com,account@cardinaltorch.com"
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  context: "user" | "admin"
) {
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY not set; password reset link (not sent):",
      resetUrl
    );
    return { skipped: true as const };
  }

  const roleLabel = context === "admin" ? "Administrator" : "Supplier";

  await resend.emails.send({
    from,
    to,
    subject: `${roleLabel} password reset`,
    text: `You requested a password reset for your ${roleLabel} account.\n\nOpen this link to choose a new password (expires in 1 hour):\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
  });

  return { skipped: false as const };
}

export async function sendSubmissionNotificationEmail(params: {
  submissionId: string;
  supplierName: string;
  submittedAt: Date;
  pdfBuffer: Buffer;
  uploadedFiles?: Array<{
    filename: string;
    content: Buffer;
  }>;
}) {
  const {
    submissionId,
    supplierName,
    submittedAt,
    pdfBuffer,
    uploadedFiles = [],
  } = params;
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY not set; submission notification not sent:",
      submissionId
    );
    return { skipped: true as const };
  }

  if (submissionNotificationRecipients.length === 0) {
    console.warn(
      "[email] No notification recipients configured; submission notification skipped:",
      submissionId
    );
    return { skipped: true as const };
  }

  await resend.emails.send({
    from,
    to: submissionNotificationRecipients,
    subject: `New LBA submission: ${supplierName || submissionId}`,
    text: `A new supplier form has been submitted.\n\nSubmission ID: ${submissionId}\nSupplier: ${
      supplierName || "N/A"
    }\nSubmitted At: ${submittedAt.toLocaleString()}\n\nThe PDF copy is attached.`,
    attachments: [
      {
        filename: `lba-submission-${submissionId}.pdf`,
        content: pdfBuffer.toString("base64"),
      },
      ...uploadedFiles.map((file) => ({
        filename: file.filename,
        content: file.content.toString("base64"),
      })),
    ],
  });

  return { skipped: false as const };
}
