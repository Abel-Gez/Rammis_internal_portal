"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import Portal from "./Portal";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const maxW = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" }[size];

  return (
    <Portal>
      {/* Renders into document.body — no CSS stacking context can contain it */}
      <div
        className="fixed inset-0 z-[9999] overflow-y-auto bg-black/50 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="flex min-h-full items-start justify-center px-4 pb-12 pt-20"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <div
            className={`w-full ${maxW} rounded-2xl bg-white shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-[#1D437F] to-[#4693C9] px-6 py-4">
              <div className="min-w-0">
                {title && <h2 className="text-base font-bold text-white leading-tight truncate">{title}</h2>}
                {subtitle && <p className="text-xs text-blue-200/70 mt-0.5">{subtitle}</p>}
              </div>
              <button onClick={onClose}
                className="ml-4 shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white">
                <X size={15} />
              </button>
            </div>

            {/* Body — no height constraints; overlay scrolls for tall forms */}
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
