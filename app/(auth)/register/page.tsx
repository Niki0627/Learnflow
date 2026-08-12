"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "@context/AuthContext";

function Field({
  label,
  invalid,
  type = "text",
  showToggle,
  onToggle,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  invalid?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={type}
          {...props}
          className={`h-12 w-full rounded-xl border bg-slate-50/50 px-4 ${showToggle ? "pr-12" : ""} text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-violet-500/20 ${
            invalid
              ? "border-red-300 focus:border-red-500"
              : "border-slate-200 focus:border-violet-500 focus:bg-white"
          }`}
          placeholder={type === "password" ? "••••••••" : ""}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {type === "password" ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>
      {invalid && <p className="mt-1.5 text-xs font-semibold text-red-500">Passwords must match.</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const passwordsMatch = useMemo(
    () => formData.password.length === 0 || formData.password === formData.password2,
    [formData.password, formData.password2],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((curr) => ({ ...curr, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const result = await register(formData);
    if (result.success) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    let msg = "Registration failed. Please try again.";
    if (typeof result.error === "string") msg = result.error;
    else if (result.error && typeof result.error === "object") {
      const vals = Object.values(result.error).flat();
      if (vals.length > 0) msg = String(vals[0]);
    }
    setError(msg);
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/50 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <Link href="/" className="mb-10 flex items-center justify-center gap-3 outline-none">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 text-white">
            <GraduationCap size={22} strokeWidth={2.3} />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            <span className="text-violet-600">Learn</span>Flow
          </span>
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <h1 className="mb-2 text-3xl font-black text-slate-900">Create your account</h1>
          <p className="mb-8 text-base text-slate-500">Set up your learning workspace in under a minute.</p>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Jane" />
              <Field label="Last name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Smith" />
            </div>
            <Field label="Username" name="username" value={formData.username} onChange={handleChange} autoComplete="username" required placeholder="janestudent" />
            <Field label="Email" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" required placeholder="you@example.com" />
            <Field
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              showToggle
              onToggle={() => setShowPassword(!showPassword)}
            />
            <Field
              label="Confirm password"
              name="password2"
              type="password"
              value={formData.password2}
              onChange={handleChange}
              autoComplete="new-password"
              required
              invalid={!passwordsMatch}
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">Password tips</p>
              <div className="space-y-2">
                {["At least 8 characters", "Mix of letters and numbers", "Both password fields must match"].map((r) => (
                  <div key={r} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <CheckCircle2 size={13} className="shrink-0 text-emerald-500" /> {r}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-violet-500/30 transition hover:scale-[1.02] hover:shadow-violet-500/40 active:scale-[0.98] disabled:opacity-60 disabled:scale-100 mt-2"
            >
              {loading ? "Creating account..." : <>Create account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-black text-violet-600 hover:text-violet-700 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
