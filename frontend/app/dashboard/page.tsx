"use client";

import QuickLinks from "@/components/ui/QuickLinks";
import useAuthGuard from "@/hooks/useAuthGuard";
import useDashboard from "@/hooks/useDashboard";
import { use } from "react";
import HeroSlider from "@/components/dashboard/HeroSlider";

const statsConfig = [
  {
    key: "reports",
    label: "Reports",
    accent: "from-rammisBlue to-rammisLightBlue",
  },
  {
    key: "documents",
    label: "Documents",
    accent: "from-rammisLightBlue to-rammisBlue",
  },
  { key: "news", label: "News", accent: "from-rammisBlue to-rammisGold" },
  {
    key: "vacancies",
    label: "Vacancies",
    accent: "from-rammisGold to-rammisBlue",
  },
];

export default function DashboardPage() {
  const user = useAuthGuard("view_dashboard");
  const data = useDashboard();

  if (!user || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-500">Loading your dashboard...</p>
      </div>
    );
  }

  const {
    totals,
    latest_reports,
    latest_documents,
    latest_news,
    active_vacancies,
  } = data;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-8 p-6">
      {/* Top section: FULL WIDTH background image */}
      <section className="relative flex flex-col gap-6 lg:flex-row lg:gap-8 lg:items-start">
        {/* LEFT: Hero slider */}
        <HeroSlider />

        {/* RIGHT: QuickLinks */}
        <div className="w-full lg:w-auto lg:max-w-md self-end lg:ml-auto">
          <div className="rounded-2xl border border-slate-200 bg-rammisBlue/90 p-4 shadow-sm backdrop-blur w-full">
            <h2 className="mb-2 text-lg font-semibold uppercase tracking-[0.18em] text-white">
              Quick actions
            </h2>
            <QuickLinks />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
          At a glance
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statsConfig.map((stat) => (
            <StatCard
              key={stat.key}
              label={stat.label}
              value={totals[stat.key]}
              accent={stat.accent}
            />
          ))}
        </div>
      </section>

      {/* Latest content */}
      <section className="grid gap-6 lg:grid-cols-2">
        <ContentList
          title="Latest Reports"
          items={latest_reports}
          badgeColor="bg-rammisBlue/10 text-rammisBlue"
        />
        <ContentList
          title="Latest Documents"
          items={latest_documents}
          badgeColor="bg-rammisLightBlue/10 text-rammisLightBlue"
        />
        <ContentList
          title="Latest News"
          items={latest_news}
          badgeColor="bg-rammisGold/10 text-rammisGold"
        />
        <ContentList
          title="Active Vacancies"
          items={active_vacancies}
          badgeColor="bg-rammisRed/10 text-rammisRed"
        />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-cardBg/90 p-4 shadow-sm">
      {/* Accent bar */}
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`}
      />
      <div className="mt-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-xs font-semibold text-slate-400">
          Total
        </div>
      </div>
    </div>
  );
}

function ContentList({
  title,
  items,
  badgeColor,
}: {
  title: string;
  items: any[];
  badgeColor: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-cardBg/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeColor}`}
        >
          {items.length} item{items.length !== 1 && "s"}
        </span>
      </div>
      <ul className="flex-1 space-y-2">
        {items.length === 0 && (
          <li className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
            No data available yet.
          </li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            className="group flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm text-slate-700 transition hover:border-rammisLightBlue/40 hover:bg-slate-50"
          >
            <div className="flex flex-col">
              <span className="line-clamp-1 font-medium">{item.title}</span>
              {item.created_at && (
                <span className="mt-0.5 text-xs text-slate-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <span className="ml-3 text-xs text-rammisLightBlue opacity-0 transition group-hover:opacity-100">
              View
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
