"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: {
    name: string;
    email: string;
    company?: string;
  };
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  currency: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 6;
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('');

  // Filtering logic
  const filteredInvoices = invoices.filter(inv => {
    const statusMatch = statusFilter === 'all' || inv.status === statusFilter;
    const clientMatch =
      clientFilter.trim() === '' ||
      inv.client.name.toLowerCase().includes(clientFilter.trim().toLowerCase()) ||
      inv.client.email.toLowerCase().includes(clientFilter.trim().toLowerCase());
    return statusMatch && clientMatch;
  });
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * invoicesPerPage, currentPage * invoicesPerPage);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [statusFilter, clientFilter]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNotLoggedIn(true);
      setAuthChecked(true);
      setTimeout(() => router.push("/"), 2000);
      return;
    }
    setAuthChecked(true);
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch("/api/invoices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      setError("Failed to load invoices");
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteInvoice(id: string) {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      setInvoices(invoices => invoices.filter(inv => inv._id !== id));
    } catch (err) {
      setError('Failed to delete invoice');
    }
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

  // Custom dropdown style for status filter
  const dropdownMenuStyle = {
    borderRadius: '12px',                // Rounded corners
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)', // Subtle elevation
    border: '1.5px solid #e5e7eb',       // Light border
    background: '#fff',                  // White background
    marginTop: '4px',                    // Small spacing from trigger
    overflow: 'hidden',                  // Ensures child items don't overflow
    transition: 'all 0.2s ease-in-out',  // Smooth open/close animation
    zIndex: 50                           // Keep above most UI elements
  };

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
      <div className="min-h-screen bg-gray-100">
        <main className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-2 sm:px-4 md:px-8">
      <div className="max-w-full md:max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
          <Link href="/invoices/create" className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Invoice
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border-2 border-gray-200 px-4 py-2 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all pr-8 bg-white text-gray-700 font-semibold shadow-sm"
                style={{ borderRadius: '12px' }}
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="advance_paid">Advance Paid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              {/* Custom dropdown menu styling for open state (for modern browsers) */}
              <style jsx global>{`
                select:focus, select:active {
                  border-radius: 12px !important;
                }
                select {
                  border-radius: 12px !important;
                }
                select option {
                  border-radius: 12px !important;
                }
                /* For Chrome/Edge/Safari */
                select::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Client Name or Email</label>
            <input
              type="text"
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
              placeholder="Search by client name or email"
              className="w-full border-2 border-gray-200 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">No invoices found</div>
            <p className="text-gray-400 mb-6">Start by creating your first invoice</p>
            <Link href="/invoices/create" className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition">
              Create Your First Invoice
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="block md:hidden">
              {paginatedInvoices.map((invoice) => (
                <div key={invoice._id} className="bg-white rounded-xl shadow p-4 mb-4">
                  <div className="font-bold text-purple-700 mb-1">{invoice.invoiceNumber}</div>
                  <div className="text-sm text-gray-600 mb-1">{invoice.client.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{invoice.client.email}</div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs bg-gray-100 rounded px-2 py-1">{invoice.status}</span>
                    <span className="font-bold">{invoice.currency} {invoice.total.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => window.location.href = `/invoices/${invoice._id}`} className="flex-1 bg-purple-600 text-white rounded-lg py-2 font-semibold">View</button>
                    <button onClick={() => deleteInvoice(invoice._id)} className="flex-1 bg-red-500 text-white rounded-lg py-2 font-semibold">Delete</button>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Invoice #</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Client</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Due Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{invoice.client.name}</div>
                          <div className="text-sm text-gray-500">{invoice.client.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {invoice.currency} {invoice.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link href={`/invoices/${invoice._id}`} className="text-purple-600 hover:text-purple-900 font-medium mr-4">
                          View
                        </Link>
                        <button
                          onClick={() => deleteInvoice(invoice._id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="font-semibold text-gray-700">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 