/**
 * Google Sheets integration for the film catalogue.
 *
 * Sheet structure: each tab = one film.
 * Row 1 = headers, rows 2+ = variant combinations (language × resolution × format × soundmix).
 * We aggregate unique values from all rows into arrays.
 *
 * Expected columns (case-insensitive):
 *   PD product ID, EN, CZ, Languages, Version, Resolution, Format, Soundmix, Year, Directors
 *
 * Authentication (choose one):
 *   Option A – API Key (simple, sheet must be shared "Anyone with the link"):
 *     GOOGLE_API_KEY  – Google API key from Cloud Console
 *   Option B – Service Account (sheet shared with the service account email):
 *     GOOGLE_SERVICE_ACCOUNT_EMAIL  – Service account email
 *     GOOGLE_PRIVATE_KEY            – Service account private key (PEM)
 *
 * Always required:
 *   GOOGLE_SHEET_ID  – Spreadsheet ID from the URL
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
  availableFormats: string[];
  hasTrailerFlat: boolean;
  hasTrailerDome: boolean;
  hasPromoMaterials: boolean;
  pipedriveProductId: string;
  sheetTab: string;
  /** Full raw data from all rows as JSON */
  raw: Record<string, string>;
}

// Map of normalized header → field key
const HEADER_MAP: Record<string, string> = {
  // PD product ID
  "pd product id": "pipedriveProductId",
  "product id": "pipedriveProductId",
  productid: "pipedriveProductId",
  // English title
  en: "title",
  "en title": "title",
  "english title": "title",
  title: "title",
  "film title": "title",
  name: "title",
  "název": "title",
  film: "title",
  // Czech title
  cz: "titleCz",
  "cz title": "titleCz",
  "czech title": "titleCz",
  "title cz": "titleCz",
  "název cz": "titleCz",
  "český název": "titleCz",
  titlecz: "titleCz",
  // Languages (per-row value, aggregated)
  languages: "language",
  language: "language",
  jazyk: "language",
  jazyky: "language",
  // Version / Runtime
  version: "runtime",
  runtime: "runtime",
  "runtime (min)": "runtime",
  "délka": "runtime",
  "délka (min)": "runtime",
  // Resolution (per-row value, aggregated)
  resolution: "resolution",
  "rozlišení": "resolution",
  // Format (per-row value, aggregated)
  format: "format",
  "formát": "format",
  "domemaster format": "format",
  domemaster: "format",
  "formát domemaster": "format",
  // Soundmix (per-row value, aggregated)
  soundmix: "soundmix",
  "sound mix": "soundmix",
  zvuk: "soundmix",
  "zvuková stopa": "soundmix",
  // Year
  year: "yearOfProduction",
  "year of production": "yearOfProduction",
  rok: "yearOfProduction",
  "rok výroby": "yearOfProduction",
  // Directors
  directors: "directors",
  director: "directors",
  "režisér": "directors",
  "režiséři": "directors",
  "režie": "directors",
  // M&E
  "m&e": "meVersionOfSound",
  "m&e version": "meVersionOfSound",
  "m&e version of sound": "meVersionOfSound",
  me: "meVersionOfSound",
  // Available Dubs (comma-separated)
  "available dubs": "availableDubs",
  dubs: "availableDubs",
  dabingy: "availableDubs",
  dabing: "availableDubs",
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

/**
 * Returns { auth, key } for the Google Sheets API.
 * - If GOOGLE_API_KEY is set → use API key (sheet must be public)
 * - If service account credentials are set → use JWT
 * - Otherwise → error
 */
function getSheetsClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (apiKey) {
    return { sheets: google.sheets({ version: "v4" }), key: apiKey };
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const pk = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (email && pk) {
    const auth = new google.auth.JWT({
      email,
      key: pk,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    return { sheets: google.sheets({ version: "v4", auth }), key: undefined };
  }

  throw new Error(
    "Missing Google Sheets credentials. Set GOOGLE_API_KEY (for public sheets) or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY."
  );
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

/** Collect unique non-empty values from an array */
function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((v) => {
    const trimmed = v.trim();
    if (!trimmed || seen.has(trimmed)) return false;
    seen.add(trimmed);
    return true;
  });
}

/** Resolution sort order for consistent display */
const RESOLUTION_ORDER: Record<string, number> = {
  "1k": 1,
  "2k": 2,
  "3k": 3,
  "4k": 4,
  "5k": 5,
  "6k": 6,
  "8k": 7,
};

function sortResolutions(resolutions: string[]): string[] {
  return [...resolutions].sort((a, b) => {
    const orderA = RESOLUTION_ORDER[a.toLowerCase()] ?? 99;
    const orderB = RESOLUTION_ORDER[b.toLowerCase()] ?? 99;
    return orderA - orderB;
  });
}

export async function fetchFilmsFromSheet(): Promise<SheetFilmRow[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID");
  }

  const { sheets, key } = getSheetsClient();

  // 1. Get all sheet/tab names
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
    key,
    fields: "sheets.properties.title",
  });

  const tabNames =
    spreadsheet.data.sheets
      ?.map((s) => s.properties?.title)
      .filter((t): t is string => !!t) ?? [];

  if (tabNames.length === 0) {
    return [];
  }

  // 2. Batch-read all tabs at once
  const ranges = tabNames.map((name) => `'${name}'`);
  const batchResponse = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: sheetId,
    key,
    ranges,
  });

  const valueRanges = batchResponse.data.valueRanges ?? [];

  // 3. Parse each tab into a SheetFilmRow
  const films: SheetFilmRow[] = [];

  for (let i = 0; i < tabNames.length; i++) {
    const tabName = tabNames[i];
    const allRows = valueRanges[i]?.values;

    if (!allRows || allRows.length < 2) {
      continue; // Skip empty tabs or tabs with only headers
    }

    // Row 0 = headers
    const headers = allRows[0].map((h: string) => String(h));
    const dataRows = allRows.slice(1);

    // Build column index → field mapping
    const colMapping: { index: number; field: string | null; header: string }[] =
      headers.map((h: string, idx: number) => {
        const normalized = normalizeHeader(h);
        const field = HEADER_MAP[normalized] || null;
        return { index: idx, field, header: h };
      });

    // Helper: get cell value for a field from a given row
    const getCell = (row: string[], field: string): string => {
      const col = colMapping.find((c) => c.field === field);
      if (!col) return "";
      return (row[col.index] || "").trim();
    };

    // Collect values from all rows for aggregated fields
    const allLanguages: string[] = [];
    const allResolutions: string[] = [];
    const allFormats: string[] = [];
    const allSoundmixes: string[] = [];

    for (const row of dataRows) {
      const lang = getCell(row, "language");
      if (lang) allLanguages.push(lang);

      const res = getCell(row, "resolution");
      if (res) allResolutions.push(res);

      const fmt = getCell(row, "format");
      if (fmt) allFormats.push(fmt);

      const sm = getCell(row, "soundmix");
      if (sm) allSoundmixes.push(sm);
    }

    // Take scalar values from the first data row
    const firstRow = dataRows[0];
    const title = getCell(firstRow, "title") || tabName;
    const titleCz = getCell(firstRow, "titleCz") || null;
    const directors = getCell(firstRow, "directors");
    const yearOfProduction = getCell(firstRow, "yearOfProduction");
    const runtime = getCell(firstRow, "runtime");
    const pipedriveProductId = getCell(firstRow, "pipedriveProductId");

    // Unique aggregated values
    const availableLanguages = uniqueNonEmpty(allLanguages);
    const availableResolutions = sortResolutions(uniqueNonEmpty(allResolutions));
    const availableFormats = uniqueNonEmpty(allFormats);
    const availableSoundmixes = uniqueNonEmpty(allSoundmixes);

    // Pick defaults from available options
    const resolution =
      availableResolutions.find((r) => r.toUpperCase() === "4K") ||
      availableResolutions[0] ||
      "2K";
    const soundmix =
      availableSoundmixes.find((s) => s === "5.1") ||
      availableSoundmixes[0] ||
      "5.1";
    const domemasterFormat = availableFormats[0] || "png image sequence domemaster";
    const originalLanguage = availableLanguages[0] || "EN";

    // Build raw data for reference
    const raw: Record<string, string> = {
      tabName,
      pipedriveProductId,
      title,
      titleCz: titleCz || "",
      directors,
      yearOfProduction,
      runtime,
      languages: availableLanguages.join(", "),
      resolutions: availableResolutions.join(", "),
      formats: availableFormats.join(", "),
      soundmixes: availableSoundmixes.join(", "),
      totalVariants: String(dataRows.length),
    };

    // Check for boolean fields (from any row)
    let meVersionOfSound = false;
    let hasTrailerFlat = false;
    let hasTrailerDome = false;
    let hasPromoMaterials = false;
    const availableDubs: string[] = [];

    for (const row of dataRows) {
      if (parseBool(getCell(row, "meVersionOfSound"))) meVersionOfSound = true;
      if (parseBool(getCell(row, "hasTrailerFlat"))) hasTrailerFlat = true;
      if (parseBool(getCell(row, "hasTrailerDome"))) hasTrailerDome = true;
      if (parseBool(getCell(row, "hasPromoMaterials"))) hasPromoMaterials = true;
      const dubs = parseList(getCell(row, "availableDubs"));
      availableDubs.push(...dubs);
    }

    films.push({
      title,
      titleCz,
      directors,
      yearOfProduction,
      resolution,
      domemasterFormat,
      soundmix,
      meVersionOfSound,
      runtime,
      originalLanguage,
      availableLanguages,
      availableDubs: uniqueNonEmpty(availableDubs),
      availableResolutions,
      availableSoundmixes,
      availableFormats,
      hasTrailerFlat,
      hasTrailerDome,
      hasPromoMaterials,
      pipedriveProductId,
      sheetTab: tabName,
      raw,
    });
  }

  return films;
}
