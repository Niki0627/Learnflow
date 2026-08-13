"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(username, password);
    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error || "Sign in failed. Please check your credentials.");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/50 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-10 flex items-center justify-center gap-3 outline-none">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 text-white">
            <GraduationCap size={22} strokeWidth={2.3} />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            <span className="text-violet-600">Learn</span>Flow
          </span>
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <h1 className="mb-2 text-3xl font-black text-slate-900">Welcome back</h1>
          <p className="mb-8 text-base text-slate-500">Sign in to continue your learning flow.</p>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => router.push("/google-login")}
            className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.69 0 3.21.6 4.4 1.58l3.28-3.28A11.94 11.94 0 0 0 12 .9C8.17.9 4.83 2.85 2.96 5.82l2.31 3.94Z"/><path fill="#34A853" d="M16.04 18.01A7.08 7.08 0 0 1 12 19.1c-2.9 0-5.38-1.74-6.56-4.26l-3.3 2.55C4.1 21 7.78 23.1 12 23.1c2.97 0 5.7-1.04 7.78-2.74l-3.74-2.35Z"/><path fill="#FBBC05" d="M19.78 20.36C21.86 18.38 23.1 15.42 23.1 12c0-.88-.1-1.73-.27-2.55H12v4.82h6.24a5.4 5.4 0 0 1-2.22 3.55l3.76 2.54Z"/><path fill="#4285F4" d="M5.44 14.84A7.15 7.15 0 0 1 4.9 12c0-.99.17-1.94.47-2.83L3.06 5.23A11.93 11.93 0 0 0 .9 12c0 1.96.47 3.8 1.3 5.43l3.24-2.59Z"/></svg>
            Continue with Google
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold text-slate-400">or continue with email</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Email</label>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 pr-12 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-violet-500/30 transition hover:scale-[1.02] hover:shadow-violet-500/40 active:scale-[0.98] disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-black text-violet-600 hover:text-violet-700 transition">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
