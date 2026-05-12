"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function HeroSlider({ slides }: { slides: any[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length;

  const next = useCallback(() => setCurrent((p) => (p + 1) % count), [count]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [paused, next, count]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (count === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl h-72 lg:h-96 bg-gradient-to-br from-[#1D437F] to-[#4693C9] flex items-center justify-center">
        <div className="text-center text-white/60">
          <p className="text-sm">No slides configured</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl h-72 lg:h-96 shadow-2xl group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Brand accent bar */}
      <div className="absolute inset-x-0 top-0 h-1 z-20 bg-gradient-to-r from-[#1D437F] via-[#4693C9] to-[#635E28]" />

      {/* Slides track */}
      <div
        className="absolute inset-0 flex h-full transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id ?? i}
            className="relative flex h-full w-full shrink-0"
            style={{
              backgroundImage: slide.image ? `url(${slide.image})` : slide.src ? `url(${slide.src})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: slide.image || slide.src ? undefined : "#1D437F",
            }}
          >
            {/* Layered gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f3f]/85 via-[#1D437F]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-end p-7 sm:p-10">
              <div className="max-w-xl animate-fadeIn">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4693C9]/40 bg-[#4693C9]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#93c5fd] mb-3 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4693C9] animate-pulse" />
                  Rammis Internal Portal
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight drop-shadow-lg">
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p className="mt-2 text-sm lg:text-base text-slate-200/85 leading-relaxed line-clamp-2">
                    {slide.subtitle}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-300/70">
                  <Calendar size={11} />
                  <span>{today}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      {count > 1 && (
        <div className="absolute top-5 right-5 z-20 rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm border border-white/10">
          {current + 1} / {count}
        </div>
      )}
    </div>
  );
}
