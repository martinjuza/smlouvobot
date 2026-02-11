/**
 * Google Sheets integration for the film catalogue.
 *
 * Environment variables:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  – Service account email
 *   GOOGLE_PRIVATE_KEY            – Service account private key (PEM)
 *   GOOGLE_SHEET_ID               – Spreadsheet ID from the URL
 *   GOOGLE_SHEET_NAME             – Sheet/tab name (default: "Films")
 *
 * Expected columns (row 1 = header):
 *   A: Title
 *   B: Title CZ
 *   C: Directors
 *   D: Year of Production
 *   E: Resolution (2K, 4K, 8K)
 *   F: Domemaster Format
 *   G: Soundmix (5.1, 7.1, Stereo, Mono)
 *   H: M&E Version of Sound (Yes/No)
 *   I: Runtime (min)
 *   J: Original Language
 *   K: Available Languages (comma-separated)
 *   L: Available Dubs (comma-separated)
 *   M: Has Trailer Flat (Yes/No)
 *   N: Has Trailer Dome (Yes/No)
 *   O: Has Promo Materials (Yes/No)
 */

import { google } from "googleapis";

interface SheetFilmRow {
  title: string;
  titleCz: string | null;
  directors: string;
  yearOfProduction: string;
  resolution: string;
  domemasterFormat: string;
  soundmix: string;
  meVersionOfSound: boolean;
  runtime: string;
  originalLanguage: string;
  availableLanguages: string[];
  availableDubs: string[];
  hasTrailerFlat: boolean;
  hasTrailerDome: boolean;
  hasPromoMaterials: boolean;
  rowNumber: number;
}

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY"
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

function parseBool(val: string | undefined): boolean {
  if (!val) return false;
  const lower = val.trim().toLowerCase();
  return lower === "yes" || lower === "true" || lower === "1" || lower === "ano";
}

function parseList(val: string | undefined): string[] {
  if (!val || !val.trim()) return [];
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function fetchFilmsFromSheet(): Promise<SheetFilmRow[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Films";

  if (!sheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID");
  }

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetName}!A2:O`,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    return [];
  }

  return rows
    .map((row, index) => {
      const title = (row[0] || "").trim();
      if (!title) return null;

      return {
        title,
        titleCz: (row[1] || "").trim() || null,
        directors: (row[2] || "").trim(),
        yearOfProduction: (row[3] || "").trim(),
        resolution: (row[4] || "2K").trim(),
        domemasterFormat:
          (row[5] || "png image sequence domemaster").trim(),
        soundmix: (row[6] || "5.1").trim(),
        meVersionOfSound: parseBool(row[7]),
        runtime: (row[8] || "").trim(),
        originalLanguage: (row[9] || "EN").trim(),
        availableLanguages: parseList(row[10]),
        availableDubs: parseList(row[11]),
        hasTrailerFlat: parseBool(row[12]),
        hasTrailerDome: parseBool(row[13]),
        hasPromoMaterials: parseBool(row[14]),
        rowNumber: index + 2, // +2 because row 1 is header, index is 0-based
      };
    })
    .filter((r): r is SheetFilmRow => r !== null);
}
