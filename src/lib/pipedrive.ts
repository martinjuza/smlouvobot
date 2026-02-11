/**
 * Pipedrive API client and field mapping utilities.
 *
 * Environment variables:
 *   PIPEDRIVE_API_TOKEN  – Pipedrive personal API token
 *   PIPEDRIVE_DOMAIN     – Company domain (e.g. "krutart" for krutart.pipedrive.com)
 *   PIPEDRIVE_WEBHOOK_TOKEN – Secret token to validate incoming webhooks
 *   PIPEDRIVE_FIELD_MAP  – JSON mapping of Pipedrive deal field keys → ContractFormData keys
 *
 * Example PIPEDRIVE_FIELD_MAP:
 * {
 *   "abc123_territory": "territory",
 *   "def456_fee": "feeAmount",
 *   "ghi789_currency": "feeCurrency",
 *   "jkl012_type": "type",
 *   "mno345_payment": "paymentVariant"
 * }
 */

const PIPEDRIVE_API_TOKEN = () => process.env.PIPEDRIVE_API_TOKEN || "";
const PIPEDRIVE_DOMAIN = () => process.env.PIPEDRIVE_DOMAIN || "";

function baseUrl(): string {
  return `https://${PIPEDRIVE_DOMAIN()}.pipedrive.com/api/v1`;
}

function withToken(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}api_token=${PIPEDRIVE_API_TOKEN()}`;
}

// ─── API calls ───────────────────────────────────────────────

export async function getDeal(dealId: number): Promise<PipedriveDeal | null> {
  const res = await fetch(withToken(`${baseUrl()}/deals/${dealId}`));
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}

export async function getOrganization(orgId: number): Promise<PipedriveOrg | null> {
  const res = await fetch(withToken(`${baseUrl()}/organizations/${orgId}`));
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}

export async function getPerson(personId: number): Promise<PipedrivePerson | null> {
  const res = await fetch(withToken(`${baseUrl()}/persons/${personId}`));
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}

export async function updateDeal(
  dealId: number,
  fields: Record<string, unknown>
): Promise<boolean> {
  const res = await fetch(withToken(`${baseUrl()}/deals/${dealId}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  return res.ok;
}

// ─── Field mapping ───────────────────────────────────────────

export type FieldMap = Record<string, string>;

export function getFieldMap(): FieldMap {
  try {
    return JSON.parse(process.env.PIPEDRIVE_FIELD_MAP || "{}");
  } catch {
    return {};
  }
}

/** Reverse map: ContractFormData key → Pipedrive field key */
export function getReverseFieldMap(): FieldMap {
  const map = getFieldMap();
  const reversed: FieldMap = {};
  for (const [pdKey, contractKey] of Object.entries(map)) {
    reversed[contractKey] = pdKey;
  }
  return reversed;
}

/**
 * Extract contract field values from a Pipedrive deal using the field map.
 * Returns a partial ContractFormData-like object with string values.
 */
export function mapDealToContractFields(
  deal: Record<string, unknown>
): Record<string, string> {
  const map = getFieldMap();
  const result: Record<string, string> = {};

  for (const [pdKey, contractKey] of Object.entries(map)) {
    const val = deal[pdKey];
    if (val !== null && val !== undefined && val !== "") {
      result[contractKey] = String(val);
    }
  }

  return result;
}

/**
 * Map contract data back to Pipedrive deal fields.
 */
export function mapContractToDealFields(
  contractData: Record<string, unknown>
): Record<string, unknown> {
  const reverseMap = getReverseFieldMap();
  const result: Record<string, unknown> = {};

  for (const [contractKey, pdKey] of Object.entries(reverseMap)) {
    const val = contractData[contractKey];
    if (val !== null && val !== undefined && val !== "") {
      result[pdKey] = val;
    }
  }

  return result;
}

/**
 * Extract standard deal/org/person fields into contract data.
 * These don't need field mapping – they use well-known Pipedrive structures.
 */
export async function extractStandardFields(deal: PipedriveDeal): Promise<Record<string, string>> {
  const fields: Record<string, string> = {};

  // Deal value → feeAmount
  if (deal.value) {
    fields.feeAmount = String(deal.value);
  }
  if (deal.currency) {
    fields.feeCurrency = deal.currency;
  }

  // Organization → client info
  const orgId = typeof deal.org_id === "object" ? deal.org_id?.value : deal.org_id;
  if (orgId) {
    const org = await getOrganization(Number(orgId));
    if (org) {
      fields.clientName = org.name || "";
      if (org.address) {
        fields.clientAddress = org.address;
      }
    }
  }

  // Person → representative + email
  const personId = typeof deal.person_id === "object" ? deal.person_id?.value : deal.person_id;
  if (personId) {
    const person = await getPerson(Number(personId));
    if (person) {
      fields.clientRepresentative = person.name || "";
      const email = person.email?.[0]?.value;
      if (email) {
        fields.clientEmail = email;
      }
    }
  }

  return fields;
}

// ─── Webhook validation ──────────────────────────────────────

export function validateWebhookToken(token: string | null): boolean {
  const expected = process.env.PIPEDRIVE_WEBHOOK_TOKEN;
  if (!expected) return true; // if no token configured, allow all
  return token === expected;
}

// ─── Types ───────────────────────────────────────────────────

export interface PipedriveDeal {
  id: number;
  title: string;
  value: number | null;
  currency: string;
  org_id: { value: number; name: string } | number | null;
  person_id: { value: number; name: string } | number | null;
  [key: string]: unknown;
}

export interface PipedriveOrg {
  id: number;
  name: string;
  address: string;
  [key: string]: unknown;
}

export interface PipedrivePerson {
  id: number;
  name: string;
  email: { value: string; primary: boolean }[];
  [key: string]: unknown;
}

export interface PipedriveWebhookPayload {
  v: number;
  meta: {
    action: string;
    object: string;
    id: number;
    [key: string]: unknown;
  };
  current: PipedriveDeal;
  previous: Record<string, unknown>;
  event: string;
}
