"use client";
import { useEffect, useState } from "react";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setInvoices(data);
        } else {
          setInvoices([]);
        }
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      inv.client?.toLowerCase().includes(q) ||
      inv.contact?.toLowerCase().includes(q) ||
      inv.address?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    await fetch(`/api/invoices`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: id }),
    });
    setInvoices((prev) => prev.filter((inv) => inv._id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-xl font-bold text-primary">Invoices</h2>
        <input
          type="text"
          placeholder="Search by client, contact, address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 rounded bg-gray-800 text-gray-100 w-full sm:w-64 border border-gray-700"
        />
      </div>
      {loading ? (
        <div className="text-gray-400 text-center py-8">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No invoices found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-gray-900 text-gray-100">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Discount (%)</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Due Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv._id} className="border-b border-gray-800 hover:bg-gray-800/60 transition">
                  <td className="p-3">{inv.client}</td>
                  <td className="p-3">{inv.contact}</td>
                  <td className="p-3">{inv.currency} {inv.amount?.toFixed(2)}</td>
                  <td className="p-3">{inv.discount}%</td>
                  <td className="p-3 font-bold text-green-400">{inv.currency} {inv.total?.toFixed(2)}</td>
                  <td className="p-3">{inv.dueDate}</td>
                  <td className="p-3 capitalize">{inv.status || 'pending'}</td>
                  <td className="p-3 flex gap-2">
                    <a
                      href={`/invoice/${inv._id}`}
                      className="px-3 py-1 rounded bg-primary text-white hover:bg-primary-dark text-xs font-semibold transition"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(inv._id)}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs font-semibold transition"
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