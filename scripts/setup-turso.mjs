import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.log("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN not set, skipping Turso setup.");
  process.exit(0);
}

const client = createClient({ url, authToken });

const statements = [
  `CREATE TABLE IF NOT EXISTS "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'EN',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "name" TEXT,
    "pipedriveId" TEXT,
    "clientName" TEXT,
    "clientAddress" TEXT,
    "clientBusinessId" TEXT,
    "clientTaxId" TEXT,
    "clientRegisterCourt" TEXT,
    "clientRegisterSection" TEXT,
    "clientRegisterEntry" TEXT,
    "clientRepresentative" TEXT,
    "clientEmail" TEXT,
    "territory" TEXT,
    "licenseFrom" DATETIME,
    "licenseTo" DATETIME,
    "licenseUnlimited" BOOLEAN NOT NULL DEFAULT false,
    "paymentVariant" TEXT,
    "feeAmount" TEXT,
    "feeCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "installments" TEXT,
    "revenueShareSchool" TEXT,
    "revenueSharePublic" TEXT,
    "promotionalCosts" TEXT,
    "hasMinGuarantee" BOOLEAN NOT NULL DEFAULT false,
    "minGuaranteeAmount" TEXT,
    "minGuaranteeCurrency" TEXT,
    "hasRevenueCap" BOOLEAN NOT NULL DEFAULT false,
    "revenueCapAmount" TEXT,
    "monthlyAmount" TEXT,
    "deliveryMethod" TEXT NOT NULL DEFAULT 'FTP',
    "signingDatePrague" TEXT,
    "signingDateClient" TEXT,
    "signingPlaceClient" TEXT,
    "pdfGenerated" BOOLEAN NOT NULL DEFAULT false,
    "pdfUrl" TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS "ContractFilm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL,
    "filmId" TEXT,
    "title" TEXT NOT NULL,
    "directors" TEXT,
    "yearOfProduction" TEXT,
    "resolution" TEXT NOT NULL DEFAULT '2K',
    "domemasterFormat" TEXT NOT NULL DEFAULT 'png image sequence domemaster',
    "soundmix" TEXT NOT NULL DEFAULT '5.1',
    "meVersionOfSound" BOOLEAN NOT NULL DEFAULT true,
    "runtime" TEXT,
    "language" TEXT NOT NULL DEFAULT 'EN',
    "availableLanguages" TEXT,
    "selectedLanguage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContractFilm_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Film" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleCz" TEXT,
    "directors" TEXT NOT NULL,
    "yearOfProduction" TEXT NOT NULL,
    "resolution" TEXT NOT NULL DEFAULT '2K',
    "domemasterFormat" TEXT NOT NULL DEFAULT 'png image sequence domemaster',
    "soundmix" TEXT NOT NULL DEFAULT '5.1',
    "meVersionOfSound" BOOLEAN NOT NULL DEFAULT true,
    "runtime" TEXT NOT NULL,
    "originalLanguage" TEXT NOT NULL DEFAULT 'EN',
    "availableLanguages" TEXT,
    "availableDubs" TEXT,
    "hasTrailerFlat" BOOLEAN NOT NULL DEFAULT true,
    "hasTrailerDome" BOOLEAN NOT NULL DEFAULT true,
    "hasPromoMaterials" BOOLEAN NOT NULL DEFAULT true,
    "googleSheetRow" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Contract_token_key" ON "Contract"("token")`,
];

console.log("Setting up Turso database...");
for (const sql of statements) {
  await client.execute(sql);
}
console.log("Turso database setup complete.");
