"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 4;
  const [clientFilter, setClientFilter] = useState('');

  // Filtering logic
  const filteredClients = clients.filter(client => {
    return (
      clientFilter.trim() === '' ||
      client.name.toLowerCase().includes(clientFilter.trim().toLowerCase()) ||
      client.email.toLowerCase().includes(clientFilter.trim().toLowerCase())
    );
  });
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);
  const paginatedClients = filteredClients.slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage);

  // Reset to page 1 when filter changes
  useEffect(() => { setCurrentPage(1); }, [clientFilter]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNotLoggedIn(true);
      setAuthChecked(true);
      setTimeout(() => router.push("/"), 2000);
      return;
    }
    setAuthChecked(true);
    async function fetchClients() {
      const res = await fetch("/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      } else {
        setClients([]);
      }
    }
    fetchClients();
  }, []);

  async function deleteClient(id: string) {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setClients(clients => clients.filter(c => c._id !== id && c.id !== id));
      }
    } catch {}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-2 sm:px-4 md:px-8">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 max-w-full md:max-w-4xl w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-purple-700">Clients</h1>
            </div>
          </div>
          {/* Filter Bar */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Client Name or Email</label>
            <input
              type="text"
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
              placeholder="Search by client name or email"
              className="w-full border-2 border-gray-200 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
            />
          </div>
          {filteredClients.length === 0 ? (
            <div className="text-gray-500 text-lg text-center py-12">No clients found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {paginatedClients.map(client => (
                <div key={client._id || client.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-100 flex flex-col gap-3">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {client.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-700">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.company}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V6a4 4 0 10-8 0v4m12 0H4" />
                    </svg>
                    <span>{client.address}</span>
                  </div>
                  <button
                    onClick={() => deleteClient(client._id || client.id)}
                    className="mt-4 px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition self-end"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
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
        </div>
      </main>
    </div>
  );
} 