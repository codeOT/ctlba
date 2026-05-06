"use client";

import { Dispatch, FormEvent, SetStateAction } from "react";
import {
  FileField,
  Field,
  SectionCard,
  SignatureField,
  TextArea,
} from "./shared-fields";
import { SupplierFormData, SupportingDocuments } from "./types";

type SupplierFormProps = {
  supplierData: SupplierFormData;
  setSupplierData: Dispatch<SetStateAction<SupplierFormData>>;
  supportingDocuments: SupportingDocuments;
  setSupportingDocuments: Dispatch<SetStateAction<SupportingDocuments>>;
  supplierSignature: string;
  setSupplierSignature: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting?: boolean;
};

export default function SupplierForm({
  supplierData,
  setSupplierData,
  setSupportingDocuments,
  supplierSignature,
  setSupplierSignature,
  onSubmit,
  isSubmitting = false,
}: SupplierFormProps) {
  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <SectionCard title="Business Information">
        <Field
          label="Date"
          type="date"
          value={supplierData.date}
          onChange={(value) => setSupplierData((prev) => ({ ...prev, date: value }))}
        />
        <Field
          label="Type of Business (Company/Partnership/Business Name/Any other)"
          value={supplierData.typeOfBusiness}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, typeOfBusiness: value }))
          }
        />
        <Field
          label="Registered Company Name / Business Name"
          value={supplierData.registeredCompanyName}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, registeredCompanyName: value }))
          }
        />
        <Field
          label="Business Trading Name"
          value={supplierData.businessTradingName}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, businessTradingName: value }))
          }
        />
        <Field
          label="Company/Business Registration Number"
          value={supplierData.companyRegistrationNumber}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, companyRegistrationNumber: value }))
          }
        />
        <Field
          label="Is the Business a Member of Cocoa Association of Nigeria?"
          value={supplierData.cocoaAssociationMember}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, cocoaAssociationMember: value }))
          }
        />
        <Field
          label="Nature of Business"
          value={supplierData.natureOfBusiness}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, natureOfBusiness: value }))
          }
        />
        <Field
          label="Email Address"
          type="email"
          value={supplierData.email}
          onChange={(value) => setSupplierData((prev) => ({ ...prev, email: value }))}
        />
        <Field
          label="Telephone Number"
          type="tel"
          value={supplierData.telephoneNumber}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, telephoneNumber: value }))
          }
        />
        <Field
          label="VAT Number"
          value={supplierData.vatNumber}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, vatNumber: value }))
          }
        />
        <Field
          label="TIN Number"
          value={supplierData.tinNumber}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, tinNumber: value }))
          }
        />
        <Field
          label="Years in Business"
          value={supplierData.yearsInBusiness}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, yearsInBusiness: value }))
          }
        />
        <div className="md:col-span-2">
          <TextArea
            label="Address"
            value={supplierData.address}
            onChange={(value) =>
              setSupplierData((prev) => ({ ...prev, address: value }))
            }
          />
        </div>
      </SectionCard>

      <SectionCard title="Details of Present Directors/Partners/Proprietors - 1">
        <Field
          label="Director/Partner/Proprietor's Name"
          value={supplierData.director1Name}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, director1Name: value }))
          }
        />
        <Field
          label="Director/Partner/Proprietor's NIN"
          value={supplierData.director1Nin}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, director1Nin: value }))
          }
        />
        <Field
          label="Director/Partner/Proprietor's BVN"
          value={supplierData.director1Bvn}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, director1Bvn: value }))
          }
        />
        <Field
          label="Director/Partner/Proprietor's Telephone Number"
          type="tel"
          value={supplierData.director1Telephone}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, director1Telephone: value }))
          }
        />
        <Field
          label="E-mail Address"
          type="email"
          value={supplierData.director1Email}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, director1Email: value }))
          }
        />
        <div className="md:col-span-2">
          <TextArea
            label="Director/Partner/Proprietor's Address"
            value={supplierData.director1Address}
            onChange={(value) =>
              setSupplierData((prev) => ({ ...prev, director1Address: value }))
            }
          />
        </div>
      </SectionCard>

      <SectionCard title="Details of Present Directors/Partners/Proprietors - 2">
        <Field
          label="Director/Partner/Proprietor's Name"
          value={supplierData.director2Name}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, director2Name: value }))
          }
        />
        <Field
          label="Director/Partner/Proprietor's NIN"
          value={supplierData.director2Nin}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, director2Nin: value }))
          }
        />
        <Field
          label="Director/Partner/Proprietor's BVN"
          value={supplierData.director2Bvn}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, director2Bvn: value }))
          }
        />
        <Field
          label="Director/Partner/Proprietor's Telephone Number"
          type="tel"
          value={supplierData.director2Telephone}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, director2Telephone: value }))
          }
        />
        <Field
          label="E-mail Address"
          type="email"
          value={supplierData.director2Email}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, director2Email: value }))
          }
        />
        <div className="md:col-span-2">
          <TextArea
            label="Director/Partner/Proprietor's Address"
            value={supplierData.director2Address}
            onChange={(value) =>
              setSupplierData((prev) => ({ ...prev, director2Address: value }))
            }
          />
        </div>
      </SectionCard>

      <SectionCard title="Business Banking Information">
        <Field
          label="Bank Name"
          value={supplierData.bankName}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, bankName: value }))
          }
        />
        <Field
          label="Account Number"
          value={supplierData.accountNumber}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, accountNumber: value }))
          }
        />
        <Field
          label="Account Name"
          value={supplierData.accountName}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, accountName: value }))
          }
        />
        <Field
          label="Payment Method"
          value={supplierData.paymentMethod}
          onChange={(value) =>
            setSupplierData((prev) => ({ ...prev, paymentMethod: value }))
          }
        />
      </SectionCard>

      <section className="rounded-xl border border-zinc-200 p-4 md:p-5">
        <h3 className="mb-3 text-base font-semibold text-zinc-900">
          Declaration by the Applicant
        </h3>
        <p className="mb-4 text-sm leading-6 text-zinc-700">
          I, the undersigned, warrant that the information provided is true and
          correct. In case of any change in any of the aforementioned particulars,
          I undertake to notify you in writing. I accept that any
          misrepresentation in this document will be considered evidence of fraud,
          as this information is the basis for the transaction.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Name"
            value={supplierData.declarationName}
            onChange={(value) =>
              setSupplierData((prev) => ({ ...prev, declarationName: value }))
            }
          />
          <Field
            label="Title"
            value={supplierData.declarationTitle}
            onChange={(value) =>
              setSupplierData((prev) => ({ ...prev, declarationTitle: value }))
            }
          />
          <Field
            label="Signature Date"
            type="date"
            value={supplierData.declarationSignatureDate}
            onChange={(value) =>
              setSupplierData((prev) => ({ ...prev, declarationSignatureDate: value }))
            }
          />
          <SignatureField
            label="Signature"
            signatureDataUrl={supplierSignature}
            onSignatureChange={setSupplierSignature}
          />
        </div>
      </section>

      <div>
        
      </div>

      <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 md:p-5">
        <h3 className="mb-3 text-base font-semibold text-zinc-900">
          Required Supporting Documents
        </h3>
        <p className="mb-4 text-sm text-zinc-700">
          Upload all documents below. Every file is required.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <FileField
            label="Supplier Passport Photograph"
            onChange={(file) =>
              setSupportingDocuments((prev) => ({
                ...prev,
                supplierPassport: file,
              }))
            }
          />
          <FileField
            label="Certificate of incorporation of business"
            onChange={(file) =>
              setSupportingDocuments((prev) => ({
                ...prev,
                certificateOfIncorporation: file,
              }))
            }
          />
          <FileField
            label="Status report of business"
            onChange={(file) =>
              setSupportingDocuments((prev) => ({ ...prev, statusReport: file }))
            }
          />
          <FileField
            label="Letter acknowledging annual returns filing"
            onChange={(file) =>
              setSupportingDocuments((prev) => ({ ...prev, annualReturnsLetter: file }))
            }
          />
          <FileField
            label="Proof of current business address"
            onChange={(file) =>
              setSupportingDocuments((prev) => ({
                ...prev,
                currentBusinessAddressProof: file,
              }))
            }
          />
          <FileField
            label="Proof of registration with FIRS"
            onChange={(file) =>
              setSupportingDocuments((prev) => ({
                ...prev,
                firsRegistrationProof: file,
              }))
            }
          />
          <FileField
            label="Audited financial statements"
            onChange={(file) =>
              setSupportingDocuments((prev) => ({
                ...prev,
                auditedFinancialStatements: file,
              }))
            }
          />
          <FileField
            label="Valid means of identification of Directors/Partners/Proprietor"
            onChange={(file) =>
              setSupportingDocuments((prev) => ({
                ...prev,
                validMeansOfIdentification: file,
              }))
            }
          />
          <FileField
            label="Executed Guarantor Form"
            onChange={(file) =>
              setSupportingDocuments((prev) => ({
                ...prev,
                executedGuarantorForm: file,
              }))
            }
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-zinc-900 px-5 py-2.5 font-medium text-white transition hover:bg-zinc-700 sm:w-auto"
        >
          {isSubmitting ? "Please wait..." : "Continue to Guarantor Form"}
        </button>
      </div>
    </form>
  );
}
