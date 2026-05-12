"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { usePathname } from "next/navigation";
import { logout } from "@/services/auth";
import Link from "next/link";
import {
  Search,
  Bell,
  ChevronDown,
  UserCircle,
  KeyRound,
  LogOut,
} from "lucide-react";
import ChangePasswordModal from "@/components/ChangePasswordModal";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Welcome back — here's what's happening today." },
  "/documents": { title: "Documents", subtitle: "Browse and manage internal documents." },
  "/reports": { title: "Reports", subtitle: "View and download analytical reports." },
  "/news": { title: "News", subtitle: "Stay up to date with the latest announcements." },
  "/vacancies": { title: "Vacancies", subtitle: "Explore open positions across the bank." },
  "/profile": { title: "My Profile", subtitle: "Manage your account and preferences." },
};

export default function Topbar() {
  const user = useUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const page = pageTitles[pathname] ?? { title: "Portal", subtitle: "Rammis Internal Portal" };
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "RU";

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 py-3 backdrop-blur-xl shadow-sm">
        {/* Page title */}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-base font-bold text-[#1D437F] tracking-tight leading-tight">
            {page.title}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">{page.subtitle}</p>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <label className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 transition-all focus-within:border-[#4693C9]/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4693C9]/20 cursor-text">
            <Search size={13} className="shrink-0 text-slate-400" />
            <input
              placeholder="Search portal..."
              className="w-44 bg-transparent text-xs outline-none placeholder:text-slate-400 text-slate-700"
            />
          </label>

          {/* Notifications */}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#4693C9]/50 hover:text-[#1D437F]">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#9F2E41] shadow-sm ring-1 ring-white" />
          </button>

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2.5 rounded-full border border-[#1D437F]/20 bg-[#1D437F] pl-1 pr-3 py-1 text-xs font-medium text-white shadow-md transition hover:bg-[#4693C9]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold">
                {initials}
              </span>
              <span className="hidden sm:inline max-w-[80px] truncate">{user?.username || "Profile"}</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div className="animate-fadeIn absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden z-50">
                <div className="bg-gradient-to-r from-[#1D437F] to-[#4693C9] px-4 py-3">
                  <p className="text-[10px] text-blue-200 uppercase tracking-widest">Signed in as</p>
                  <p className="font-semibold text-white text-sm truncate">{user?.username}</p>
                  <p className="text-[10px] text-blue-200 capitalize">{user?.role || "Staff"}</p>
                </div>

                <div className="py-1.5">
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <UserCircle size={15} className="text-[#4693C9]" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => { setOpen(false); setShowPasswordModal(true); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <KeyRound size={15} className="text-[#635E28]" />
                    Change Password
                  </button>
                  <div className="my-1 h-px bg-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#9F2E41] hover:bg-red-50 transition"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ChangePasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </>
  );
}
