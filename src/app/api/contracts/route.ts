import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { formDataToDb } from "@/lib/contract-mapper";
import { ContractFormData } from "@/lib/types";

// GET /api/contracts – list all contracts
export async function GET() {
  const contracts = await prisma.contract.findMany({
    include: { films: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(contracts);
}

// POST /api/contracts – create a new contract
export async function POST(request: NextRequest) {
  const body = (await request.json()) as ContractFormData;
  const dbData = formDataToDb(body);
  const films = body.films || [];

  const contract = await prisma.contract.create({
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

  return NextResponse.json(contract, { status: 201 });
}
