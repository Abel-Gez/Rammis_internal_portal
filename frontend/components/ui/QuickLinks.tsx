"use client";

import useQuickLinks from "@/hooks/useQuickLinks";
import { ExternalLink } from "lucide-react";

export default function QuickLinks() {
  const links = useQuickLinks();

  if (!links.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-center text-sm text-blue-200/50">
        No quick links configured yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-0.5">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="group relative flex flex-col rounded-xl border border-white/10 bg-white/8 px-3 py-2.5 transition-all duration-200 hover:bg-white/20 hover:border-white/25 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#4693C9] to-[#635E28] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between gap-1">
            <p className="text-xs font-semibold text-white leading-snug line-clamp-1">
              {link.name}
            </p>
            <ExternalLink
              size={10}
              className="shrink-0 mt-0.5 text-white/30 group-hover:text-white/70 transition-colors"
            />
          </div>
          {link.description && (
            <p className="mt-0.5 text-[10px] text-blue-200/50 line-clamp-1">
              {link.description}
            </p>
          )}
        </a>
      ))}
    </div>
  );
}
