"use client";

import { FormEvent, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { jsPDF } from "jspdf";
import GuarantorForm from "./components/forms/guarantor-form";
import SupplierForm from "./components/forms/supplier-form";
import {
  defaultGuarantorData,
  defaultGuarantorSupportingDocuments,
  defaultSupplierData,
  defaultSupportingDocuments,
  GuarantorFormData,
  GuarantorSupportingDocuments,
  SupplierFormData,
  SupportingDocuments,
} from "./components/forms/types";
import {
  GUARANTOR_FILE_FIELDS,
  SUPPLIER_FILE_FIELDS,
} from "@/lib/submission-files";

type Step = "supplier" | "guarantor" | "complete";
const DRAFT_STORAGE_KEY = "lba_submission_draft_v1";

type DraftPayload = {
  step?: Step;
  supplierData?: SupplierFormData;
  guarantorData?: GuarantorFormData;
  supplierSignature?: string;
  guarantorSignature?: string;
};

type SupplierOnboardingPortalProps = {
  editSubmissionId?: string;
  initialSubmission?: {
    supplierData: SupplierFormData;
    guarantorData: GuarantorFormData;
    supplierSignature: string;
    guarantorSignature: string;
  };
};

function readDraft(key: string): DraftPayload | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as DraftPayload;
  } catch {
    return null;
  }
}

