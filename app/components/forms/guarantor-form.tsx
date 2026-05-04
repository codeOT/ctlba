"use client";

import { Dispatch, FormEvent, SetStateAction } from "react";
import {
  FileField,
  Field,
  SectionCard,
  SignatureField,
  TextArea,
} from "./shared-fields";
import {
  GuarantorFormData,
  GuarantorSupportingDocuments,
} from "./types";

type GuarantorFormProps = {
  guarantorData: GuarantorFormData;
  setGuarantorData: Dispatch<SetStateAction<GuarantorFormData>>;
  guarantorSupportingDocuments: GuarantorSupportingDocuments;
  setGuarantorSupportingDocuments: Dispatch<
    SetStateAction<GuarantorSupportingDocuments>
  >;
  guarantorSignature: string;
  setGuarantorSignature: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  isSubmitting?: boolean;
};

export default function GuarantorForm({
  guarantorData,
  setGuarantorData,
  setGuarantorSupportingDocuments,
  guarantorSignature,
  setGuarantorSignature,
  onSubmit,
  onBack,
  isSubmitting = false,
}: GuarantorFormProps) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <SectionCard title="Guarantor Information">
        <Field
          label="Date"
          type="date"
          value={guarantorData.date}
          onChange={(value) => setGuarantorData((prev) => ({ ...prev, date: value }))}
        />
        <Field
          label="Name"
          value={guarantorData.name}
          onChange={(value) => setGuarantorData((prev) => ({ ...prev, name: value }))}
        />
        <Field
          label="Gender"
          value={guarantorData.gender}
          onChange={(value) =>
            setGuarantorData((prev) => ({ ...prev, gender: value }))
          }
        />
        <Field
          label="Type of Identification"
          value={guarantorData.identificationType}
          onChange={(value) =>
            setGuarantorData((prev) => ({ ...prev, identificationType: value }))
          }
        />
        <Field
          label="Identification Number"
          value={guarantorData.identificationNumber}
          onChange={(value) =>
            setGuarantorData((prev) => ({ ...prev, identificationNumber: value }))
          }
        />
        <Field
          label="Nationality"
          value={guarantorData.nationality}
          onChange={(value) =>
            setGuarantorData((prev) => ({ ...prev, nationality: value }))
          }
        />
        <Field
          label="State Origin"
          value={guarantorData.stateOfOrigin}
          onChange={(value) =>
            setGuarantorData((prev) => ({ ...prev, stateOfOrigin: value }))
          }
        />
        <Field
          label="Local Government Area"
          value={guarantorData.localGovernmentArea}
          onChange={(value) =>
            setGuarantorData((prev) => ({ ...prev, localGovernmentArea: value }))
          }
        />
        <Field
          label="Telephone Number"
          type="tel"
          value={guarantorData.telephoneNumber}
          onChange={(value) =>
            setGuarantorData((prev) => ({ ...prev, telephoneNumber: value }))
          }
        />
        <Field
          label="NIN"
          value={guarantorData.nin}
          onChange={(value) => setGuarantorData((prev) => ({ ...prev, nin: value }))}
        />
        <Field
          label="BVN"
          value={guarantorData.bvn}
          onChange={(value) => setGuarantorData((prev) => ({ ...prev, bvn: value }))}
        />
        <Field
          label="Occupation"
          value={guarantorData.occupation}
          onChange={(value) =>
            setGuarantorData((prev) => ({ ...prev, occupation: value }))
          }
        />
        <Field
          label="Years in Business/Profession"
          value={guarantorData.yearsInProfession}
          onChange={(value) =>
            setGuarantorData((prev) => ({ ...prev, yearsInProfession: value }))
          }
        />
        <Field
          label="Guarantor's Net Worth"
          value={guarantorData.netWorth}
          onChange={(value) =>
            setGuarantorData((prev) => ({ ...prev, netWorth: value }))
          }
        />
        <Field
          label="E-mail Address"
          type="email"
          value={guarantorData.emailAddress}
          onChange={(value) =>
            setGuarantorData((prev) => ({ ...prev, emailAddress: value }))
          }
        />
        <Field
          label="Guarantor's Relationship with the Applicant"
          value={guarantorData.relationshipWithApplicant}
          onChange={(value) =>
            setGuarantorData((prev) => ({
              ...prev,
              relationshipWithApplicant: value,
            }))
          }
        />
        <div className="md:col-span-2">
          <TextArea
            label="Address"
            value={guarantorData.address}
            onChange={(value) =>
              setGuarantorData((prev) => ({ ...prev, address: value }))
            }
          />
        </div>
      </SectionCard>

      <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 md:p-5">
        <h3 className="mb-3 text-base font-semibold text-zinc-900">
          Kindly Attach the Following
        </h3>
        <p className="mb-4 text-sm text-zinc-700">
          Upload all guarantor documents below. Every file is required.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <FileField
            label="Passport Photograph"
            onChange={(file) =>
              setGuarantorSupportingDocuments((prev) => ({
                ...prev,
                passportPhotograph: file,
              }))
            }
          />
          <FileField
            label="Guarantor's Means of Identification"
            onChange={(file) =>
              setGuarantorSupportingDocuments((prev) => ({
                ...prev,
                meansOfIdentification: file,
              }))
            }
          />
          <div className="md:col-span-2">
            <FileField
              label="Guarantor's Proof of Present Address (Utility Bills)"
              onChange={(file) =>
                setGuarantorSupportingDocuments((prev) => ({
                  ...prev,
                  proofOfPresentAddress: file,
                }))
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 p-4 md:p-5">
        <h3 className="mb-3 text-base font-semibold text-zinc-900">
          Declaration by Guarantor
        </h3>
        <p className="mb-4 text-sm leading-6 text-zinc-700">
          I, the undersigned hereby personally guarantee the due performance of the
          contract entered by{" "}
          <input
            required
            type="text"
            value={guarantorData.declarationContractReference}
            onChange={(event) =>
              setGuarantorData((prev) => ({
                ...prev,
                declarationContractReference: event.target.value,
              }))
            }
            placeholder="Type contract party name"
            className="my-1 inline-block w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 sm:mx-1 sm:my-0 sm:max-w-xs"
          />{" "}
          with Cardinal Torch Company Limited. In the event that the above party
          fails to perform or discharge his/her obligations according to the said
          contract, I hereby guarantee to make full payment or refund to Cardinal
          Torch Company Limited in the same way as if I was an entity to the
          contract.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Name"
            value={guarantorData.declarationGuarantorName}
            onChange={(value) =>
              setGuarantorData((prev) => ({
                ...prev,
                declarationGuarantorName: value,
              }))
            }
          />
          <Field
            label="Signature Date"
            type="date"
            value={guarantorData.declarationSignatureDate}
            onChange={(value) =>
              setGuarantorData((prev) => ({
                ...prev,
                declarationSignatureDate: value,
              }))
            }
          />
          <SignatureField
            label="Guarantor Signature"
            signatureDataUrl={guarantorSignature}
            onSignatureChange={setGuarantorSignature}
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-zinc-300 px-5 py-2.5 font-medium text-zinc-700 transition hover:bg-zinc-100 sm:w-auto"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-zinc-900 px-5 py-2.5 font-medium text-white transition hover:bg-zinc-700 sm:w-auto"
        >
          {isSubmitting ? "Submitting..." : "Submit Forms"}
        </button>
      </div>
      {isSubmitting ? (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-zinc-600"
        >
          Uploading files and saving your submission. Please do not close this page.
        </p>
      ) : null}
    </form>
  );
}
