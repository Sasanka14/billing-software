"use client";
import { useState, useEffect } from "react";

interface HeaderProps {
  children: React.ReactNode;
}

interface User {
  name: string;
  email: string;
  profileImage?: string;
}

export default function Header({ children }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch("/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-500 text-white flex flex-col py-8 px-4 min-h-screen shadow-2xl hidden md:flex">
        <div className="mb-10 text-2xl font-bold tracking-wide text-center">Invoxa</div>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li><a href="/dashboard" className="block px-4 py-2 rounded bg-white/10 font-semibold">Dashboard</a></li>
            <li><a href="/invoices" className="block px-4 py-2 rounded hover:bg-white/10 transition font-medium">Invoices</a></li>
            <li><a href="/clients" className="block px-4 py-2 rounded hover:bg-white/10 transition font-medium">Clients</a></li>
            <li><a href="/settings" className="block px-4 py-2 rounded hover:bg-white/10 transition font-medium">Settings</a></li>
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-8 w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded transition"
        >
          Logout
        </button>
      </aside>
      {/* Main area with header and content */}
      <div className="flex-1 flex flex-col">
        {/* Fixed Header */}
        <header className="sticky top-0 z-30 w-full h-16 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <span className="text-sm font-mono font-semibold text-gray-700">v0.1</span>
          <div className="flex items-center gap-3">
            {!loading && user && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="hidden sm:block">{user.name}</span>
              </div>
            )}
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-500 overflow-hidden">
              {!loading && user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
} 