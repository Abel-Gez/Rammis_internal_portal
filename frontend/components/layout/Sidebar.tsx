"use client";

import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { permission } from "process";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "🏠",
    permission: "dashboard.view",
  },
  { href: "/documents", label: "Documents", icon: "📁" },
  { href: "/reports", label: "Reports", icon: "📊" },
  { href: "/news", label: "News", icon: "📰" },
  { href: "/vacancies", label: "Vacancies", icon: "📌" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useUser();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-slate-800/30 bg-gradient-to-b from-sidebarBg via-[#16325f] to-rammisBlue text-slate-100">
      {/* Brand / logo */}
      <div className="flex items-center justify-center px-6 py-5">
        <div className="h-12 w-44 overflow-hidden rounded-xl bg-white/95 shadow-sm">
          <img
            src="/logo.png"
            alt="Rammis Bank"
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400/80">
          Main
        </p>
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition
                ${
                  active
                    ? "bg-white text-rammisBlue shadow-sm"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-base transition
                  ${
                    active
                      ? "bg-rammisLightBlue/10 text-rammisBlue"
                      : "bg-white/5 text-slate-200 group-hover:bg-white/10"
                  }`}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom user / info */}
      <div className="border-t border-white/5 px-4 pb-4 pt-3 text-xs text-slate-300">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-[11px] font-semibold text-white">
            {user?.username ? user.username.slice(0, 2).toUpperCase() : "RU"}
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-[11px] font-medium truncate max-w-[100px]">
              {user?.username || "Rammis User"}
            </p>
            <p className="text-[10px] text-slate-400 capitalize">
              {user?.role || "Staff Portal"}
            </p>
          </div>
        </div>
        <p className="text-[10px] text-slate-500">
          © {new Date().getFullYear()} Rammis Bank
        </p>
      </div>
    </aside>
  );
}
