"use client";

import { useEffect, useState, use } from "react";
import ContractForm from "@/components/ContractForm";
import { dbToFormData } from "@/lib/contract-mapper";

export default function ContractEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<ReturnType<typeof dbToFormData> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/contracts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((contract) => {
        setData(dbToFormData(contract));
      })
      .catch(() => setError("Contract not found"));
  }, [id]);

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-4">{error}</p>
        <a href="/" className="text-blue-600 hover:underline">
          Back to list
        </a>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return <ContractForm contractId={id} initialData={data} />;
}
