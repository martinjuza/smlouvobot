"use client";

import { useEffect, useState } from "react";

interface ContractListItem {
  id: string;
  name: string | null;
  type: string;
  language: string;
  status: string;
  clientName: string | null;
  updatedAt: string;
  films: { title: string }[];
}

export default function HomePage() {
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contracts")
      .then((r) => r.json())
      .then((data) => {
        setContracts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contract?")) return;
    await fetch(`/api/contracts/${id}`, { method: "DELETE" });
    setContracts((prev) => prev.filter((c) => c.id !== id));
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      PDF_GENERATED: "bg-blue-100 text-blue-800",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  const typeBadge = (type: string) => {
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${type === "ONE_PLUS" ? "bg-purple-100 text-purple-800" : "bg-indigo-100 text-indigo-800"}`}>
        {type === "ONE_PLUS" ? "One+" : "Single Licence"}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
        <a
          href="/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          + New Contract
        </a>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No contracts yet</p>
          <a
            href="/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Create your first contract
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contract</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Films</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Updated</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a href={`/contract/${c.id}`} className="text-blue-600 hover:underline font-medium">
                      {c.name || "Untitled"}
                    </a>
                  </td>
                  <td className="px-4 py-3">{typeBadge(c.type)}</td>
                  <td className="px-4 py-3 text-gray-700">{c.clientName || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.films.length > 0
                      ? c.films.map((f) => f.title).join(", ")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">{statusBadge(c.status)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/contract/${c.id}`}
                      className="text-blue-600 hover:underline text-xs mr-3"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
