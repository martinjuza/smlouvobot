import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { formDataToDb } from "@/lib/contract-mapper";
import { ContractFormData } from "@/lib/types";

// GET /api/contracts/:id
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
  return NextResponse.json(contract);
}

// PUT /api/contracts/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as ContractFormData;
  const dbData = formDataToDb(body);
  const films = body.films || [];

  // Delete existing films and recreate
  await prisma.contractFilm.deleteMany({ where: { contractId: id } });

  const contract = await prisma.contract.update({
    where: { id },
    data: {
      ...dbData,
      films: {
        create: films.map((f) => ({
          filmId: f.filmId || null,
          title: f.title,
          directors: f.directors || null,
          yearOfProduction: f.yearOfProduction || null,
          resolution: f.resolution,
          domemasterFormat: f.domemasterFormat,
          soundmix: f.soundmix,
          meVersionOfSound: f.meVersionOfSound,
          runtime: f.runtime || null,
          language: f.language,
          availableLanguages: f.availableLanguages || null,
          selectedLanguage: f.selectedLanguage || null,
        })),
      },
    },
    include: { films: true },
  });

  return NextResponse.json(contract);
}

// DELETE /api/contracts/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.contract.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
