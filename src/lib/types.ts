export type ContractType = "SINGLE_LICENCE" | "ONE_PLUS";
export type ContractLanguage = "EN" | "CZ";
export type ContractStatus = "DRAFT" | "COMPLETED" | "PDF_GENERATED";

export type PaymentVariantSingle =
  | "FLAT_FEE"
  | "INSTALLMENTS"
  | "REVENUE_SHARE";

export type PaymentVariantOnePlus =
  | "ANNUAL_ONETIME"
  | "MONTHLY_INSTALLMENTS";

export type PaymentVariant = PaymentVariantSingle | PaymentVariantOnePlus;

export type DeliveryMethod = "FTP" | "HDD";

export interface Installment {
  amount: string;
  currency: string;
  dueDate: string;
}

export interface FilmData {
  id: string;
  title: string;
  titleCz?: string;
  directors: string;
  yearOfProduction: string;
  resolution: string;
  domemasterFormat: string;
  soundmix: string;
  meVersionOfSound: boolean;
  runtime: string;
  originalLanguage: string;
  availableLanguages: string[];
  availableDubs: string[];
  hasTrailerFlat: boolean;
  hasTrailerDome: boolean;
  hasPromoMaterials: boolean;
}

export interface ContractFilmData {
  id?: string;
  filmId?: string;
  title: string;
  directors?: string;
  yearOfProduction?: string;
  resolution: string;
  domemasterFormat: string;
  soundmix: string;
  meVersionOfSound: boolean;
  runtime?: string;
  language: string;
  availableLanguages?: string;
  selectedLanguage?: string;
  // Available options from catalogue (JSON arrays) for dynamic dropdowns
  availableResolutions?: string;
  availableSoundmixes?: string;
  availableDubs?: string;
}

export interface ContractFormData {
  id?: string;
  type: ContractType;
  language: ContractLanguage;
  status: ContractStatus;
  name?: string;

  // Client
  clientName: string;
  clientAddress: string;
  clientBusinessId: string;
  clientTaxId: string;
  clientRegisterCourt: string;
  clientRegisterSection: string;
  clientRegisterEntry: string;
  clientRepresentative: string;
  clientEmail: string;

  // License
  territory: string;
  licenseFrom: string;
  licenseTo: string;
  licenseUnlimited: boolean;

  // Payment
  paymentVariant: PaymentVariant;
  feeAmount: string;
  feeCurrency: string;
  installments: Installment[];

  // Revenue share (Single Licence only)
  revenueShareSchool: string;
  revenueSharePublic: string;
  promotionalCosts: string;
  hasMinGuarantee: boolean;
  minGuaranteeAmount: string;
  minGuaranteeCurrency: string;
  hasRevenueCap: boolean;
  revenueCapAmount: string;

  // One+ monthly
  monthlyAmount: string;

  // Delivery
  deliveryMethod: DeliveryMethod;

  // Signing
  signingDatePrague: string;
  signingDateClient: string;
  signingPlaceClient: string;

  // Films
  films: ContractFilmData[];

  // PDF
  pdfGenerated: boolean;

  // Pipedrive
  pipedriveId?: string;
}

export function getDefaultFormData(type: ContractType = "SINGLE_LICENCE"): ContractFormData {
  return {
    type,
    language: "EN",
    status: "DRAFT",
    clientName: "",
    clientAddress: "",
    clientBusinessId: "",
    clientTaxId: "",
    clientRegisterCourt: "",
    clientRegisterSection: "",
    clientRegisterEntry: "",
    clientRepresentative: "",
    clientEmail: "",
    territory: "",
    licenseFrom: "",
    licenseTo: "",
    licenseUnlimited: false,
    paymentVariant: type === "SINGLE_LICENCE" ? "FLAT_FEE" : "ANNUAL_ONETIME",
    feeAmount: "",
    feeCurrency: "EUR",
    installments: [],
    revenueShareSchool: "",
    revenueSharePublic: "",
    promotionalCosts: "",
    hasMinGuarantee: false,
    minGuaranteeAmount: "",
    minGuaranteeCurrency: "EUR",
    hasRevenueCap: false,
    revenueCapAmount: "",
    monthlyAmount: "",
    deliveryMethod: "FTP",
    signingDatePrague: "",
    signingDateClient: "",
    signingPlaceClient: "",
    films: [],
    pdfGenerated: false,
  };
}

export function generateContractName(
  date: string,
  clientName: string,
  films: { title: string }[]
): string {
  const filmTitles = films.map((f) => f.title).join("/ ");
  return `${date} - ${clientName} - ${filmTitles}`;
}
