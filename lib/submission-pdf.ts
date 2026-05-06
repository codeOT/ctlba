import type { GuarantorFormData, SupplierFormData } from "@/app/components/forms/types";
import { jsPDF } from "jspdf";

type SubmissionPdfInput = {
  submissionId: string;
  submittedAt: Date;
  supplierData: SupplierFormData;
  guarantorData: GuarantorFormData;
  supplierDocumentNames: Record<string, string>;
  guarantorDocumentNames: Record<string, string>;
};

export async function generateSubmissionPdfBuffer(
  input: SubmissionPdfInput
): Promise<Buffer> {
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
  doc.text(`Submission ID: ${input.submissionId}`, margin, y);
  y += 12;
  doc.text(`Submitted: ${input.submittedAt.toLocaleString()}`, margin, y);
  y += 14;

  drawSectionTitle("Business Information");
  drawRow("Date", input.supplierData.date);
  drawRow("Type of Business", input.supplierData.typeOfBusiness);
  drawRow(
    "Registered Company Name / Business Name",
    input.supplierData.registeredCompanyName
  );
  drawRow("Business Trading Name", input.supplierData.businessTradingName);
  drawRow(
    "Company/Business Registration Number",
    input.supplierData.companyRegistrationNumber
  );
  drawRow(
    "Member of Cocoa Association of Nigeria?",
    input.supplierData.cocoaAssociationMember
  );
  drawRow("Nature of Business", input.supplierData.natureOfBusiness);
  drawRow("Address", input.supplierData.address);
  drawRow("E-mail Address", input.supplierData.email);
  drawRow("Telephone Number", input.supplierData.telephoneNumber);
  drawRow("VAT Number", input.supplierData.vatNumber);
  drawRow("TIN Number", input.supplierData.tinNumber);
  drawRow("Years in Business", input.supplierData.yearsInBusiness);

  drawSectionTitle("Directors / Partners / Proprietors - 1");
  drawRow("Name", input.supplierData.director1Name);
  drawRow("NIN", input.supplierData.director1Nin);
  drawRow("BVN", input.supplierData.director1Bvn);
  drawRow("Telephone Number", input.supplierData.director1Telephone);
  drawRow("Address", input.supplierData.director1Address);
  drawRow("E-mail Address", input.supplierData.director1Email);

  drawSectionTitle("Directors / Partners / Proprietors - 2");
  drawRow("Name", input.supplierData.director2Name);
  drawRow("NIN", input.supplierData.director2Nin);
  drawRow("BVN", input.supplierData.director2Bvn);
  drawRow("Telephone Number", input.supplierData.director2Telephone);
  drawRow("Address", input.supplierData.director2Address);
  drawRow("E-mail Address", input.supplierData.director2Email);

  drawSectionTitle("Business Banking Information");
  drawRow("Bank Name", input.supplierData.bankName);
  drawRow("Account Number", input.supplierData.accountNumber);
  drawRow("Account Name", input.supplierData.accountName);
  drawRow("Payment Method", input.supplierData.paymentMethod);

  drawSectionTitle("Declaration by Applicant");
  drawRow("Name", input.supplierData.declarationName);
  drawRow("Title", input.supplierData.declarationTitle);
  drawRow("Signature Date", input.supplierData.declarationSignatureDate);

  drawSectionTitle("Required Supporting Documents");
  drawRow(
    "Supplier Passport Photograph",
    input.supplierDocumentNames.supplierPassport ?? "-"
  );
  drawRow(
    "Certificate of incorporation of business",
    input.supplierDocumentNames.certificateOfIncorporation ?? "-"
  );
  drawRow(
    "Status report of business",
    input.supplierDocumentNames.statusReport ?? "-"
  );
  drawRow(
    "Letter acknowledging annual returns filing",
    input.supplierDocumentNames.annualReturnsLetter ?? "-"
  );
  drawRow(
    "Proof of current business address",
    input.supplierDocumentNames.currentBusinessAddressProof ?? "-"
  );
  drawRow(
    "Proof of registration with FIRS",
    input.supplierDocumentNames.firsRegistrationProof ?? "-"
  );
  drawRow(
    "Audited financial statements",
    input.supplierDocumentNames.auditedFinancialStatements ?? "-"
  );
  drawRow(
    "Valid means of identification",
    input.supplierDocumentNames.validMeansOfIdentification ?? "-"
  );
  drawRow(
    "Executed Guarantor Form",
    input.supplierDocumentNames.executedGuarantorForm ?? "-"
  );

  drawSectionTitle("Guarantor Information");
  drawRow("Date", input.guarantorData.date);
  drawRow("Name", input.guarantorData.name);
  drawRow("Gender", input.guarantorData.gender);
  drawRow("Type of Identification", input.guarantorData.identificationType);
  drawRow("Identification Number", input.guarantorData.identificationNumber);
  drawRow("Address", input.guarantorData.address);
  drawRow("Nationality", input.guarantorData.nationality);
  drawRow("State of Origin", input.guarantorData.stateOfOrigin);
  drawRow("Local Government Area", input.guarantorData.localGovernmentArea);
  drawRow("Telephone Number", input.guarantorData.telephoneNumber);
  drawRow("NIN", input.guarantorData.nin);
  drawRow("BVN", input.guarantorData.bvn);
  drawRow("Occupation", input.guarantorData.occupation);
  drawRow(
    "Years in Business/Profession",
    input.guarantorData.yearsInProfession
  );
  drawRow("Net Worth", input.guarantorData.netWorth);
  drawRow("E-mail Address", input.guarantorData.emailAddress);
  drawRow(
    "Relationship with Applicant",
    input.guarantorData.relationshipWithApplicant
  );
  drawRow("Contract Reference", input.guarantorData.declarationContractReference);
  drawRow("Guarantor Declaration Name", input.guarantorData.declarationGuarantorName);
  drawRow(
    "Guarantor Signature Date",
    input.guarantorData.declarationSignatureDate
  );
  drawRow(
    "Passport Photograph",
    input.guarantorDocumentNames.passportPhotograph ?? "-"
  );
  drawRow(
    "Means of Identification",
    input.guarantorDocumentNames.meansOfIdentification ?? "-"
  );
  drawRow(
    "Proof of Present Address (Utility Bills)",
    input.guarantorDocumentNames.proofOfPresentAddress ?? "-"
  );

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
