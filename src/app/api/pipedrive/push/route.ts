import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { dbToFormData } from "@/lib/contract-mapper";
import {
  updateDeal,
  mapContractToDealFields,
  getReverseFieldMap,
} from "@/lib/pipedrive";

/**
 * POST /api/pipedrive/push
 *
 * Pushes contract data back to the linked Pipedrive deal.
 * Body: { contractId: string }
 *
 * Maps contract fields back to Pipedrive deal custom fields
 * and updates the deal via Pipedrive API.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const contractId = body.contractId as string;

  if (!contractId) {
    return NextResponse.json(
      { error: "contractId is required" },
      { status: 400 }
    );
  }

  // Load contract
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { films: true },
  });

  if (!contract) {
    return NextResponse.json(
      { error: "Contract not found" },
      { status: 404 }
    );
  }

  if (!contract.pipedriveId) {
    return NextResponse.json(
      { error: "Contract is not linked to a Pipedrive deal" },
      { status: 400 }
    );
  }

  const dealId = Number(contract.pipedriveId);
  if (isNaN(dealId)) {
    return NextResponse.json(
      { error: "Invalid Pipedrive deal ID" },
      { status: 400 }
    );
  }

  // Convert to form data for field mapping
  const formData = dbToFormData(contract);

  // Map contract fields → Pipedrive deal fields using reverse field map
  const dealFields = mapContractToDealFields(
    formData as unknown as Record<string, unknown>
  );

  // Also push standard fields back
  if (formData.feeAmount) {
    dealFields.value = formData.feeAmount;
  }
  if (formData.feeCurrency) {
    dealFields.currency = formData.feeCurrency;
  }

  // Push status info as a deal note or custom field
  const reverseMap = getReverseFieldMap();
  if (reverseMap.status) {
    dealFields[reverseMap.status] = formData.status;
  }

  // Update the deal
  const success = await updateDeal(dealId, dealFields);

  if (!success) {
    return NextResponse.json(
      { error: "Failed to update Pipedrive deal" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    dealId,
    contractId,
    fieldsPushed: Object.keys(dealFields),
  });
}
