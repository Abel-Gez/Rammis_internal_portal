"use client";

import useQuickLinks from "@/hooks/useQuickLinks";

export default function QuickLinks() {
  const links = useQuickLinks();

  if (!links.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-400">
        No quick links available yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-rammisBlue/10 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Quick Links</h2>
          <p className="text-xs text-slate-200">
            Access the internal systems you need with just one click.
          </p>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500">
          {links.length} link{links.length !== 1 && "s"}
        </span>
      </div>

      <div className="max-h-35 grid grid-cols-3 gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 p-1">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col rounded-xl border border-slate-200 bg-white/90 px-3 py-3 text-sm shadow-sm transition hover:border-rammisLightBlue/60 hover:bg-slate-300"
          >
            <p className="font-medium text-slate-800 group-hover:text-rammisBlue">
              {link.name}
            </p>
            {link.description && (
              <p className="mt-0.5 text-xs text-slate-400">
                {link.description}
              </p>
            )}
            <span className="mt-2 text-[11px] font-medium text-rammisLightBlue opacity-0 transition group-hover:opacity-100">
              Open link ↗
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
