import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  PipedriveWebhookPayload,
  validateWebhookToken,
  extractStandardFields,
  mapDealToContractFields,
  getDeal,
} from "@/lib/pipedrive";

/**
 * POST /api/pipedrive/webhook
 *
 * Receives a Pipedrive webhook when a deal is created or updated.
 * Creates or updates a contract with the deal data.
 *
 * Query param ?token=xxx for webhook authentication.
 */
export async function POST(request: NextRequest) {
  // Validate webhook token
  const token = request.nextUrl.searchParams.get("token");
  if (!validateWebhookToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: PipedriveWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only handle deal events
  if (payload.meta?.object !== "deal") {
    return NextResponse.json({ ok: true, skipped: "not a deal event" });
  }

  const action = payload.meta.action; // "added", "updated", "deleted"
  const deal = payload.current;

  if (!deal || !deal.id) {
    return NextResponse.json({ error: "No deal data" }, { status: 400 });
  }

  const dealId = String(deal.id);

  // Handle deletion
  if (action === "deleted") {
    // Don't delete the contract, just log it
    return NextResponse.json({ ok: true, action: "deal_deleted", dealId });
  }

  // Extract fields from the deal
  // 1. Standard fields (org → clientName, person → representative, deal value → fee)
  const standardFields = await extractStandardFields(deal);

  // 2. Custom fields via field map
  const customFields = mapDealToContractFields(deal as Record<string, unknown>);

  // Merge: custom fields override standard fields
  const merged = { ...standardFields, ...customFields };

  // Check if a contract already exists for this deal
  const existing = await prisma.contract.findFirst({
    where: { pipedriveId: dealId },
  });

  if (existing) {
    // Update existing contract with new data from Pipedrive
    const updateData: Record<string, unknown> = {};

    // Map merged fields to DB columns
    const fieldToColumn: Record<string, string> = {
      clientName: "clientName",
      clientAddress: "clientAddress",
      clientBusinessId: "clientBusinessId",
      clientTaxId: "clientTaxId",
      clientRepresentative: "clientRepresentative",
      clientEmail: "clientEmail",
      territory: "territory",
      feeAmount: "feeAmount",
      feeCurrency: "feeCurrency",
      type: "type",
      language: "language",
      paymentVariant: "paymentVariant",
      deliveryMethod: "deliveryMethod",
      monthlyAmount: "monthlyAmount",
      revenueShareSchool: "revenueShareSchool",
      revenueSharePublic: "revenueSharePublic",
      promotionalCosts: "promotionalCosts",
      minGuaranteeAmount: "minGuaranteeAmount",
      minGuaranteeCurrency: "minGuaranteeCurrency",
      revenueCapAmount: "revenueCapAmount",
      signingPlaceClient: "signingPlaceClient",
    };

    for (const [formKey, dbCol] of Object.entries(fieldToColumn)) {
      if (merged[formKey] !== undefined) {
        updateData[dbCol] = merged[formKey];
      }
    }

    // Handle booleans separately
    if (merged.licenseUnlimited !== undefined) {
      updateData.licenseUnlimited = merged.licenseUnlimited === "true";
    }
    if (merged.hasMinGuarantee !== undefined) {
      updateData.hasMinGuarantee = merged.hasMinGuarantee === "true";
    }
    if (merged.hasRevenueCap !== undefined) {
      updateData.hasRevenueCap = merged.hasRevenueCap === "true";
    }

    await prisma.contract.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      action: "updated",
      contractId: existing.id,
      dealId,
    });
  } else {
    // Create a new contract from the deal
    const contractData: Record<string, unknown> = {
      type: merged.type || "SINGLE_LICENCE",
      language: merged.language || "EN",
      status: "DRAFT",
      pipedriveId: dealId,
      clientName: merged.clientName || null,
      clientAddress: merged.clientAddress || null,
      clientBusinessId: merged.clientBusinessId || null,
      clientTaxId: merged.clientTaxId || null,
      clientRepresentative: merged.clientRepresentative || null,
      clientEmail: merged.clientEmail || null,
      territory: merged.territory || null,
      feeAmount: merged.feeAmount || null,
      feeCurrency: merged.feeCurrency || "EUR",
      paymentVariant: merged.paymentVariant || "FLAT_FEE",
      deliveryMethod: merged.deliveryMethod || "FTP",
      monthlyAmount: merged.monthlyAmount || null,
      revenueShareSchool: merged.revenueShareSchool || null,
      revenueSharePublic: merged.revenueSharePublic || null,
      promotionalCosts: merged.promotionalCosts || null,
      minGuaranteeAmount: merged.minGuaranteeAmount || null,
      minGuaranteeCurrency: merged.minGuaranteeCurrency || null,
      revenueCapAmount: merged.revenueCapAmount || null,
      signingPlaceClient: merged.signingPlaceClient || null,
      licenseUnlimited: merged.licenseUnlimited === "true",
      hasMinGuarantee: merged.hasMinGuarantee === "true",
      hasRevenueCap: merged.hasRevenueCap === "true",
    };

    // Auto-generate name from deal title
    if (deal.title) {
      contractData.name = deal.title;
    }

    const contract = await prisma.contract.create({
      data: contractData as Parameters<typeof prisma.contract.create>[0]["data"],
    });

    return NextResponse.json(
      {
        ok: true,
        action: "created",
        contractId: contract.id,
        dealId,
      },
      { status: 201 }
    );
  }
}
