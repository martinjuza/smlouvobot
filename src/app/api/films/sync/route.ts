import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchFilmsFromSheet } from "@/lib/google-sheets";

/**
 * POST /api/films/sync
 *
 * Syncs the film catalogue from Google Sheets.
 * Each tab = one film. Variant rows are aggregated into arrays.
 * Upserts films by matching on googleSheetTab or title.
 */
export async function POST() {
  try {
    const sheetFilms = await fetchFilmsFromSheet();

    let created = 0;
    let updated = 0;

    for (const sf of sheetFilms) {
      const existing = await prisma.film.findFirst({
        where: { googleSheetTab: sf.sheetTab },
      });

      const toJson = (arr: string[]) =>
        arr.length > 0 ? JSON.stringify(arr) : null;

      const filmData = {
        title: sf.title,
        titleCz: sf.titleCz,
        directors: sf.directors || null,
        yearOfProduction: sf.yearOfProduction || null,
        resolution: sf.resolution,
        domemasterFormat: sf.domemasterFormat,
        soundmix: sf.soundmix,
        meVersionOfSound: sf.meVersionOfSound,
        runtime: sf.runtime || null,
        originalLanguage: sf.originalLanguage,
        availableLanguages: toJson(sf.availableLanguages),
        availableDubs: toJson(sf.availableDubs),
        availableResolutions: toJson(sf.availableResolutions),
        availableSoundmixes: toJson(sf.availableSoundmixes),
        availableFormats: toJson(sf.availableFormats),
        hasTrailerFlat: sf.hasTrailerFlat,
        hasTrailerDome: sf.hasTrailerDome,
        hasPromoMaterials: sf.hasPromoMaterials,
        pipedriveProductId: sf.pipedriveProductId || null,
        googleSheetTab: sf.sheetTab,
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
          where: { title: sf.title, googleSheetTab: null },
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
