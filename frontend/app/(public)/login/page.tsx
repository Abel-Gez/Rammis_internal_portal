"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth";
import Link from "next/link";
import { Building2, Eye, EyeOff, ArrowLeft, Lock, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#060f1e]">

      {/* ── Left branding panel (desktop only) ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-[#0a1f3f] via-[#1D437F] to-[#4693C9] p-12 overflow-hidden">

        {/* Step 4: Islamic geometric pattern replacing the plain dot-grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 pattern-dark"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 50%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 50%)",
          }}
        />
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#4693C9]/25 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-[#1D437F]/40 blur-[100px]" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="h-12 w-auto overflow-hidden rounded-xl bg-white/95 shadow-lg">
            <img src="/logo.png" alt="Rammis Bank" className="h-full w-auto object-contain" />
          </div>
        </div>

        {/* Hero text */}
        <div className="relative flex flex-col gap-6 max-w-md">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-[#4693C9]" />
            ))}
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Secure access to everything your team needs.
          </h2>
          <p className="text-sm text-white/50 leading-relaxed">
            Documents, reports, announcements, and career opportunities — all in one centralised, permission-controlled portal.
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {["Documents", "Reports", "News", "Vacancies", "Analytics"].map((f) => (
              <span
                key={f}
                className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-medium text-white/55"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-white/20">
          © {new Date().getFullYear()} Rammis Bank. Authorised access only.
        </p>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">

        {/* Back link */}
        <div className="mb-8 w-full max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/30 transition hover:text-white/60"
          >
            <ArrowLeft size={13} /> Back to welcome
          </Link>
        </div>

        {/* Mobile logo */}
        <div className="mb-8 flex items-center justify-center lg:hidden">
          <div className="h-10 w-auto overflow-hidden rounded-xl bg-white/95 shadow-lg">
            <img src="/logo.png" alt="Rammis Bank" className="h-full w-auto object-contain" />
          </div>
        </div>

        {/* Form card */}
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-white/40">
              Sign in to access the Rammis Bank staff portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Error banner */}
            {error && (
              <div className="animate-fadeIn rounded-xl border border-[#9F2E41]/30 bg-[#9F2E41]/10 px-4 py-3 text-xs font-medium text-[#e05070]">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                Username
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-white/25">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                  className="w-full rounded-xl border border-white/10 bg-white/6 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-[#4693C9]/60 focus:bg-white/8 focus:ring-2 focus:ring-[#4693C9]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-white/25">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/10 bg-white/6 py-3 pl-10 pr-11 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-[#4693C9]/60 focus:bg-white/8 focus:ring-2 focus:ring-[#4693C9]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-white/25 transition hover:text-white/60"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D437F] py-3.5 text-sm font-bold text-white shadow-xl transition hover:bg-[#4693C9] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-white/18 leading-relaxed">
            Having trouble signing in?
            <br />Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
