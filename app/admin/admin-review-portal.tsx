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
  const lines: string[] = [
    "LBA SUPPLIER APPLICATION REVIEW REPORT",
    "======================================",
    `Submission ID: ${entry.id}`,
    `Submission Time: ${entry.submittedAt}`,
    `Review Status: ${entry.status.toUpperCase()}`,
    "",
    "Supplier Information",
    `Business Name: ${entry.supplierData.registeredCompanyName}`,
    `Business Trading Name: ${entry.supplierData.businessTradingName}`,
    `Registration Number: ${entry.supplierData.companyRegistrationNumber}`,
    `Supplier Email: ${entry.supplierData.email}`,
    `Supplier Phone: ${entry.supplierData.telephoneNumber}`,
    `Supplier Address: ${entry.supplierData.address}`,
    `Supplier Signature Provided: ${entry.supplierSignatureProvided ? "Yes" : "No"}`,
    "",
    "Guarantor Information",
    `Guarantor Name: ${entry.guarantorData.name}`,
    `Relationship: ${entry.guarantorData.relationshipWithApplicant}`,
    `Guarantor Email: ${entry.guarantorData.emailAddress}`,
    `Guarantor Phone: ${entry.guarantorData.telephoneNumber}`,
    `Guarantor Address: ${entry.guarantorData.address}`,
    `Guarantor Signature Provided: ${
      entry.guarantorSignatureProvided ? "Yes" : "No"
    }`,
    "",
    "Supplier Uploaded Documents",
    ...Object.entries(entry.supplierDocumentNames).map(
      ([key, value]) => `- ${key}: ${value || "Not provided"}`
    ),
    "",
    "Guarantor Uploaded Documents",
    ...Object.entries(entry.guarantorDocumentNames).map(
      ([key, value]) => `- ${key}: ${value || "Not provided"}`
    ),
  ];

  let y = 48;
  const pageHeight = doc.internal.pageSize.getHeight();
  const lineHeight = 14;

  for (const line of lines) {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 48;
    }
    doc.text(line, 40, y);
    y += lineHeight;
  }

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
          <div className="hidden min-w-[240px] flex-1 rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-zinc-600 md:block">
            Cardinal Torch Operations
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              User Portal
            </Link>
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
