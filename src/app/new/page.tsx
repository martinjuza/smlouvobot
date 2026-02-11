"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContractType } from "@/lib/types";

export default function NewContractPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleCreate = async (type: ContractType) => {
    setCreating(true);
    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    });
    const contract = await res.json();
    router.push(`/contract/${contract.id}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">New Contract</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <button
          onClick={() => handleCreate("SINGLE_LICENCE")}
          disabled={creating}
          className="bg-white border-2 border-gray-200 rounded-lg p-8 text-left hover:border-blue-500 hover:shadow-md transition-all disabled:opacity-50"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Single Licence</h2>
          <p className="text-sm text-gray-500">
            One-time licence for specific film(s). Supports flat fee, installments, or revenue share payment.
          </p>
        </button>
        <button
          onClick={() => handleCreate("ONE_PLUS")}
          disabled={creating}
          className="bg-white border-2 border-gray-200 rounded-lg p-8 text-left hover:border-purple-500 hover:shadow-md transition-all disabled:opacity-50"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">One+ Programme</h2>
          <p className="text-sm text-gray-500">
            Subscription-based access to the full film catalogue. Annual or monthly payment options.
          </p>
        </button>
      </div>
    </div>
  );
}