export default function SupplierOnboardingPortal({
  editSubmissionId,
  initialSubmission,
}: SupplierOnboardingPortalProps) {
  const { data: session } = useSession();
  const draftKey = editSubmissionId
    ? `${DRAFT_STORAGE_KEY}_${editSubmissionId}`
    : DRAFT_STORAGE_KEY;
  const draft = readDraft(draftKey);
  const [step, setStep] = useState<Step>(() => {
    return draft?.step && draft.step !== "complete" ? draft.step : "supplier";
  });
  const [supplierData, setSupplierData] = useState<SupplierFormData>(
    () =>
      draft?.supplierData ??
      initialSubmission?.supplierData ??
      defaultSupplierData
  );
  const [guarantorData, setGuarantorData] = useState<GuarantorFormData>(
    () =>
      draft?.guarantorData ??
      initialSubmission?.guarantorData ??
      defaultGuarantorData
  );
  const [supportingDocuments, setSupportingDocuments] = useState<SupportingDocuments>(
    defaultSupportingDocuments
  );
  const [guarantorSupportingDocuments, setGuarantorSupportingDocuments] =
    useState<GuarantorSupportingDocuments>(defaultGuarantorSupportingDocuments);
  const [supplierSignature, setSupplierSignature] = useState(
    () => draft?.supplierSignature ?? initialSubmission?.supplierSignature ?? ""
  );
  const [guarantorSignature, setGuarantorSignature] = useState(
    () => draft?.guarantorSignature ?? initialSubmission?.guarantorSignature ?? ""
  );
  const [submittedAt, setSubmittedAt] = useState<string>("");
  const [isSubmittingSupplierStep, setIsSubmittingSupplierStep] = useState(false);
  const [isSubmittingFinalStep, setIsSubmittingFinalStep] = useState(false);

  useEffect(() => {
    if (step === "complete") {
      return;
    }
    const draft = {
      step,
      supplierData,
      guarantorData,
      supplierSignature,
      guarantorSignature,
    };
    window.localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [
    draftKey,
    guarantorData,
    guarantorSignature,
    step,
    supplierData,
    supplierSignature,
  ]);

  const handleSupplierSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingSupplierStep(true);
    setStep("guarantor");
    setIsSubmittingSupplierStep(false);
  };

  const handleGuarantorSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!guarantorSignature) {
      window.alert("Please draw or upload the guarantor signature.");
      return;
    }
    setIsSubmittingFinalStep(true);

    const supplierDocumentNames: Record<string, string> = {};
    for (const key of SUPPLIER_FILE_FIELDS) {
      const file = supportingDocuments[key];
      if (file) {
        supplierDocumentNames[key] = file.name;
      }
    }
    const guarantorDocumentNames: Record<string, string> = {};
    for (const key of GUARANTOR_FILE_FIELDS) {
      const file = guarantorSupportingDocuments[key];
      if (file) {
        guarantorDocumentNames[key] = file.name;
      }
    }

    const formData = new FormData();
    formData.append(
      "payload",
      JSON.stringify({
        supplierData,
        guarantorData,
        supplierSignature,
        guarantorSignature,
        supplierDocumentNames,
        guarantorDocumentNames,
      })
    );

    for (const key of SUPPLIER_FILE_FIELDS) {
      const file = supportingDocuments[key];
      if (file) {
        formData.append(key, file);
      }
    }
    for (const key of GUARANTOR_FILE_FIELDS) {
      const file = guarantorSupportingDocuments[key];
      if (file) {
        formData.append(key, file);
      }
    }

    try {
      const endpoint = editSubmissionId
        ? `/api/submissions/${editSubmissionId}`
        : "/api/submissions";
      const response = await fetch(endpoint, {
        method: editSubmissionId ? "PATCH" : "POST",
        body: formData,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        window.alert(body.error ?? "Submission failed. Please try again.");
        setIsSubmittingFinalStep(false);
        return;
      }
      window.localStorage.removeItem(draftKey);
      const now = new Date().toLocaleString();
      setSubmittedAt(now);
      setStep("complete");
    } catch {
      window.alert("Submission failed. Please check your connection and try again.");
    } finally {
      setIsSubmittingFinalStep(false);
    }
  };

  const handleDownloadCopy = async () => {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 28;
    const tableWidth = pageWidth - margin * 2;
    const labelWidth = tableWidth * 0.45;
    const valueWidth = tableWidth - labelWidth;
    const lineHeight = 12;
    let y = 34;
    const supplierPassportFile = supportingDocuments.supplierPassport;
    const guarantorPassportFile = guarantorSupportingDocuments.passportPhotograph;

    const readImageFileAsDataUrl = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = typeof reader.result === "string" ? reader.result : "";
          if (!result) {
            reject(new Error("Could not read image file"));
            return;
          }
          resolve(result);
        };
        reader.onerror = () => reject(new Error("Could not read image file"));
        reader.readAsDataURL(file);
      });

    const loadImageDataUrl = async (file: File | null | undefined) => {
      if (!file || !file.type.startsWith("image/")) {
        return null;
      }
      try {
        return await readImageFileAsDataUrl(file);
      } catch {
        return null;
      }
    };
    const getJsPdfImageType = (dataUrl: string) =>
      dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";

    const supplierPassportImage = await loadImageDataUrl(supplierPassportFile);
    const guarantorPassportImage = await loadImageDataUrl(guarantorPassportFile);

    const addPageIfNeeded = (neededHeight: number) => {
      if (y + neededHeight <= pageHeight - 32) {
        return;
      }
      pdf.addPage();
      y = 34;
    };

    const drawSectionTitle = (title: string) => {
      addPageIfNeeded(26);
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, y, tableWidth, 20, "F");
      pdf.setDrawColor(120, 120, 120);
      pdf.rect(margin, y, tableWidth, 20);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(title, margin + 8, y + 13);
      y += 20;
    };

    const drawRow = (label: string, value: string) => {
      const labelLines = pdf.splitTextToSize(label || "-", labelWidth - 10);
      const valueLines = pdf.splitTextToSize(value || "-", valueWidth - 10);
      const rowLineCount = Math.max(labelLines.length, valueLines.length, 1);
      const rowHeight = Math.max(18, rowLineCount * lineHeight + 6);
      addPageIfNeeded(rowHeight);

      pdf.setDrawColor(150, 150, 150);
      pdf.rect(margin, y, labelWidth, rowHeight);
      pdf.rect(margin + labelWidth, y, valueWidth, rowHeight);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(labelLines, margin + 4, y + 12);
      pdf.text(valueLines, margin + labelWidth + 4, y + 12);
      y += rowHeight;
    };

    if (supplierPassportImage) {
      const imageW = 68;
      const imageH = 86;
      pdf.setDrawColor(150, 150, 150);
      pdf.rect(margin, y, imageW, imageH);
      pdf.addImage(
        supplierPassportImage,
        getJsPdfImageType(supplierPassportImage),
        margin + 1,
        y + 1,
        imageW - 2,
        imageH - 2
      );
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text("Supplier Passport", margin, y + imageH + 10);

      const textX = margin + imageW + 12;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("CARDINAL TORCH COMPANY LIMITED", textX, y + 16);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("Supplier Application Form", textX, y + 34);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(`Generated: ${submittedAt || new Date().toLocaleString()}`, textX, y + 50);
      y += imageH + 22;
    } else {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("CARDINAL TORCH COMPANY LIMITED", margin, y);
      y += 18;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("Supplier Application Form", margin, y);
      y += 18;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(`Generated: ${submittedAt || new Date().toLocaleString()}`, margin, y);
      y += 14;
    }

    drawSectionTitle("Business Information");
    drawRow("Date", supplierData.date);
    drawRow("Type of Business", supplierData.typeOfBusiness);
    drawRow(
      "Registered Company Name / Business Name",
      supplierData.registeredCompanyName
    );
    drawRow("Business Trading Name", supplierData.businessTradingName);
    drawRow(
      "Company/Business Registration Number",
      supplierData.companyRegistrationNumber
    );
    drawRow(
      "Member of Cocoa Association of Nigeria?",
      supplierData.cocoaAssociationMember
    );
    drawRow("Nature of Business", supplierData.natureOfBusiness);
    drawRow("Address", supplierData.address);
    drawRow("E-mail Address", supplierData.email);
    drawRow("Telephone Number", supplierData.telephoneNumber);
    drawRow("VAT Number", supplierData.vatNumber);
    drawRow("TIN Number", supplierData.tinNumber);
    drawRow("Years in Business", supplierData.yearsInBusiness);

    drawSectionTitle("Directors / Partners / Proprietors - 1");
    drawRow("Name", supplierData.director1Name);
    drawRow("NIN", supplierData.director1Nin);
    drawRow("BVN", supplierData.director1Bvn);
    drawRow("Telephone Number", supplierData.director1Telephone);
    drawRow("Address", supplierData.director1Address);
    drawRow("E-mail Address", supplierData.director1Email);

    drawSectionTitle("Directors / Partners / Proprietors - 2");
    drawRow("Name", supplierData.director2Name);
    drawRow("NIN", supplierData.director2Nin);
    drawRow("BVN", supplierData.director2Bvn);
    drawRow("Telephone Number", supplierData.director2Telephone);
    drawRow("Address", supplierData.director2Address);
    drawRow("E-mail Address", supplierData.director2Email);

    drawSectionTitle("Business Banking Information");
    drawRow("Bank Name", supplierData.bankName);
    drawRow("Account Number", supplierData.accountNumber);
    drawRow("Account Name", supplierData.accountName);
    drawRow("Payment Method", supplierData.paymentMethod);

    drawSectionTitle("Declaration by Applicant");
    drawRow("Name", supplierData.declarationName);
    drawRow("Title", supplierData.declarationTitle);
    drawRow("Signature Date", supplierData.declarationSignatureDate);
    drawRow("Signature Provided", supplierSignature ? "Yes" : "No");

    drawSectionTitle("Required Supporting Documents");
    drawRow(
      "Supplier Passport Photograph",
      supportingDocuments.supplierPassport?.name ?? "-"
    );
    drawRow(
      "Certificate of incorporation of business",
      supportingDocuments.certificateOfIncorporation?.name ?? "-"
    );
    drawRow("Status report of business", supportingDocuments.statusReport?.name ?? "-");
    drawRow(
      "Letter acknowledging annual returns filing",
      supportingDocuments.annualReturnsLetter?.name ?? "-"
    );
    drawRow(
      "Proof of current business address",
      supportingDocuments.currentBusinessAddressProof?.name ?? "-"
    );
    drawRow(
      "Proof of registration with FIRS",
      supportingDocuments.firsRegistrationProof?.name ?? "-"
    );
    drawRow(
      "Audited financial statements",
      supportingDocuments.auditedFinancialStatements?.name ?? "-"
    );
    drawRow(
      "Valid means of identification",
      supportingDocuments.validMeansOfIdentification?.name ?? "-"
    );
    drawRow(
      "Executed Guarantor Form",
      supportingDocuments.executedGuarantorForm?.name ?? "-"
    );

    drawSectionTitle("Guarantor Information");
    if (guarantorPassportImage) {
      const rowHeight = 96;
      addPageIfNeeded(rowHeight);
      pdf.setDrawColor(150, 150, 150);
      pdf.rect(margin, y, labelWidth, rowHeight);
      pdf.rect(margin + labelWidth, y, valueWidth, rowHeight);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text("Guarantor Passport Photograph", margin + 4, y + 14);
      pdf.addImage(
        guarantorPassportImage,
        getJsPdfImageType(guarantorPassportImage),
        margin + labelWidth + 6,
        y + 6,
        70,
        84
      );
      y += rowHeight;
    }
    drawRow("Date", guarantorData.date);
    drawRow("Name", guarantorData.name);
    drawRow("Gender", guarantorData.gender);
    drawRow("Type of Identification", guarantorData.identificationType);
    drawRow("Identification Number", guarantorData.identificationNumber);
    drawRow("Address", guarantorData.address);
    drawRow("Nationality", guarantorData.nationality);
    drawRow("State of Origin", guarantorData.stateOfOrigin);
    drawRow("Local Government Area", guarantorData.localGovernmentArea);
    drawRow("Telephone Number", guarantorData.telephoneNumber);
    drawRow("NIN", guarantorData.nin);
    drawRow("BVN", guarantorData.bvn);
    drawRow("Occupation", guarantorData.occupation);
    drawRow("Years in Business/Profession", guarantorData.yearsInProfession);
    drawRow("Net Worth", guarantorData.netWorth);
    drawRow("E-mail Address", guarantorData.emailAddress);
    drawRow(
      "Relationship with Applicant",
      guarantorData.relationshipWithApplicant
    );
    drawRow("Contract Reference", guarantorData.declarationContractReference);
    drawRow("Guarantor Declaration Name", guarantorData.declarationGuarantorName);
    drawRow("Guarantor Signature Date", guarantorData.declarationSignatureDate);
    drawRow("Guarantor Signature Provided", guarantorSignature ? "Yes" : "No");
    drawRow(
      "Passport Photograph",
      guarantorSupportingDocuments.passportPhotograph?.name ?? "-"
    );
    drawRow(
      "Means of Identification",
      guarantorSupportingDocuments.meansOfIdentification?.name ?? "-"
    );
    drawRow(
      "Proof of Present Address (Utility Bills)",
      guarantorSupportingDocuments.proofOfPresentAddress?.name ?? "-"
    );

    pdf.save(`lba-supplier-submission-${Date.now()}.pdf`);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-8 text-zinc-900 md:pb-12">
      <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Image src="/ct1.png" alt="Cardinal Torch Logo" width={34} height={34} />
            <span className="text-lg font-semibold text-zinc-900">LBA Portal</span>
          </div>
        
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
      <section className="mx-auto w-full max-w-5xl rounded-lg border border-zinc-300 bg-white p-6 shadow-sm md:p-10">
       <span className="flex justify-center ">
        <Image src="/ct1.png" alt="Cardinal Torch Logo" width={200} height={70} className="mb-6" />
       </span>
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            LBA Portal
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">
            Supplier Onboarding
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            Complete the Supplier Application Form and Guarantor Form online.
            After submission, download a copy for your records.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
          <span
            className={`rounded border px-3 py-1.5 ${
              step === "supplier"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                : "border-zinc-300 bg-zinc-100 text-zinc-600"
            }`}
          >
            1. Supplier Form
          </span>
          <span
            className={`rounded border px-3 py-1.5 ${
              step === "guarantor"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                : "border-zinc-300 bg-zinc-100 text-zinc-600"
            }`}
          >
            2. Guarantor Form
          </span>
          <span
            className={`rounded border px-3 py-1.5 ${
              step === "complete"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                : "border-zinc-300 bg-zinc-100 text-zinc-600"
            }`}
          >
            3. Complete
          </span>
        </div>

        {step === "supplier" && (
          <SupplierForm
            supplierData={supplierData}
            setSupplierData={setSupplierData}
            supportingDocuments={supportingDocuments}
            setSupportingDocuments={setSupportingDocuments}
            supplierSignature={supplierSignature}
            setSupplierSignature={setSupplierSignature}
            onSubmit={handleSupplierSubmit}
            isSubmitting={isSubmittingSupplierStep}
          />
        )}

        {step === "guarantor" && (
          <GuarantorForm
            guarantorData={guarantorData}
            setGuarantorData={setGuarantorData}
            guarantorSupportingDocuments={guarantorSupportingDocuments}
            setGuarantorSupportingDocuments={setGuarantorSupportingDocuments}
            guarantorSignature={guarantorSignature}
            setGuarantorSignature={setGuarantorSignature}
            onBack={() => setStep("supplier")}
            onSubmit={handleGuarantorSubmit}
            isSubmitting={isSubmittingFinalStep}
          />
        )}

        {step === "complete" && (
          <div className="space-y-5 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-xl font-semibold text-emerald-900">
              Submission Completed
            </h2>
            <p className="text-emerald-900">
              Thank you. Your Supplier Application and Guarantor Form were
              completed on {submittedAt}.
            </p>
            <p className="text-sm text-emerald-900/80">
              Your submission is stored securely. An administrator will review it in the
              admin dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDownloadCopy}
                className="rounded-lg bg-emerald-700 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-600"
              >
                Download Copy (.pdf)
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg border border-emerald-700 px-5 py-2.5 font-medium text-emerald-800 transition hover:bg-emerald-100"
              >
                Print This Page
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
