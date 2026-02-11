import { ContractFormData, ContractFilmData, Installment } from "@/lib/types";
import type { Contract, ContractFilm } from "@/generated/prisma/client";

type ContractWithFilms = Contract & { films: ContractFilm[] };

export function dbToFormData(contract: ContractWithFilms): ContractFormData {
  let installments: Installment[] = [];
  try {
    if (contract.installments) {
      installments = JSON.parse(contract.installments);
    }
  } catch {
    installments = [];
  }

  const films: ContractFilmData[] = contract.films.map((f) => ({
    id: f.id,
    filmId: f.filmId ?? undefined,
    title: f.title,
    directors: f.directors ?? undefined,
    yearOfProduction: f.yearOfProduction ?? undefined,
    resolution: f.resolution,
    domemasterFormat: f.domemasterFormat,
    soundmix: f.soundmix,
    meVersionOfSound: f.meVersionOfSound,
    runtime: f.runtime ?? undefined,
    language: f.language,
    availableLanguages: f.availableLanguages ?? undefined,
    selectedLanguage: f.selectedLanguage ?? undefined,
  }));

  return {
    id: contract.id,
    type: contract.type as ContractFormData["type"],
    language: contract.language as ContractFormData["language"],
    status: contract.status as ContractFormData["status"],
    name: contract.name ?? undefined,
    clientName: contract.clientName ?? "",
    clientAddress: contract.clientAddress ?? "",
    clientBusinessId: contract.clientBusinessId ?? "",
    clientTaxId: contract.clientTaxId ?? "",
    clientRegisterCourt: contract.clientRegisterCourt ?? "",
    clientRegisterSection: contract.clientRegisterSection ?? "",
    clientRegisterEntry: contract.clientRegisterEntry ?? "",
    clientRepresentative: contract.clientRepresentative ?? "",
    clientEmail: contract.clientEmail ?? "",
    territory: contract.territory ?? "",
    licenseFrom: contract.licenseFrom?.toISOString().split("T")[0] ?? "",
    licenseTo: contract.licenseTo?.toISOString().split("T")[0] ?? "",
    licenseUnlimited: contract.licenseUnlimited,
    paymentVariant: (contract.paymentVariant ?? "FLAT_FEE") as ContractFormData["paymentVariant"],
    feeAmount: contract.feeAmount ?? "",
    feeCurrency: contract.feeCurrency,
    installments,
    revenueShareSchool: contract.revenueShareSchool ?? "",
    revenueSharePublic: contract.revenueSharePublic ?? "",
    promotionalCosts: contract.promotionalCosts ?? "",
    hasMinGuarantee: contract.hasMinGuarantee,
    minGuaranteeAmount: contract.minGuaranteeAmount ?? "",
    minGuaranteeCurrency: contract.minGuaranteeCurrency ?? "EUR",
    hasRevenueCap: contract.hasRevenueCap,
    revenueCapAmount: contract.revenueCapAmount ?? "",
    monthlyAmount: contract.monthlyAmount ?? "",
    deliveryMethod: contract.deliveryMethod as ContractFormData["deliveryMethod"],
    signingDatePrague: contract.signingDatePrague ?? "",
    signingDateClient: contract.signingDateClient ?? "",
    signingPlaceClient: contract.signingPlaceClient ?? "",
    films,
    pdfGenerated: contract.pdfGenerated,
    pipedriveId: contract.pipedriveId ?? undefined,
  };
}

export function formDataToDb(data: ContractFormData) {
  return {
    type: data.type,
    language: data.language,
    status: data.status,
    name: data.name || null,
    clientName: data.clientName || null,
    clientAddress: data.clientAddress || null,
    clientBusinessId: data.clientBusinessId || null,
    clientTaxId: data.clientTaxId || null,
    clientRegisterCourt: data.clientRegisterCourt || null,
    clientRegisterSection: data.clientRegisterSection || null,
    clientRegisterEntry: data.clientRegisterEntry || null,
    clientRepresentative: data.clientRepresentative || null,
    clientEmail: data.clientEmail || null,
    territory: data.territory || null,
    licenseFrom: data.licenseFrom ? new Date(data.licenseFrom) : null,
    licenseTo: data.licenseTo ? new Date(data.licenseTo) : null,
    licenseUnlimited: data.licenseUnlimited,
    paymentVariant: data.paymentVariant,
    feeAmount: data.feeAmount || null,
    feeCurrency: data.feeCurrency,
    installments: data.installments.length > 0 ? JSON.stringify(data.installments) : null,
    revenueShareSchool: data.revenueShareSchool || null,
    revenueSharePublic: data.revenueSharePublic || null,
    promotionalCosts: data.promotionalCosts || null,
    hasMinGuarantee: data.hasMinGuarantee,
    minGuaranteeAmount: data.minGuaranteeAmount || null,
    minGuaranteeCurrency: data.minGuaranteeCurrency || null,
    hasRevenueCap: data.hasRevenueCap,
    revenueCapAmount: data.revenueCapAmount || null,
    monthlyAmount: data.monthlyAmount || null,
    deliveryMethod: data.deliveryMethod,
    signingDatePrague: data.signingDatePrague || null,
    signingDateClient: data.signingDateClient || null,
    signingPlaceClient: data.signingPlaceClient || null,
    pdfGenerated: data.pdfGenerated,
  };
}
