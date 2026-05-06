export type SupplierFormData = {
  date: string;
  typeOfBusiness: string;
  registeredCompanyName: string;
  businessTradingName: string;
  companyRegistrationNumber: string;
  cocoaAssociationMember: string;
  natureOfBusiness: string;
  address: string;
  email: string;
  telephoneNumber: string;
  vatNumber: string;
  tinNumber: string;
  yearsInBusiness: string;
  director1Name: string;
  director1Nin: string;
  director1Bvn: string;
  director1Telephone: string;
  director1Address: string;
  director1Email: string;
  director2Name: string;
  director2Nin: string;
  director2Bvn: string;
  director2Telephone: string;
  director2Address: string;
  director2Email: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  paymentMethod: string;
  declarationName: string;
  declarationTitle: string;
  declarationSignatureDate: string;
};

export type GuarantorFormData = {
  date: string;
  name: string;
  gender: string;
  identificationType: string;
  identificationNumber: string;
  address: string;
  nationality: string;
  stateOfOrigin: string;
  localGovernmentArea: string;
  telephoneNumber: string;
  nin: string;
  bvn: string;
  occupation: string;
  yearsInProfession: string;
  netWorth: string;
  emailAddress: string;
  relationshipWithApplicant: string;
  declarationContractReference: string;
  declarationGuarantorName: string;
  declarationSignatureDate: string;
};

export type SupportingDocuments = {
  supplierPassport: File | null;
  certificateOfIncorporation: File | null;
  statusReport: File | null;
  annualReturnsLetter: File | null;
  currentBusinessAddressProof: File | null;
  firsRegistrationProof: File | null;
  auditedFinancialStatements: File | null;
  validMeansOfIdentification: File | null;
  executedGuarantorForm: File | null;
};

export type GuarantorSupportingDocuments = {
  passportPhotograph: File | null;
  meansOfIdentification: File | null;
  proofOfPresentAddress: File | null;
};

export type ReviewStatus = "pending" | "accepted" | "rejected";

export type ApplicationSubmission = {
  id: string;
  submittedAt: string;
  status: ReviewStatus;
  supplierData: SupplierFormData;
  guarantorData: GuarantorFormData;
  supplierSignatureProvided: boolean;
  guarantorSignatureProvided: boolean;
  supplierDocumentNames: Record<string, string>;
  guarantorDocumentNames: Record<string, string>;
};

export const defaultSupplierData: SupplierFormData = {
  date: "",
  typeOfBusiness: "",
  registeredCompanyName: "",
  businessTradingName: "",
  companyRegistrationNumber: "",
  cocoaAssociationMember: "",
  natureOfBusiness: "",
  address: "",
  email: "",
  telephoneNumber: "",
  vatNumber: "",
  tinNumber: "",
  yearsInBusiness: "",
  director1Name: "",
  director1Nin: "",
  director1Bvn: "",
  director1Telephone: "",
  director1Address: "",
  director1Email: "",
  director2Name: "",
  director2Nin: "",
  director2Bvn: "",
  director2Telephone: "",
  director2Address: "",
  director2Email: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
  paymentMethod: "",
  declarationName: "",
  declarationTitle: "",
  declarationSignatureDate: "",
};

export const defaultGuarantorData: GuarantorFormData = {
  date: "",
  name: "",
  gender: "",
  identificationType: "",
  identificationNumber: "",
  address: "",
  nationality: "",
  stateOfOrigin: "",
  localGovernmentArea: "",
  telephoneNumber: "",
  nin: "",
  bvn: "",
  occupation: "",
  yearsInProfession: "",
  netWorth: "",
  emailAddress: "",
  relationshipWithApplicant: "",
  declarationContractReference: "",
  declarationGuarantorName: "",
  declarationSignatureDate: "",
};

export const defaultSupportingDocuments: SupportingDocuments = {
  supplierPassport: null,
  certificateOfIncorporation: null,
  statusReport: null,
  annualReturnsLetter: null,
  currentBusinessAddressProof: null,
  firsRegistrationProof: null,
  auditedFinancialStatements: null,
  validMeansOfIdentification: null,
  executedGuarantorForm: null,
};

export const defaultGuarantorSupportingDocuments: GuarantorSupportingDocuments = {
  passportPhotograph: null,
  meansOfIdentification: null,
  proofOfPresentAddress: null,
};
