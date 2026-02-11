/**
 * Google Sheets integration for the film catalogue.
 *
 * Reads the sheet DYNAMICALLY based on column headers (row 1).
 * Headers are matched case-insensitively with aliases for CZ/EN.
 * Any column not matching a known field is stored in `raw`.
 *
 * Environment variables:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  – Service account email
 *   GOOGLE_PRIVATE_KEY            – Service account private key (PEM)
 *   GOOGLE_SHEET_ID               – Spreadsheet ID from the URL
 *   GOOGLE_SHEET_NAME             – Sheet/tab name (default: "Films")
 */

import { google } from "googleapis";

export interface SheetFilmRow {
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
  availableResolutions: string[];
  availableSoundmixes: string[];
  hasTrailerFlat: boolean;
  hasTrailerDome: boolean;
  hasPromoMaterials: boolean;
  rowNumber: number;
  /** Full raw row data keyed by original header name */
  raw: Record<string, string>;
}

// Map of normalized header → field key
const HEADER_MAP: Record<string, string> = {
  // Title
  title: "title",
  "film title": "title",
  name: "title",
  "název": "title",
  film: "title",
  // Title CZ
  "title cz": "titleCz",
  "název cz": "titleCz",
  "český název": "titleCz",
  titlecz: "titleCz",
  // Directors
  directors: "directors",
  director: "directors",
  "režisér": "directors",
  "režiséři": "directors",
  "režie": "directors",
  // Year
  year: "yearOfProduction",
  "year of production": "yearOfProduction",
  rok: "yearOfProduction",
  "rok výroby": "yearOfProduction",
  // Resolution (single default value)
  resolution: "resolution",
  "rozlišení": "resolution",
  // Available Resolutions (comma-separated list)
  "available resolutions": "availableResolutions",
  resolutions: "availableResolutions",
  "dostupná rozlišení": "availableResolutions",
  // Domemaster Format
  "domemaster format": "domemasterFormat",
  domemaster: "domemasterFormat",
  format: "domemasterFormat",
  "formát domemaster": "domemasterFormat",
  // Soundmix (single default value)
  soundmix: "soundmix",
  "sound mix": "soundmix",
  zvuk: "soundmix",
  "zvuková stopa": "soundmix",
  // Available Soundmixes (comma-separated list)
  "available soundmixes": "availableSoundmixes",
  soundmixes: "availableSoundmixes",
  // M&E
  "m&e": "meVersionOfSound",
  "m&e version": "meVersionOfSound",
  "m&e version of sound": "meVersionOfSound",
  me: "meVersionOfSound",
  // Runtime
  runtime: "runtime",
  "délka": "runtime",
  "runtime (min)": "runtime",
  "délka (min)": "runtime",
  // Original Language
  "original language": "originalLanguage",
  language: "originalLanguage",
  jazyk: "originalLanguage",
  "původní jazyk": "originalLanguage",
  // Available Languages (comma-separated)
  "available languages": "availableLanguages",
  languages: "availableLanguages",
  "dostupné jazyky": "availableLanguages",
  jazyky: "availableLanguages",
  "subtitle languages": "availableLanguages",
  subtitles: "availableLanguages",
  titulky: "availableLanguages",
  // Available Dubs (comma-separated)
  "available dubs": "availableDubs",
  dubs: "availableDubs",
  dabingy: "availableDubs",
  dabing: "availableDubs",
  "dostupné dabingy": "availableDubs",
  // Trailer flat
  "trailer flat": "hasTrailerFlat",
  "has trailer flat": "hasTrailerFlat",
  // Trailer dome
  "trailer dome": "hasTrailerDome",
  "has trailer dome": "hasTrailerDome",
  // Promo materials
  "promo materials": "hasPromoMaterials",
  "has promo materials": "hasPromoMaterials",
  "propagační materiály": "hasPromoMaterials",
};

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
  return (
    lower === "yes" ||
    lower === "true" ||
    lower === "1" ||
    lower === "ano" ||
    lower === "y" ||
    lower === "a"
  );
}

function parseList(val: string | undefined): string[] {
  if (!val || !val.trim()) return [];
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function fetchFilmsFromSheet(): Promise<SheetFilmRow[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Films";

  if (!sheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID");
  }

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // Read the entire sheet including headers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetName}`,
  });

  const allRows = response.data.values;
  if (!allRows || allRows.length < 2) {
    return [];
  }

  // Row 0 = headers
  const headers = allRows[0].map((h: string) => String(h));
  const dataRows = allRows.slice(1);

  // Build column index → field mapping
  const colMapping: { index: number; field: string | null; header: string }[] =
    headers.map((h: string, i: number) => {
      const normalized = normalizeHeader(h);
      const field = HEADER_MAP[normalized] || null;
      return { index: i, field, header: h };
    });

  // Find the title column (required)
  const titleCol = colMapping.find((c) => c.field === "title");
  if (!titleCol) {
    throw new Error(
      `No "Title" column found in headers: ${headers.join(", ")}`
    );
  }

  return dataRows
    .map((row, rowIdx) => {
      const title = (row[titleCol.index] || "").trim();
      if (!title) return null;

      // Build raw data object (all columns keyed by original header)
      const raw: Record<string, string> = {};
      colMapping.forEach((col) => {
        raw[col.header] = (row[col.index] || "").trim();
      });

      // Extract known fields
      const get = (field: string): string => {
        const col = colMapping.find((c) => c.field === field);
        if (!col) return "";
        return (row[col.index] || "").trim();
      };

      const getList = (field: string): string[] => {
        return parseList(get(field));
      };

      const getBool = (field: string): boolean => {
        return parseBool(get(field));
      };

      return {
        title,
        titleCz: get("titleCz") || null,
        directors: get("directors"),
        yearOfProduction: get("yearOfProduction"),
        resolution: get("resolution") || "2K",
        domemasterFormat: get("domemasterFormat") || "png image sequence domemaster",
        soundmix: get("soundmix") || "5.1",
        meVersionOfSound: getBool("meVersionOfSound"),
        runtime: get("runtime"),
        originalLanguage: get("originalLanguage") || "EN",
        availableLanguages: getList("availableLanguages"),
        availableDubs: getList("availableDubs"),
        availableResolutions: getList("availableResolutions"),
        availableSoundmixes: getList("availableSoundmixes"),
        hasTrailerFlat: getBool("hasTrailerFlat"),
        hasTrailerDome: getBool("hasTrailerDome"),
        hasPromoMaterials: getBool("hasPromoMaterials"),
        rowNumber: rowIdx + 2,
        raw,
      };
    })
    .filter((r): r is SheetFilmRow => r !== null);
}
