import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Submission from "@/models/Submission";
import mongoose from "mongoose";
import { redirect } from "next/navigation";
import SupplierOnboardingPortal from "@/app/supplier-onboarding-portal";
import { GuarantorFormData, SupplierFormData } from "@/app/components/forms/types";

export default async function EditSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (session.user.role !== "user") {
    redirect("/admin");
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    redirect("/dashboard");
  }

  await connectDB();
  const submission = await Submission.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(session.user.id),
  }).lean();

  if (!submission || submission.status !== "pending") {
    redirect("/dashboard");
  }

  return (
    <SupplierOnboardingPortal
      editSubmissionId={id}
      initialSubmission={{
        supplierData: submission.supplierData as SupplierFormData,
        guarantorData: submission.guarantorData as GuarantorFormData,
        supplierSignature: (submission.supplierSignature as string) ?? "",
        guarantorSignature: (submission.guarantorSignature as string) ?? "",
      }}
    />
  );
}
