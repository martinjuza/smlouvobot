import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { dbToFormData } from "@/lib/contract-mapper";
import { generateContractText } from "@/lib/templates";

// GET /api/contracts/:id/preview – returns contract text preview
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { films: true },
  });
  if (!contract) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = dbToFormData(contract);
  const text = generateContractText(formData);

  return new NextResponse(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
