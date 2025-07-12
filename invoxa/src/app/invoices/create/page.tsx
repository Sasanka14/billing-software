"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const currencyOptions = [
  { label: "INR (₹)", value: "INR" },
  { label: "USD ($)", value: "USD" },
  { label: "EUR (€)", value: "EUR" },
];

function generateInvoiceNumber() {
  // Example: INV-20240711-XXXX
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${ymd}-${rand}`;
}

export default function CreateInvoicePage() {
  const [clientName, setClientName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [items, setItems] = useState([
    { description: "", quantity: 1, unitPrice: 0, discount: 0 },
  ]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(false);
  const [advancePaymentLink, setAdvancePaymentLink] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNotLoggedIn(true);
      setAuthChecked(true);
      setTimeout(() => router.push("/"), 2000);
      return;
    }
    setAuthChecked(true);
    setInvoiceNumber(generateInvoiceNumber());
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    // Simulate auto-generated payment link (placeholder)
    setAdvancePaymentLink(`https://pay.invoxa.com/${Math.random().toString(36).slice(2, 10)}`);
  }, []);

  useEffect(() => {
    // Calculate total
    let sum = 0;
    for (const item of items) {
      const price = item.unitPrice * item.quantity;
      const discount = price * (item.discount / 100);
      sum += price - discount;
    }
    setTotal(sum);
  }, [items]);

  function handleItemChange(idx: number, field: string, value: any) {
    setItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, discount: 0 }]);
  }

  function removeItem(idx: number) {
    setItems(items => items.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const invoiceData = {
        clientName,
        company,
        email,
        address,
        phone,
        invoiceNumber,
        invoiceDate,
        dueDate,
        paymentTerms,
        currency,
        items,
        advanceAmount,
        advancePaid,
        total
      };

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invoice");
      }

      setSuccess("Invoice created successfully!");
      
      // Reset form
      setClientName("");
      setCompany("");
      setEmail("");
      setAddress("");
      setPhone("");
      setInvoiceNumber(generateInvoiceNumber());
      setInvoiceDate(new Date().toISOString().slice(0, 10));
      setDueDate("");
      setPaymentTerms("");
      setCurrency("INR");
      setItems([{ description: "", quantity: 1, unitPrice: 0, discount: 0 }]);
      setAdvanceAmount(0);
      setAdvancePaid(false);
      
      // Redirect to invoices list after a short delay
      setTimeout(() => {
        window.location.href = "/invoices";
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  }

  // Calculate remaining payment
  const remainingAmount = total - (advanceAmount || 0);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-700 mb-2">Create Invoice</h1>
            <p className="text-gray-600">Fill in the details below to create a professional invoice</p>
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
                  <input type="text" placeholder="Enter client name" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Company Name</label>
                  <input type="text" placeholder="Enter company name (optional)" value={company} onChange={e => setCompany(e.target.value)} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Email *</label>
                  <div className="relative">
                    <input type="email" placeholder="Enter email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full border-2 border-gray-200 px-4 py-3 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all" required />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Phone Number *</label>
                  <div className="relative">
                    <input type="tel" placeholder="Enter phone number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border-2 border-gray-200 px-4 py-3 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all" required />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Address *</label>
                  <input type="text" placeholder="Enter complete address" value={address} onChange={e => setAddress(e.target.value)} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all" required />
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
                  <input type="text" value={invoiceNumber} readOnly className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl bg-gray-50 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Invoice Date *</label>
                  <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Due Date *</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Payment Terms *</label>
                  <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" required>
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
                  <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" required>
                    {currencyOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
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
                {items.map((item, idx) => (
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
                      {items.length > 1 && (
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

            {/* Payment Summary Section */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg border border-orange-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-orange-700">Payment Summary</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Advance Amount</label>
                  <input type="number" min={0} step={0.01} placeholder="0.00" value={advanceAmount} onChange={e => setAdvanceAmount(Number(e.target.value))} className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all" />
                </div>
                <div className="flex items-center justify-center">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={advancePaid} onChange={e => setAdvancePaid(e.target.checked)} className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                    <span className="text-sm font-semibold text-gray-700">Advance Paid</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Payment Link</label>
                  <button type="button" className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-50" disabled>
                    Pay Advance
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="space-y-4 text-right">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-600">Advance Invoice:</span>
                    <span className="font-bold text-orange-600">{currency} {advanceAmount ? advanceAmount.toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-semibold text-gray-600">Total Invoice:</span>
                    <span className="font-bold text-purple-600">{currency} {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-600">Remaining Payment:</span>
                    <span className="font-bold text-green-600">{currency} {remainingAmount > 0 ? remainingAmount.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button type="submit" className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none" disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Creating Invoice...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Invoice
                  </div>
                )}
              </button>
              {success && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl font-semibold">
                  {success}
                </div>
              )}
              {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl font-semibold">
                  {error}
                </div>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 