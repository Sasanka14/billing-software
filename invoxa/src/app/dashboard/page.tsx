"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    invoices: 0,
    clients: 0,
    revenue: 0,
  });
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
    async function fetchStats() {
      // Fetch invoices
      const invRes = await fetch("/api/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let invoices = [];
      let revenue = 0;
      if (invRes.ok) {
        const data = await invRes.json();
        invoices = data.invoices || [];
        revenue = invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
      }
      // Fetch clients
      const cliRes = await fetch("/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let clients = [];
      if (cliRes.ok) {
        const data = await cliRes.json();
        clients = data.clients || [];
      }
      setStats({
        invoices: invoices.length,
        clients: clients.length,
        revenue,
      });
    }
    fetchStats();
  }, []);

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
      <main className="flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-purple-700">Dashboard</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Total Invoices */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-100 flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-blue-700">Total Invoices</div>
              <div className="text-3xl font-bold text-blue-900 mt-2">{stats.invoices}</div>
            </div>
            {/* Total Clients */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-green-100 flex flex-col items-center">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-green-700">Total Clients</div>
              <div className="text-3xl font-bold text-green-900 mt-2">{stats.clients}</div>
            </div>
            {/* Total Revenue */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg border border-orange-100 flex flex-col items-center">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-orange-700">Total Revenue</div>
              <div className="text-3xl font-bold text-orange-900 mt-2">₹{stats.revenue.toLocaleString()}</div>
            </div>
          </div>
          {/* Recent Activity Placeholder */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-100 mt-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-purple-700">Recent Activity</h2>
            </div>
            <div className="text-gray-500 text-center py-8">No recent activity yet.</div>
          </div>
        </div>
      </main>
    </div>
  );
} 