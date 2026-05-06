export const SUPPLIER_FILE_FIELDS = [
  "supplierPassport",
  "certificateOfIncorporation",
  "statusReport",
  "annualReturnsLetter",
  "currentBusinessAddressProof",
  "firsRegistrationProof",
  "auditedFinancialStatements",
  "validMeansOfIdentification",
] as const;

export const GUARANTOR_FILE_FIELDS = [
  "passportPhotograph",
  "meansOfIdentification",
  "proofOfPresentAddress",
] as const;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
