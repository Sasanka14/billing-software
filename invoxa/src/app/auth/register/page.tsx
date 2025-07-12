"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/"), 1200);
      setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left Panel */}
        <div className="md:w-1/2 flex flex-col justify-center items-center p-8 bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-500 text-white relative">
          <div className="z-10">
            <h2 className="text-3xl font-bold mb-4">Join Invoxa</h2>
            <p className="mb-8 text-lg opacity-90 max-w-xs">
              Create your account to manage billing, clients, and invoices with ease.
            </p>
          </div>
          <div className="absolute bottom-2 right-4 text-xs opacity-60 z-0">
            Designed by SasankaWrites
          </div>
        </div>
        {/* Right Panel (Form) */}
        <div className="md:w-1/2 w-full flex flex-col justify-center p-8 bg-white">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Register</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M12 18c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4Z"/></svg>
              </span>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border pl-10 pr-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M12 18c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4Z"/></svg>
              </span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border pl-10 pr-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17a5 5 0 0 0 5-5V9a5 5 0 0 0-10 0v3a5 5 0 0 0 5 5Z"/><path d="M17 13V9a5 5 0 0 0-10 0v4"/></svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border pl-10 pr-10 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5.523 0-10-4.477-10-10 0-2.21 3.582-4 8-4 1.657 0 3.156.418 4.41 1.13M1 1l22 22" /><path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" /></svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M2.05 12C3.81 7.61 7.86 4.5 12 4.5c4.14 0 8.19 3.11 9.95 7.5-1.76 4.39-5.81 7.5-9.95 7.5-4.14 0-8.19-3.11-9.95-7.5Z" /></svg>
                )}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17a5 5 0 0 0 5-5V9a5 5 0 0 0-10 0v3a5 5 0 0 0 5 5Z"/><path d="M17 13V9a5 5 0 0 0-10 0v4"/></svg>
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border pl-10 pr-10 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5.523 0-10-4.477-10-10 0-2.21 3.582-4 8-4 1.657 0 3.156.418 4.41 1.13M1 1l22 22" /><path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" /></svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M2.05 12C3.81 7.61 7.86 4.5 12 4.5c4.14 0 8.19 3.11 9.95 7.5-1.76 4.39-5.81 7.5-9.95 7.5-4.14 0-8.19-3.11-9.95-7.5Z" /></svg>
                )}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 text-white py-2 rounded font-semibold shadow-md hover:opacity-90 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
          </form>
          <div className="mt-6 text-center">
            <a href="/" className="text-purple-600 hover:underline">Already have an account? Login</a>
          </div>
        </div>
      </div>
    </div>
  );
} 