"use client";

import { useState } from "react";
import { changePassword } from "@/services/auth";
import { Eye, EyeOff, KeyRound, Lock, CheckCircle, X } from "lucide-react";
import Portal from "@/components/ui/Portal";

interface Props {
  open: boolean;
  onClose: () => void;
}

function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-[#9F2E41]", "bg-orange-400", "bg-[#635E28]", "bg-emerald-500"];

  if (!password) return null;

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= score ? colors[score] : "bg-slate-100"
            }`}
          />
        ))}
      </div>
      <p className={`text-[10px] font-semibold ${score <= 1 ? "text-[#9F2E41]" : score === 2 ? "text-orange-400" : score === 3 ? "text-[#635E28]" : "text-emerald-500"}`}>
        {labels[score]}
      </p>
    </div>
  );
}

function PasswordInput({
  label, value, onChange, placeholder, show, onToggle,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; show: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-300">
          <Lock size={14} />
        </span>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#4693C9]/60 focus:bg-white focus:ring-2 focus:ring-[#4693C9]/15"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-3.5 flex items-center text-slate-300 transition hover:text-slate-500"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [oldPassword, setOldPassword]         = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld]                 = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const [success, setSuccess]                 = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    setError(""); setSuccess(false);
    setShowOld(false); setShowNew(false); setShowConfirm(false);
    onClose();
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword === oldPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.old_password?.[0] ||
        err.response?.data?.detail ||
        "Failed to change password. Please check your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="flex min-h-full items-start justify-center px-4 pb-8 pt-20">
      <div className="animate-slideUp w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#1D437F] to-[#4693C9] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <KeyRound size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none">Change Password</h2>
              <p className="text-[10px] text-blue-200/70 mt-0.5">Update your account security</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-800">Password Updated</p>
                <p className="mt-1 text-sm text-slate-400">Your password has been changed successfully.</p>
              </div>
              <button
                onClick={handleClose}
                className="mt-2 rounded-xl bg-[#1D437F] px-8 py-2.5 text-sm font-bold text-white transition hover:bg-[#4693C9]"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="animate-fadeIn rounded-xl border border-[#9F2E41]/25 bg-[#9F2E41]/8 px-4 py-3 text-xs font-medium text-[#9F2E41]">
                  {error}
                </div>
              )}

              <PasswordInput
                label="Current Password"
                value={oldPassword}
                onChange={setOldPassword}
                placeholder="Enter your current password"
                show={showOld}
                onToggle={() => setShowOld((v) => !v)}
              />

              <div>
                <PasswordInput
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Enter a strong new password"
                  show={showNew}
                  onToggle={() => setShowNew((v) => !v)}
                />
                <StrengthBar password={newPassword} />
              </div>

              <PasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter your new password"
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
              />

              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-[#9F2E41] font-medium">Passwords do not match.</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1D437F] py-2.5 text-sm font-bold text-white transition hover:bg-[#4693C9] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</>
                  ) : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      </div>
    </div>
    </Portal>
  );
}
