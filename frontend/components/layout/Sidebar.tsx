"use client";

import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Newspaper,
  Briefcase,
  UserCircle,
  Building2,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/vacancies", label: "Vacancies", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useUser();

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "RU";

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col bg-[#1D437F] text-slate-100 relative overflow-hidden">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-24 -right-10 h-40 w-40 rounded-full bg-[#4693C9]/20 blur-3xl" />

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md">
          <Building2 size={20} className="text-[#1D437F]" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-white leading-tight">Rammis Bank</p>
          <p className="text-[10px] text-blue-200/70 tracking-widest uppercase">Internal Portal</p>
        </div>
      </div>

      {/* Logo image slot (if /logo.png exists) */}
      <div className="mx-4 mt-3 hidden">
        <div className="h-10 w-full overflow-hidden rounded-xl bg-white/95 shadow-sm">
          <img src="/logo.png" alt="Rammis Bank" className="h-full w-full object-contain" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex flex-1 flex-col gap-0.5 px-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300/60">
          Navigation
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${active
                  ? "bg-white text-[#1D437F] shadow-md"
                  : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#4693C9]" />
              )}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors
                  ${active
                    ? "bg-[#1D437F]/10 text-[#1D437F]"
                    : "bg-white/8 text-blue-200 group-hover:bg-white/15 group-hover:text-white"
                  }`}
              >
                <Icon size={16} />
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {active && <ChevronRight size={14} className="shrink-0 text-[#4693C9]" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user card */}
      <div className="mx-3 mb-4 rounded-xl bg-white/8 border border-white/10 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4693C9] text-[11px] font-bold text-white shadow-sm animate-pulse-ring">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {user?.username || "Rammis User"}
            </p>
            <p className="text-[10px] text-blue-300/70 capitalize">
              {user?.role || "Staff Portal"}
            </p>
          </div>
          <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" title="Online" />
        </div>
        <p className="mt-2 text-[10px] text-blue-300/40 text-center">
          © {new Date().getFullYear()} Rammis Bank
        </p>
      </div>
    </aside>
  );
}
