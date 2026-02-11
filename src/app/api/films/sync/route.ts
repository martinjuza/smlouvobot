import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchFilmsFromSheet } from "@/lib/google-sheets";

/**
 * POST /api/films/sync
 *
 * Syncs the film catalogue from Google Sheets.
 * Reads headers dynamically, maps to Film fields.
 * Upserts films by matching on googleSheetRow or title.
 */
export async function POST() {
  try {
    const sheetFilms = await fetchFilmsFromSheet();

    let created = 0;
    let updated = 0;

    for (const sf of sheetFilms) {
      const existing = await prisma.film.findFirst({
        where: { googleSheetRow: sf.rowNumber },
      });

      const toJson = (arr: string[]) =>
        arr.length > 0 ? JSON.stringify(arr) : null;

      const filmData = {
        title: sf.title,
        titleCz: sf.titleCz,
        directors: sf.directors,
        yearOfProduction: sf.yearOfProduction,
        resolution: sf.resolution,
        domemasterFormat: sf.domemasterFormat,
        soundmix: sf.soundmix,
        meVersionOfSound: sf.meVersionOfSound,
        runtime: sf.runtime,
        originalLanguage: sf.originalLanguage,
        availableLanguages: toJson(sf.availableLanguages),
        availableDubs: toJson(sf.availableDubs),
        availableResolutions: toJson(sf.availableResolutions),
        availableSoundmixes: toJson(sf.availableSoundmixes),
        hasTrailerFlat: sf.hasTrailerFlat,
        hasTrailerDome: sf.hasTrailerDome,
        hasPromoMaterials: sf.hasPromoMaterials,
        googleSheetRow: sf.rowNumber,
        sheetData: JSON.stringify(sf.raw),
      };

      if (existing) {
        await prisma.film.update({
          where: { id: existing.id },
          data: filmData,
        });
        updated++;
      } else {
        const byTitle = await prisma.film.findFirst({
          where: { title: sf.title, googleSheetRow: null },
        });

        if (byTitle) {
          await prisma.film.update({
            where: { id: byTitle.id },
            data: filmData,
          });
          updated++;
        } else {
          await prisma.film.create({ data: filmData });
          created++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      total: sheetFilms.length,
      created,
      updated,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
