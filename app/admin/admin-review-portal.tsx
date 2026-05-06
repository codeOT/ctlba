"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import { ApplicationSubmission } from "../components/forms/types";

type StatusFilter = "all" | "pending" | "accepted" | "rejected";

function downloadSubmissionPdf(entry: ApplicationSubmission) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 28;
  const tableWidth = pageWidth - margin * 2;
  const labelWidth = tableWidth * 0.45;
  const valueWidth = tableWidth - labelWidth;
  const lineHeight = 12;
  let y = 34;

  const addPageIfNeeded = (neededHeight: number) => {
    if (y + neededHeight <= pageHeight - 32) {
      return;
    }
    doc.addPage();
    y = 34;
  };

  const drawSectionTitle = (title: string) => {
    addPageIfNeeded(26);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, tableWidth, 20, "F");
    doc.setDrawColor(120, 120, 120);
    doc.rect(margin, y, tableWidth, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title, margin + 8, y + 13);
    y += 20;
  };

  const drawRow = (label: string, value: string) => {
    const labelLines = doc.splitTextToSize(label || "-", labelWidth - 10);
    const valueLines = doc.splitTextToSize(value || "-", valueWidth - 10);
    const rowLineCount = Math.max(labelLines.length, valueLines.length, 1);
    const rowHeight = Math.max(18, rowLineCount * lineHeight + 6);
    addPageIfNeeded(rowHeight);

    doc.setDrawColor(150, 150, 150);
    doc.rect(margin, y, labelWidth, rowHeight);
    doc.rect(margin + labelWidth, y, valueWidth, rowHeight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(labelLines, margin + 4, y + 12);
    doc.text(valueLines, margin + labelWidth + 4, y + 12);
    y += rowHeight;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("CARDINAL TORCH COMPANY LIMITED", margin, y);
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Supplier Application Form", margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Submission ID: ${entry.id}`, margin, y);
  y += 12;
  doc.text(`Submitted: ${entry.submittedAt}`, margin, y);
  y += 12;
  doc.text(`Review Status: ${entry.status.toUpperCase()}`, margin, y);
  y += 14;

  drawSectionTitle("Business Information");
  drawRow("Date", entry.supplierData.date);
  drawRow("Type of Business", entry.supplierData.typeOfBusiness);
  drawRow(
    "Registered Company Name / Business Name",
    entry.supplierData.registeredCompanyName
  );
  drawRow("Business Trading Name", entry.supplierData.businessTradingName);
  drawRow(
    "Company/Business Registration Number",
    entry.supplierData.companyRegistrationNumber
  );
  drawRow(
    "Member of Cocoa Association of Nigeria?",
    entry.supplierData.cocoaAssociationMember
  );
  drawRow("Nature of Business", entry.supplierData.natureOfBusiness);
  drawRow("Address", entry.supplierData.address);
  drawRow("E-mail Address", entry.supplierData.email);
  drawRow("Telephone Number", entry.supplierData.telephoneNumber);
  drawRow("VAT Number", entry.supplierData.vatNumber);
  drawRow("TIN Number", entry.supplierData.tinNumber);
  drawRow("Years in Business", entry.supplierData.yearsInBusiness);

  drawSectionTitle("Directors / Partners / Proprietors - 1");
  drawRow("Name", entry.supplierData.director1Name);
  drawRow("NIN", entry.supplierData.director1Nin);
  drawRow("BVN", entry.supplierData.director1Bvn);
  drawRow("Telephone Number", entry.supplierData.director1Telephone);
  drawRow("Address", entry.supplierData.director1Address);
  drawRow("E-mail Address", entry.supplierData.director1Email);

  drawSectionTitle("Directors / Partners / Proprietors - 2");
  drawRow("Name", entry.supplierData.director2Name);
  drawRow("NIN", entry.supplierData.director2Nin);
  drawRow("BVN", entry.supplierData.director2Bvn);
  drawRow("Telephone Number", entry.supplierData.director2Telephone);
  drawRow("Address", entry.supplierData.director2Address);
  drawRow("E-mail Address", entry.supplierData.director2Email);

  drawSectionTitle("Business Banking Information");
  drawRow("Bank Name", entry.supplierData.bankName);
  drawRow("Account Number", entry.supplierData.accountNumber);
  drawRow("Account Name", entry.supplierData.accountName);
  drawRow("Payment Method", entry.supplierData.paymentMethod);

  drawSectionTitle("Declaration by Applicant");
  drawRow("Name", entry.supplierData.declarationName);
  drawRow("Title", entry.supplierData.declarationTitle);
  drawRow("Signature Date", entry.supplierData.declarationSignatureDate);
  drawRow("Signature Provided", entry.supplierSignatureProvided ? "Yes" : "No");

  drawSectionTitle("Required Supporting Documents");
  drawRow(
    "Supplier Passport Photograph",
    entry.supplierDocumentNames.supplierPassport ?? "-"
  );
  drawRow(
    "Certificate of incorporation of business",
    entry.supplierDocumentNames.certificateOfIncorporation ?? "-"
  );
  drawRow("Status report of business", entry.supplierDocumentNames.statusReport ?? "-");
  drawRow(
    "Letter acknowledging annual returns filing",
    entry.supplierDocumentNames.annualReturnsLetter ?? "-"
  );
  drawRow(
    "Proof of current business address",
    entry.supplierDocumentNames.currentBusinessAddressProof ?? "-"
  );
  drawRow(
    "Proof of registration with FIRS",
    entry.supplierDocumentNames.firsRegistrationProof ?? "-"
  );
  drawRow(
    "Audited financial statements",
    entry.supplierDocumentNames.auditedFinancialStatements ?? "-"
  );
  drawRow(
    "Valid means of identification",
    entry.supplierDocumentNames.validMeansOfIdentification ?? "-"
  );
  drawRow(
    "Executed Guarantor Form",
    entry.supplierDocumentNames.executedGuarantorForm ?? "-"
  );

  drawSectionTitle("Guarantor Information");
  drawRow("Date", entry.guarantorData.date);
  drawRow("Name", entry.guarantorData.name);
  drawRow("Gender", entry.guarantorData.gender);
  drawRow("Type of Identification", entry.guarantorData.identificationType);
  drawRow("Identification Number", entry.guarantorData.identificationNumber);
  drawRow("Address", entry.guarantorData.address);
  drawRow("Nationality", entry.guarantorData.nationality);
  drawRow("State of Origin", entry.guarantorData.stateOfOrigin);
  drawRow("Local Government Area", entry.guarantorData.localGovernmentArea);
  drawRow("Telephone Number", entry.guarantorData.telephoneNumber);
  drawRow("NIN", entry.guarantorData.nin);
  drawRow("BVN", entry.guarantorData.bvn);
  drawRow("Occupation", entry.guarantorData.occupation);
  drawRow("Years in Business/Profession", entry.guarantorData.yearsInProfession);
  drawRow("Net Worth", entry.guarantorData.netWorth);
  drawRow("E-mail Address", entry.guarantorData.emailAddress);
  drawRow(
    "Relationship with Applicant",
    entry.guarantorData.relationshipWithApplicant
  );
  drawRow("Contract Reference", entry.guarantorData.declarationContractReference);
  drawRow("Guarantor Declaration Name", entry.guarantorData.declarationGuarantorName);
  drawRow("Guarantor Signature Date", entry.guarantorData.declarationSignatureDate);
  drawRow("Guarantor Signature Provided", entry.guarantorSignatureProvided ? "Yes" : "No");
  drawRow(
    "Passport Photograph",
    entry.guarantorDocumentNames.passportPhotograph ?? "-"
  );
  drawRow(
    "Means of Identification",
    entry.guarantorDocumentNames.meansOfIdentification ?? "-"
  );
  drawRow(
    "Proof of Present Address (Utility Bills)",
    entry.guarantorDocumentNames.proofOfPresentAddress ?? "-"
  );

  doc.save(`lba-submission-${entry.id}.pdf`);
}

export default function AdminReviewPortal() {
  const [submissions, setSubmissions] = useState<ApplicationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/submissions");
        if (!active) {
          return;
        }
        if (response.ok) {
          const data = (await response.json()) as ApplicationSubmission[];
          setSubmissions(data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleDecision = async (id: string, status: "accepted" | "rejected") => {
    const response = await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      window.alert(body.error ?? "Update failed.");
      return;
    }
    const updated = body.submission as ApplicationSubmission;
    setSubmissions((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const filteredSubmissions = submissions.filter((item) => {
    const statusMatch = filter === "all" || item.status === filter;
    const searchTerm = search.trim().toLowerCase();
    const searchMatch =
      searchTerm.length === 0 ||
      item.supplierData.registeredCompanyName.toLowerCase().includes(searchTerm) ||
      item.guarantorData.name.toLowerCase().includes(searchTerm);
    return statusMatch && searchMatch;
  });

  const pendingCount = submissions.filter((item) => item.status === "pending").length;
  const acceptedCount = submissions.filter((item) => item.status === "accepted").length;
  const rejectedCount = submissions.filter((item) => item.status === "rejected").length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-8 md:pb-12">
      <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Image src="/ct1.png" alt="Cardinal Torch Logo" width={34} height={34} />
            <span className="text-lg font-semibold text-zinc-900">LBA Admin</span>
          </div>
          
          <div className="flex items-center gap-2">
           
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
      <section className="mx-auto w-full max-w-6xl rounded-lg border border-zinc-300 bg-white p-6 shadow-sm md:p-10">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              LBA Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              Submission Review
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Review supplier applications, accept or reject submissions, and export PDFs.
            </p>
          </div>
        </header>

        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Total
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">
              {submissions.length}
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Pending
            </p>
            <p className="mt-1 text-2xl font-semibold text-amber-900">
              {pendingCount}
            </p>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Accepted
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-900">
              {acceptedCount}
            </p>
          </div>
          <div className="rounded-md border border-rose-200 bg-rose-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
              Rejected
            </p>
            <p className="mt-1 text-2xl font-semibold text-rose-900">
              {rejectedCount}
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-2">
          <input
            type="text"
            placeholder="Search by supplier or guarantor name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as StatusFilter)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600">
            Loading submissions…
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600">
            No submissions found for this filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((item) => (
              <article
                key={item.id}
                className="rounded-md border border-zinc-200 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900">
                      {item.supplierData.registeredCompanyName || "Unnamed Supplier"}
                    </h2>
                    <p className="text-sm text-zinc-600">
                      Submitted: {item.submittedAt}
                    </p>
                    <p className="text-sm text-zinc-600">
                      Guarantor: {item.guarantorData.name || "N/A"}
                    </p>
                    <p className="text-xs text-zinc-500">ID: {item.id}</p>
                  </div>
                  <span
                    className={`rounded border px-3 py-1 text-xs font-semibold uppercase ${
                      item.status === "accepted"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : item.status === "rejected"
                          ? "border-rose-300 bg-rose-50 text-rose-700"
                          : "border-amber-300 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <details className="mt-4 rounded-md border border-zinc-200 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-zinc-800">
                    View submission details
                  </summary>
                  <div className="mt-3 grid gap-4 text-sm text-zinc-700 md:grid-cols-2">
                    <div>
                      <p className="font-semibold text-zinc-900">Supplier</p>
                      <p>Business: {item.supplierData.registeredCompanyName || "N/A"}</p>
                      <p>Email: {item.supplierData.email || "N/A"}</p>
                      <p>Phone: {item.supplierData.telephoneNumber || "N/A"}</p>
                      <p>Address: {item.supplierData.address || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">Guarantor</p>
                      <p>Name: {item.guarantorData.name || "N/A"}</p>
                      <p>Email: {item.guarantorData.emailAddress || "N/A"}</p>
                      <p>Phone: {item.guarantorData.telephoneNumber || "N/A"}</p>
                      <p>Address: {item.guarantorData.address || "N/A"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-semibold text-zinc-900">Supplier Documents</p>
                      <ul className="list-disc pl-5">
                        {Object.entries(item.supplierDocumentNames).map(([key, value]) => (
                          <li key={key}>
                            {key}: {value || "Not provided"}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-semibold text-zinc-900">Guarantor Documents</p>
                      <ul className="list-disc pl-5">
                        {Object.entries(item.guarantorDocumentNames).map(([key, value]) => (
                          <li key={key}>
                            {key}: {value || "Not provided"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleDecision(item.id, "accepted")}
                    className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDecision(item.id, "rejected")}
                    className="rounded-md bg-rose-700 px-3 py-2 text-sm font-medium text-white hover:bg-rose-600"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadSubmissionPdf(item)}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                  >
                    Download PDF
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
