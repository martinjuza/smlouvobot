"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ContractFormData,
  ContractFilmData,
  ContractType,
  ContractLanguage,
  PaymentVariant,
  DeliveryMethod,
  Installment,
  generateContractName,
} from "@/lib/types";

interface FilmOption {
  id: string;
  title: string;
  titleCz?: string;
  directors: string;
  yearOfProduction: string;
  resolution: string;
  domemasterFormat: string;
  soundmix: string;
  meVersionOfSound: boolean;
  runtime: string;
  originalLanguage: string;
  availableLanguages?: string;
  availableDubs?: string;
  availableResolutions?: string;
  availableSoundmixes?: string;
  availableFormats?: string;
}

interface ContractFormProps {
  contractId: string;
  initialData: ContractFormData;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const selectClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export default function ContractForm({ contractId, initialData }: ContractFormProps) {
  const [data, setData] = useState<ContractFormData>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [films, setFilms] = useState<FilmOption[]>([]);
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const loadFilms = () => {
    fetch("/api/films")
      .then((r) => r.json())
      .then(setFilms)
      .catch(() => {});
  };

  useEffect(() => {
    loadFilms();
  }, []);

  const update = useCallback(
    <K extends keyof ContractFormData>(key: K, value: ContractFormData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
      setSaved(false);
    },
    []
  );

  const save = async () => {
    setSaving(true);
    // Auto-generate name
    const name = generateContractName(
      data.signingDatePrague || new Date().toISOString().split("T")[0],
      data.clientName,
      data.films
    );
    const payload = { ...data, name };

    await fetch(`/api/contracts/${contractId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setData((prev) => ({ ...prev, name }));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const loadPreview = async () => {
    await save();
    const res = await fetch(`/api/contracts/${contractId}/preview`);
    const text = await res.text();
    setPreviewText(text);
    setShowPreview(true);
  };

  const syncFilms = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/films/sync", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setSyncResult(`Synced: ${json.created} new, ${json.updated} updated`);
        loadFilms();
      } else {
        setSyncResult(`Error: ${json.error}`);
      }
    } catch {
      setSyncResult("Sync failed");
    }
    setSyncing(false);
    setTimeout(() => setSyncResult(null), 4000);
  };

  const pushToPipedrive = async () => {
    setPushing(true);
    setPushResult(null);
    await save();
    try {
      const res = await fetch("/api/pipedrive/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId }),
      });
      const json = await res.json();
      if (json.ok) {
        setPushResult(`Pushed ${json.fieldsPushed.length} fields to deal #${json.dealId}`);
      } else {
        setPushResult(`Error: ${json.error}`);
      }
    } catch {
      setPushResult("Push failed");
    }
    setPushing(false);
    setTimeout(() => setPushResult(null), 4000);
  };

  // Film management
  const addFilm = () => {
    const newFilm: ContractFilmData = {
      title: "",
      resolution: "2K",
      domemasterFormat: "png image sequence domemaster",
      soundmix: "5.1",
      meVersionOfSound: true,
      language: "EN",
    };
    update("films", [...data.films, newFilm]);
  };

  const addFilmFromCatalogue = (filmOpt: FilmOption) => {
    const newFilm: ContractFilmData = {
      filmId: filmOpt.id,
      title: data.language === "CZ" && filmOpt.titleCz ? filmOpt.titleCz : filmOpt.title,
      directors: filmOpt.directors,
      yearOfProduction: filmOpt.yearOfProduction,
      resolution: filmOpt.resolution,
      domemasterFormat: filmOpt.domemasterFormat,
      soundmix: filmOpt.soundmix,
      meVersionOfSound: filmOpt.meVersionOfSound,
      runtime: filmOpt.runtime,
      language: filmOpt.originalLanguage,
      availableLanguages: filmOpt.availableLanguages || undefined,
      availableDubs: filmOpt.availableDubs || undefined,
      availableResolutions: filmOpt.availableResolutions || undefined,
      availableSoundmixes: filmOpt.availableSoundmixes || undefined,
      availableFormats: filmOpt.availableFormats || undefined,
    };
    update("films", [...data.films, newFilm]);
  };

