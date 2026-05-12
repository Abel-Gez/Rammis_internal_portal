"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import {
  UserCircle,
  Mail,
  Briefcase,
  Building,
  ShieldCheck,
  KeyRound,
  AtSign,
  BadgeCheck,
} from "lucide-react";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5 transition hover:bg-slate-50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1D437F]/8">
        <Icon size={16} className="text-[#1D437F]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-800 break-words">
          {value || <span className="text-slate-300 font-normal">Not set</span>}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const user = useUser();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (user === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-[#4693C9] border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-400">Not logged in.</p>
      </div>
    );
  }

  const displayName = user.full_name || user.username || "Staff Member";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl">

      {/* ── Hero card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1D437F] via-[#1a3a6e] to-[#4693C9] p-6 shadow-xl">
        {/* Dot-grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow orb */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-[#4693C9]/30 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 border border-white/20 text-2xl font-extrabold text-white shadow-lg backdrop-blur-sm">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">{displayName}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/80">
                <BadgeCheck size={10} /> Verified Staff
              </span>
            </div>
            <p className="mt-1 text-sm text-blue-200/70 capitalize">{user.role || "Staff Member"}</p>
            {user.department && (
              <p className="text-xs text-blue-200/50 mt-0.5">{user.department}</p>
            )}
          </div>

          {/* Change password shortcut */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-white/12 border border-white/20 px-4 py-2.5 text-xs font-bold text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
          >
            <KeyRound size={14} /> Change Password
          </button>
        </div>
      </div>

      {/* ── Profile details ── */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <UserCircle size={16} className="text-[#1D437F]" />
          <h2 className="text-sm font-bold text-slate-800">Profile Information</h2>
          <div className="flex-1 h-px bg-slate-100 ml-1" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow icon={AtSign}    label="Username"   value={user.username} />
          <InfoRow icon={UserCircle}label="Full Name"  value={user.full_name} />
          <InfoRow icon={Mail}      label="Email"      value={user.email} />
          <InfoRow icon={Briefcase} label="Role"       value={user.role} />
          <InfoRow icon={Building}  label="Department" value={user.department} />
        </div>
      </div>

      {/* ── Security section ── */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#1D437F]" />
          <h2 className="text-sm font-bold text-slate-800">Security</h2>
          <div className="flex-1 h-px bg-slate-100 ml-1" />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#635E28]/8">
              <KeyRound size={16} className="text-[#635E28]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Password</p>
              <p className="text-xs text-slate-400">Last changed: unknown · Keep your account secure</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#1D437F] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#4693C9]"
          >
            <KeyRound size={12} /> Update
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-400 leading-relaxed">
          Use a strong password with at least 8 characters, including uppercase letters, numbers and special characters. Do not share your credentials with anyone.
        </p>
      </div>

      {/* ── Change Password Modal ── */}
      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
