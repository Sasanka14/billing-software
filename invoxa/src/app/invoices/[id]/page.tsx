"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

interface Client {
  name: string;
  email: string;
  company?: string;
  address?: string;
  phone?: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: Client;
  items: InvoiceItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  issuedDate: string;
  currency: string;
  paymentTerms: string;
  advanceAmount: number;
  advancePaid: boolean;
  createdAt: string;
}

export default function ViewInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailType, setEmailType] = useState<'payment' | 'invoice' | null>(null);

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
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(`/api/invoices/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch invoice");
      }

      const data = await response.json();
      setInvoice(data.invoice);
    } catch (err) {
      setError("Failed to load invoice");
      console.error("Error fetching invoice:", err);
    } finally {
      setLoading(false);
    }
  }

  async function sendEmail(type: 'payment' | 'invoice') {
    setSendingEmail(true);
    setEmailType(type);
    const token = localStorage.getItem("token");
    await toast.promise(
      fetch(`/api/invoices/${params.id}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to send email');
      }),
      {
        loading: type === 'invoice' ? 'Sending invoice...' : 'Sending payment link...',
        success: type === 'invoice'
          ? `Invoice sent to ${invoice?.client.email}!`
          : `Payment link sent to ${invoice?.client.email}!`,
        error: 'Failed to send email',
      }
    );
    setSendingEmail(false);
    setEmailType(null);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }

  function formatCurrency(amount: number) {
    return `${invoice?.currency || 'INR'} ${amount.toFixed(2)}`;
  }

  async function handleDownloadPdf() {
    const token = localStorage.getItem("token");
    await toast.promise(
      fetch(`/api/invoices/${params.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to download PDF");
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Invoice-${invoice?.invoiceNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        }),
      {
        loading: 'Preparing PDF...',
        success: 'PDF downloaded!',
        error: 'Failed to download PDF',
      }
    );
  }

  function handleEditInvoice() {
    router.push(`/invoices/${params.id}/edit`);
  }

  async function handleDeleteInvoice() {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    const token = localStorage.getItem("token");
    await toast.promise(
      fetch(`/api/invoices/${params.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (!res.ok) throw new Error("Failed to delete invoice");
        router.push("/invoices");
      }),
      {
        loading: 'Deleting invoice...',
        success: 'Invoice deleted!',
        error: 'Failed to delete invoice',
      }
    );
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

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <main className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error || "Invoice not found"}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Link href="/invoices" className="text-purple-600 hover:text-purple-800 font-medium mb-2 inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Invoices
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">Invoice #{invoice.invoiceNumber}</h1>
            </div>
            <div className="flex gap-3">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Invoice Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client & Invoice Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Client Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Name:</span>
                        <p className="font-medium">{invoice.client.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Email:</span>
                        <p className="font-medium">{invoice.client.email}</p>
                      </div>
                      {invoice.client.company && (
                        <div>
                          <span className="text-sm text-gray-500">Company:</span>
                          <p className="font-medium">{invoice.client.company}</p>
                        </div>
                      )}
                      {invoice.client.address && (
                        <div>
                          <span className="text-sm text-gray-500">Address:</span>
                          <p className="font-medium">{invoice.client.address}</p>
                        </div>
                      )}
                      {invoice.client.phone && (
                        <div>
                          <span className="text-sm text-gray-500">Phone:</span>
                          <p className="font-medium">{invoice.client.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoice Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Invoice Number:</span>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Issue Date:</span>
                        <p className="font-medium">{formatDate(invoice.issuedDate)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Due Date:</span>
                        <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Payment Terms:</span>
                        <p className="font-medium">{invoice.paymentTerms || 'Net 30'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Items</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.items.map((item, index) => {
                        const subtotal = item.quantity * item.unitPrice;
                        const discount = subtotal * (item.discount / 100);
                        const total = subtotal - discount;
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.discount}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {formatCurrency(total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(invoice.total)}</span>
                  </div>
                  {invoice.advanceAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Advance Amount:</span>
                      <span className="font-medium">{formatCurrency(invoice.advanceAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div className="space-y-6">
              {/* Email Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Send to Client</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => sendEmail('invoice')}
                    disabled={sendingEmail}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
                  >
                    {sendingEmail && emailType === 'invoice' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    Send Invoice
                  </button>
                  <button
                    onClick={() => sendEmail('payment')}
                    disabled={sendingEmail}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
                  >
                    {sendingEmail && emailType === 'payment' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    )}
                    Send Payment Link
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Send invoice or payment link to {invoice.client.email}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={handleDownloadPdf} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </button>
                  <button onClick={handleEditInvoice} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Invoice
                  </button>
                  <button
                    onClick={handleDeleteInvoice}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-4 py-3 rounded-xl font-medium transition flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 