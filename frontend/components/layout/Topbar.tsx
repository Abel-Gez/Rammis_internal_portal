"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { logout } from "@/services/auth";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import ChangePasswordModal from "@/components/ChangePasswordModal";

export default function Topbar() {
  const user = useUser();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // ✅ CLOSE DROPDOWN ON OUTSIDE CLICK
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ LOGOUT HANDLER
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-1000 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur-3xl">
        {/* LEFT */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black">
            Rammis Internal Portal
          </span>
          <span className="text-sm text-slate-800">
            Secure access to documents, reports, news & vacancies.
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* SEARCH */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500 focus-within:ring-2 focus-within:ring-rammisLightBlue">
            <span className="text-xs text-slate-400">🔍</span>
            <input
              placeholder="Search across portal..."
              className="w-52 bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
          </div>

          {/* NOTIFICATIONS */}
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-rammisLightBlue/60 hover:text-rammisBlue">
            🔔
          </button>

          {/* PROFILE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 rounded-full bg-rammisBlue px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-rammisLightBlue"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold">
                {user?.username
                  ? user.username.slice(0, 2).toUpperCase()
                  : "RU"}
              </span>

              <span className="hidden sm:inline">
                {user?.username || "Profile"}
              </span>

              {/* ✅ DROPDOWN ICON */}
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* DROPDOWN MENU */}
            {open && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                <div className="px-4 py-2 border-b text-xs text-slate-500">
                  Signed in as
                  <div className="font-medium text-slate-800">
                    {user?.username}
                  </div>
                </div>

                <div className="py-1 text-sm">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-slate-100"
                    onClick={() => setOpen(false)}
                  >
                    👤 Profile
                  </Link>

                  <button
                    onClick={() => {
                      setOpen(false);
                      setShowPasswordModal(true);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-slate-100"
                  >
                    🔐 Change Password
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
