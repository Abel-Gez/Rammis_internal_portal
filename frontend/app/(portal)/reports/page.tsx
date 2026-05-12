"use client";

import useAuthGuard from "@/hooks/useAuthGuard";

export default function ReportsPage() {
  useAuthGuard("reports.view");

  return (
    <div className="flex h-full items-center justify-center py-20">
      <p className="text-sm text-slate-400">Reports — coming soon.</p>
    </div>
  );
}
