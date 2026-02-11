import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/films – list all films from catalogue
export async function GET() {
  const films = await prisma.film.findMany({
    orderBy: { title: "asc" },
  });
  return NextResponse.json(films);
}

// POST /api/films – add a film manually
export async function POST(request: NextRequest) {
  const body = await request.json();
  const film = await prisma.film.create({
    data: {
      title: body.title,
      titleCz: body.titleCz || null,
      directors: body.directors,
      yearOfProduction: body.yearOfProduction,
      resolution: body.resolution || "2K",
      domemasterFormat: body.domemasterFormat || "png image sequence domemaster",
      soundmix: body.soundmix || "5.1",
      meVersionOfSound: body.meVersionOfSound ?? true,
      runtime: body.runtime,
      originalLanguage: body.originalLanguage || "EN",
      availableLanguages: body.availableLanguages
        ? JSON.stringify(body.availableLanguages)
        : null,
      availableDubs: body.availableDubs
        ? JSON.stringify(body.availableDubs)
        : null,
      hasTrailerFlat: body.hasTrailerFlat ?? true,
      hasTrailerDome: body.hasTrailerDome ?? true,
      hasPromoMaterials: body.hasPromoMaterials ?? true,
    },
  });
  return NextResponse.json(film, { status: 201 });
}
