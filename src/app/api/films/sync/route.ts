import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchFilmsFromSheet } from "@/lib/google-sheets";

/**
 * POST /api/films/sync
 *
 * Syncs the film catalogue from Google Sheets.
 * Upserts films by matching on googleSheetRow.
 * Films in DB that no longer exist in the sheet are left untouched
 * (they may have been removed intentionally or the sheet was filtered).
 */
export async function POST() {
  try {
    const sheetFilms = await fetchFilmsFromSheet();

    let created = 0;
    let updated = 0;

    for (const sf of sheetFilms) {
      // Try to find existing film by googleSheetRow
      const existing = await prisma.film.findFirst({
        where: { googleSheetRow: sf.rowNumber },
      });

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
        availableLanguages:
          sf.availableLanguages.length > 0
            ? JSON.stringify(sf.availableLanguages)
            : null,
        availableDubs:
          sf.availableDubs.length > 0
            ? JSON.stringify(sf.availableDubs)
            : null,
        hasTrailerFlat: sf.hasTrailerFlat,
        hasTrailerDome: sf.hasTrailerDome,
        hasPromoMaterials: sf.hasPromoMaterials,
        googleSheetRow: sf.rowNumber,
      };

      if (existing) {
        await prisma.film.update({
          where: { id: existing.id },
          data: filmData,
        });
        updated++;
      } else {
        // Also try to match by exact title (for films added before sync)
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
