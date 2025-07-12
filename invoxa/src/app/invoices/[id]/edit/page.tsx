"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [invoice, setInvoice] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNotLoggedIn(true);
      setAuthChecked(true);
      setTimeout(() => router.push("/"), 2000);
      return;
    }
    setAuthChecked(true);
    fetchInvoice();
  }, []);

  async function fetchInvoice() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/invoices/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch invoice");
      const data = await res.json();
      setInvoice(data.invoice);
    } catch (err) {
      setError("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: any) {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  }

  function handleItemChange(idx: number, field: string, value: any) {
    setInvoice((prev: any) => ({
      ...prev,
      items: prev.items.map((item: any, i: number) =>
        i === idx ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addItem() {
    setInvoice((prev: any) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0, discount: 0 }],
    }));
  }

  function removeItem(idx: number) {
    setInvoice((prev: any) => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== idx),
    }));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("token");
    await toast.promise(
      fetch(`/api/invoices/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoice),
      }).then(async (res) => {
        if (!res.ok) throw new Error("Failed to update invoice");
        router.push(`/invoices/${params.id}`);
      }),
      {
        loading: "Saving...",
        success: "Invoice updated!",
        error: "Failed to update invoice",
      }
    );
    setSaving(false);
  }

  if (!authChecked) return null;
  if (notLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-2 text-purple-700">You must be logged in to view this page.</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!invoice) return null;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-700 mb-2">Edit Invoice</h1>
            <p className="text-gray-600">Update the details below to edit your invoice</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Client Details */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-purple-700">Client Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Client Name *</label>
                  <input type="text" placeholder="Enter client name" value={invoice.client?.name || ""} onChange={e => setInvoice({ ...invoice, client: { ...invoice.client, name: e.target.value } })} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Company Name</label>
                  <input type="text" placeholder="Enter company name (optional)" value={invoice.client?.company || ""} onChange={e => setInvoice({ ...invoice, client: { ...invoice.client, company: e.target.value } })} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Email *</label>
                  <div className="relative">
                    <input type="email" placeholder="Enter email address" value={invoice.client?.email || ""} onChange={e => setInvoice({ ...invoice, client: { ...invoice.client, email: e.target.value } })} className="w-full border-2 border-gray-200 px-4 py-3 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all" required />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Phone Number *</label>
                  <div className="relative">
                    <input type="tel" placeholder="Enter phone number" value={invoice.client?.phone || ""} onChange={e => setInvoice({ ...invoice, client: { ...invoice.client, phone: e.target.value } })} className="w-full border-2 border-gray-200 px-4 py-3 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all" required />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Address *</label>
                  <input type="text" placeholder="Enter complete address" value={invoice.client?.address || ""} onChange={e => setInvoice({ ...invoice, client: { ...invoice.client, address: e.target.value } })} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all" required />
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-blue-700">Invoice Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Invoice Number</label>
                  <input type="text" value={invoice.invoiceNumber} readOnly className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl bg-gray-50 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Invoice Date *</label>
                  <input type="date" value={invoice.issuedDate?.slice(0,10) || ""} onChange={e => setInvoice({ ...invoice, issuedDate: e.target.value })} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Due Date *</label>
                  <input type="date" value={invoice.dueDate?.slice(0,10) || ""} onChange={e => setInvoice({ ...invoice, dueDate: e.target.value })} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Payment Terms *</label>
                  <select value={invoice.paymentTerms || ""} onChange={e => setInvoice({ ...invoice, paymentTerms: e.target.value })} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" required>
                    <option value="">Select Payment Terms</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 7">Net 7</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Currency *</label>
                  <select value={invoice.currency || ""} onChange={e => setInvoice({ ...invoice, currency: e.target.value })} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" required>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-green-700">Items & Services</h2>
                </div>
                <button type="button" onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Item
                </button>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="grid grid-cols-12 gap-4 mb-4 text-sm font-semibold text-gray-600">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-center">Unit Price</div>
                  <div className="col-span-2 text-center">Discount</div>
                  <div className="col-span-1"></div>
                </div>
                {invoice.items.map((item: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 mb-4 items-center">
                    <div className="col-span-6">
                      <input type="text" placeholder="Item description" value={item.description} onChange={e => handleItemChange(idx, "description", e.target.value)} className="w-full border-2 border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all" required />
                    </div>
                    <div className="col-span-2">
                      <input type="number" min={1} placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(idx, "quantity", Number(e.target.value))} className="w-full border-2 border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all" required />
                    </div>
                    <div className="col-span-2">
                      <input type="number" min={0} step={0.01} placeholder="Price" value={item.unitPrice} onChange={e => handleItemChange(idx, "unitPrice", Number(e.target.value))} className="w-full border-2 border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all" required />
                    </div>
                    <div className="col-span-2">
                      <input type="number" min={0} max={100} step={0.01} placeholder="%" value={item.discount} onChange={e => handleItemChange(idx, "discount", Number(e.target.value))} className="w-full border-2 border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all" />
                    </div>
                    <div className="col-span-1">
                      {invoice.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="w-8 h-8 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button type="submit" className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none" disabled={saving}>
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Saving Changes...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </div>
                )}
              </button>
              <button type="button" onClick={() => router.back()} className="ml-4 px-8 py-4 bg-gray-200 text-gray-700 rounded-2xl font-bold text-xl shadow hover:bg-gray-300 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 