  /** Parse a JSON array string into string[], returns empty if not valid */
  const parseJsonArray = (val?: string): string[] => {
    if (!val) return [];
    try {
      const arr = JSON.parse(val);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const updateFilm = (index: number, key: keyof ContractFilmData, value: string | boolean) => {
    const updated = [...data.films];
    updated[index] = { ...updated[index], [key]: value };
    update("films", updated);
  };

  const removeFilm = (index: number) => {
    update(
      "films",
      data.films.filter((_, i) => i !== index)
    );
  };

  // Installment management
  const addInstallment = () => {
    update("installments", [
      ...data.installments,
      { amount: "", currency: data.feeCurrency, dueDate: "" },
    ]);
  };

  const updateInstallment = (index: number, key: keyof Installment, value: string) => {
    const updated = [...data.installments];
    updated[index] = { ...updated[index], [key]: value };
    update("installments", updated);
  };

  const removeInstallment = (index: number) => {
    update(
      "installments",
      data.installments.filter((_, i) => i !== index)
    );
  };

  const paymentVariants: { value: PaymentVariant; label: string }[] =
    data.type === "SINGLE_LICENCE"
      ? [
          { value: "FLAT_FEE", label: "Flat Fee" },
          { value: "INSTALLMENTS", label: "Installments" },
          { value: "REVENUE_SHARE", label: "Revenue Share" },
        ]
      : [
          { value: "ANNUAL_ONETIME", label: "Annual One-time" },
          { value: "MONTHLY_INSTALLMENTS", label: "Monthly Installments" },
        ];

  return (
    <div>
      {/* Top bar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {data.name || "New Contract"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {data.type === "ONE_PLUS" ? "One+ Programme" : "Single Licence"} |{" "}
            {data.language === "CZ" ? "Czech" : "English"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadPreview}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Preview
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Contract Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                x
              </button>
            </div>
            <pre className="p-6 overflow-auto flex-1 text-sm whitespace-pre-wrap font-mono">
              {previewText}
            </pre>
          </div>
        </div>
      )}

      {/* Contract Type & Language */}
      <Section title="Contract Settings">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Contract Type">
            <select
              value={data.type}
              onChange={(e) => {
                const type = e.target.value as ContractType;
                update("type", type);
                update(
                  "paymentVariant",
                  type === "SINGLE_LICENCE" ? "FLAT_FEE" : "ANNUAL_ONETIME"
                );
              }}
              className={selectClass}
            >
              <option value="SINGLE_LICENCE">Single Licence</option>
              <option value="ONE_PLUS">One+ Programme</option>
            </select>
          </Field>
          <Field label="Language">
            <select
              value={data.language}
              onChange={(e) => update("language", e.target.value as ContractLanguage)}
              className={selectClass}
            >
              <option value="EN">English</option>
              <option value="CZ">Czech</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Client */}
      <Section title="Client Information">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company Name" className="col-span-2">
            <input
              type="text"
              value={data.clientName}
              onChange={(e) => update("clientName", e.target.value)}
              className={inputClass}
              placeholder="e.g. Prague Planetarium s.r.o."
            />
          </Field>
          <Field label="Address" className="col-span-2">
            <input
              type="text"
              value={data.clientAddress}
              onChange={(e) => update("clientAddress", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Business ID (ICO)">
            <input
              type="text"
              value={data.clientBusinessId}
              onChange={(e) => update("clientBusinessId", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Tax ID (DIC)">
            <input
              type="text"
              value={data.clientTaxId}
              onChange={(e) => update("clientTaxId", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Representative">
            <input
              type="text"
              value={data.clientRepresentative}
              onChange={(e) => update("clientRepresentative", e.target.value)}
              className={inputClass}
              placeholder="Name and title"
            />
          </Field>
          <Field label="Email" className="col-span-2">
            <input
              type="email"
              value={data.clientEmail}
              onChange={(e) => update("clientEmail", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* Films */}
      <Section title="Films">
        {data.films.map((film, i) => (
          <div key={i} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-600">Film #{i + 1}</span>
              <button
                onClick={() => removeFilm(i)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title" className="col-span-2 !mb-2">
                <input
                  type="text"
                  value={film.title}
                  onChange={(e) => updateFilm(i, "title", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Directors" className="!mb-2">
                <input
                  type="text"
                  value={film.directors || ""}
                  onChange={(e) => updateFilm(i, "directors", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Year" className="!mb-2">
                <input
                  type="text"
                  value={film.yearOfProduction || ""}
                  onChange={(e) => updateFilm(i, "yearOfProduction", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Resolution" className="!mb-2">
                {(() => {
                  const opts = parseJsonArray(film.availableResolutions);
                  return opts.length > 0 ? (
                    <select
                      value={film.resolution}
                      onChange={(e) => updateFilm(i, "resolution", e.target.value)}
                      className={selectClass}
                    >
                      {opts.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={film.resolution}
                      onChange={(e) => updateFilm(i, "resolution", e.target.value)}
                      className={selectClass}
                    >
                      <option value="2K">2K</option>
                      <option value="4K">4K</option>
                      <option value="8K">8K</option>
                    </select>
                  );
                })()}
              </Field>
              <Field label="Format" className="!mb-2">
                {(() => {
                  const opts = parseJsonArray(film.availableFormats);
                  return opts.length > 0 ? (
                    <select
                      value={film.domemasterFormat}
                      onChange={(e) => updateFilm(i, "domemasterFormat", e.target.value)}
                      className={selectClass}
                    >
                      {opts.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={film.domemasterFormat}
                      onChange={(e) => updateFilm(i, "domemasterFormat", e.target.value)}
                      className={inputClass}
                    />
                  );
                })()}
              </Field>
              <Field label="Soundmix" className="!mb-2">
                {(() => {
                  const opts = parseJsonArray(film.availableSoundmixes);
                  return opts.length > 0 ? (
                    <select
                      value={film.soundmix}
                      onChange={(e) => updateFilm(i, "soundmix", e.target.value)}
                      className={selectClass}
                    >
                      {opts.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={film.soundmix}
                      onChange={(e) => updateFilm(i, "soundmix", e.target.value)}
                      className={selectClass}
                    >
                      <option value="5.1">5.1</option>
                      <option value="7.1">7.1</option>
                      <option value="Stereo">Stereo</option>
                      <option value="Mono">Mono</option>
                    </select>
                  );
                })()}
              </Field>
              <Field label="Language" className="!mb-2">
                {(() => {
                  const langs = parseJsonArray(film.availableLanguages);
                  return langs.length > 0 ? (
                    <select
                      value={film.language}
                      onChange={(e) => updateFilm(i, "language", e.target.value)}
                      className={selectClass}
                    >
                      {langs.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={film.language}
                      onChange={(e) => updateFilm(i, "language", e.target.value)}
                      className={inputClass}
                    />
                  );
                })()}
              </Field>
              <Field label="Runtime (min)" className="!mb-2">
                <input
                  type="text"
                  value={film.runtime || ""}
                  onChange={(e) => updateFilm(i, "runtime", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <div className="flex items-center gap-2 col-span-2">
                <input
                  type="checkbox"
                  checked={film.meVersionOfSound}
                  onChange={(e) => updateFilm(i, "meVersionOfSound", e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">M&E version of sound available</span>
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={addFilm}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            + Add Film Manually
          </button>
          {films.length > 0 && (
            <div className="relative">
              <select
                onChange={(e) => {
                  const film = films.find((f) => f.id === e.target.value);
                  if (film) addFilmFromCatalogue(film);
                  e.target.value = "";
                }}
                className={selectClass}
                defaultValue=""
              >
                <option value="" disabled>
                  + Add from Catalogue ({films.length} films)
                </option>
                {films.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={syncFilms}
            disabled={syncing}
            className="px-3 py-2 text-sm border border-green-300 text-green-700 rounded-md hover:bg-green-50 disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync from Google Sheet"}
          </button>
          {syncResult && (
            <span className="text-xs text-gray-600">{syncResult}</span>
          )}
        </div>
      </Section>

      {/* License */}
      <Section title="License Terms">
        <Field label="Territory / Planetarium" className="mb-4">
          <input
            type="text"
            value={data.territory}
            onChange={(e) => update("territory", e.target.value)}
            className={inputClass}
            placeholder="e.g. Prague Planetarium, Czech Republic"
          />
        </Field>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={data.licenseUnlimited}
            onChange={(e) => update("licenseUnlimited", e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Unlimited (perpetual) licence</span>
        </div>
        {!data.licenseUnlimited && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="From">
              <input
                type="date"
                value={data.licenseFrom}
                onChange={(e) => update("licenseFrom", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="To">
              <input
                type="date"
                value={data.licenseTo}
                onChange={(e) => update("licenseTo", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        )}
      </Section>

      {/* Payment */}
      <Section title="Payment">
        <Field label="Payment Variant">
          <select
            value={data.paymentVariant}
            onChange={(e) => update("paymentVariant", e.target.value as PaymentVariant)}
            className={selectClass}
          >
            {paymentVariants.map((pv) => (
              <option key={pv.value} value={pv.value}>
                {pv.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Flat fee / Annual fee */}
        {(data.paymentVariant === "FLAT_FEE" ||
          data.paymentVariant === "INSTALLMENTS" ||
          data.paymentVariant === "ANNUAL_ONETIME" ||
          data.paymentVariant === "MONTHLY_INSTALLMENTS") && (
          <div className="grid grid-cols-3 gap-4">
            <Field label="Total Fee Amount" className="col-span-2">
              <input
                type="text"
                value={data.feeAmount}
                onChange={(e) => update("feeAmount", e.target.value)}
                className={inputClass}
                placeholder="e.g. 1500"
              />
            </Field>
            <Field label="Currency">
              <select
                value={data.feeCurrency}
                onChange={(e) => update("feeCurrency", e.target.value)}
                className={selectClass}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="CZK">CZK</option>
                <option value="GBP">GBP</option>
              </select>
            </Field>
          </div>
        )}

        {/* Installments */}
        {data.paymentVariant === "INSTALLMENTS" && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Installments</h3>
            {data.installments.map((inst, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <Field label={`Amount #${i + 1}`} className="!mb-0">
                  <input
                    type="text"
                    value={inst.amount}
                    onChange={(e) => updateInstallment(i, "amount", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Currency" className="!mb-0">
                  <select
                    value={inst.currency}
                    onChange={(e) => updateInstallment(i, "currency", e.target.value)}
                    className={selectClass}
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="CZK">CZK</option>
                  </select>
                </Field>
                <Field label="Due Date" className="!mb-0">
                  <input
                    type="date"
                    value={inst.dueDate}
                    onChange={(e) => updateInstallment(i, "dueDate", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <div className="flex items-end pb-1">
                  <button
                    onClick={() => removeInstallment(i)}
                    className="text-red-500 text-xs hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addInstallment}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              + Add Installment
            </button>
          </div>
        )}

        {/* Monthly amount (One+) */}
        {data.paymentVariant === "MONTHLY_INSTALLMENTS" && (
          <Field label="Monthly Installment Amount" className="mt-2">
            <input
              type="text"
              value={data.monthlyAmount}
              onChange={(e) => update("monthlyAmount", e.target.value)}
              className={inputClass}
              placeholder="e.g. 125"
            />
          </Field>
        )}

        {/* Revenue share */}
        {data.paymentVariant === "REVENUE_SHARE" && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Revenue Share - School/Education (%)">
                <input
                  type="text"
                  value={data.revenueShareSchool}
                  onChange={(e) => update("revenueShareSchool", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 25"
                />
              </Field>
              <Field label="Revenue Share - Public (%)">
                <input
                  type="text"
                  value={data.revenueSharePublic}
                  onChange={(e) => update("revenueSharePublic", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 30"
                />
              </Field>
            </div>
            <Field label="Deductible Promotional Costs">
              <input
                type="text"
                value={data.promotionalCosts}
                onChange={(e) => update("promotionalCosts", e.target.value)}
                className={inputClass}
                placeholder="e.g. 500"
              />
            </Field>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.hasMinGuarantee}
                onChange={(e) => update("hasMinGuarantee", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Minimum Guarantee</span>
            </div>
            {data.hasMinGuarantee && (
              <div className="grid grid-cols-3 gap-4 ml-6">
                <Field label="Min Guarantee Amount" className="col-span-2">
                  <input
                    type="text"
                    value={data.minGuaranteeAmount}
                    onChange={(e) => update("minGuaranteeAmount", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Currency">
                  <select
                    value={data.minGuaranteeCurrency}
                    onChange={(e) => update("minGuaranteeCurrency", e.target.value)}
                    className={selectClass}
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="CZK">CZK</option>
                  </select>
                </Field>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.hasRevenueCap}
                onChange={(e) => update("hasRevenueCap", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Revenue Cap</span>
            </div>
            {data.hasRevenueCap && (
              <Field label="Revenue Cap Amount" className="ml-6">
                <input
                  type="text"
                  value={data.revenueCapAmount}
                  onChange={(e) => update("revenueCapAmount", e.target.value)}
                  className={inputClass}
                />
              </Field>
            )}
          </div>
        )}
      </Section>

      {/* Delivery */}
      <Section title="Delivery">
        <Field label="Delivery Method">
          <select
            value={data.deliveryMethod}
            onChange={(e) => update("deliveryMethod", e.target.value as DeliveryMethod)}
            className={selectClass}
          >
            <option value="FTP">FTP Download</option>
            <option value="HDD">External HDD</option>
          </select>
        </Field>
      </Section>

      {/* Signing */}
      <Section title="Signing">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date (Prague)">
            <input
              type="date"
              value={data.signingDatePrague}
              onChange={(e) => update("signingDatePrague", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Date (Client)">
            <input
              type="date"
              value={data.signingDateClient}
              onChange={(e) => update("signingDateClient", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Place (Client)" className="col-span-2">
            <input
              type="text"
              value={data.signingPlaceClient}
              onChange={(e) => update("signingPlaceClient", e.target.value)}
              className={inputClass}
              placeholder="e.g. Berlin, Germany"
            />
          </Field>
        </div>
      </Section>

      {/* Pipedrive */}
      {data.pipedriveId && (
        <Section title="Pipedrive">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Linked to deal #{data.pipedriveId}
            </span>
            <button
              onClick={pushToPipedrive}
              disabled={pushing}
              className="px-3 py-2 text-sm border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 disabled:opacity-50"
            >
              {pushing ? "Pushing..." : "Push to Pipedrive"}
            </button>
            {pushResult && (
              <span className="text-xs text-gray-600">{pushResult}</span>
            )}
          </div>
        </Section>
      )}

      {/* Bottom Save */}
      <div className="flex justify-end gap-2 mb-12">
        <a href="/" className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
          Back to List
        </a>
        <button
          onClick={loadPreview}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Preview Contract
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Contract"}
        </button>
      </div>
    </div>
  );
}
