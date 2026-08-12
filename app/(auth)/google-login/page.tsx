"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@utils/supabase/client";
import { GraduationCap, ShieldCheck } from "lucide-react";

const getOAuthRedirectUrl = (): string => {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const appUrl = configuredUrl || window.location.origin;
  return `${appUrl.replace(/\/$/, "")}/auth/callback?next=/dashboard`;
};

export default function GoogleLoginPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      startGoogleLogin();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const startGoogleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getOAuthRedirectUrl() },
    });
    if (error) console.error("OAuth error:", error);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/50 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-indigo-600" />

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-600">
          <GraduationCap size={32} strokeWidth={2.5} />
        </div>

        <h1 className="mb-1 text-2xl font-black text-slate-900">LearnFlow</h1>
        <p className="mb-8 text-sm font-medium text-slate-500">Secure Login Integration</p>

        <div className="relative mx-auto mb-8 flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-100 border-t-violet-600" />
          <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.69 0 3.21.6 4.4 1.58l3.28-3.28A11.94 11.94 0 0 0 12 .9C8.17.9 4.83 2.85 2.96 5.82l2.31 3.94Z"/><path fill="#34A853" d="M16.04 18.01A7.08 7.08 0 0 1 12 19.1c-2.9 0-5.38-1.74-6.56-4.26l-3.3 2.55C4.1 21 7.78 23.1 12 23.1c2.97 0 5.7-1.04 7.78-2.74l-3.74-2.35Z"/><path fill="#FBBC05" d="M19.78 20.36C21.86 18.38 23.1 15.42 23.1 12c0-.88-.1-1.73-.27-2.55H12v4.82h6.24a5.4 5.4 0 0 1-2.22 3.55l3.76 2.54Z"/><path fill="#4285F4" d="M5.44 14.84A7.15 7.15 0 0 1 4.9 12c0-.99.17-1.94.47-2.83L3.06 5.23A11.93 11.93 0 0 0 .9 12c0 1.96.47 3.8 1.3 5.43l3.24-2.59Z"/></svg>
        </div>

        <h2 className="mb-2 text-lg font-bold text-slate-900">Connecting to Google</h2>
        <p className="mb-8 text-sm text-slate-500">You will be redirected to the secure login page momentarily...</p>

        <div className="space-y-3">
          <button
            onClick={startGoogleLogin}
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Continue Manually
          </button>
          <button
            onClick={() => router.push("/login")}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
          >
            Cancel and return to login
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-1.5 text-slate-400">
          <ShieldCheck size={14} />
          <span className="text-xs font-semibold">256-bit Secure Encryption</span>
        </div>
      </div>
    </div>
  );
}
