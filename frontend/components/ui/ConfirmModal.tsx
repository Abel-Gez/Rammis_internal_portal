"use client";

import { Trash2 } from "lucide-react";
import Portal from "./Portal";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  title = "Confirm Delete",
  message = "This action cannot be undone. Are you sure?",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      >
        <div className="animate-slideUp w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#9F2E41]/10">
            <Trash2 size={22} className="text-[#9F2E41]" />
          </div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <p className="mt-1.5 text-sm text-slate-400">{message}</p>
          <div className="mt-6 flex gap-3">
            <button onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#9F2E41] py-2.5 text-sm font-bold text-white transition hover:bg-[#b8354a] disabled:opacity-60">
              {loading
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <Trash2 size={14} />}
              {loading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
