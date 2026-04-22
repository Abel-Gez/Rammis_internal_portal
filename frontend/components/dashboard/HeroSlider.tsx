"use client";

import { getHeroSlides } from "@/services/hero";
import { useEffect, useState } from "react";

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await getHeroSlides();

        const list = Array.isArray(data) ? data : data.results || [];

        setSlides(list);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setCurrent((prev) => (prev + 1) % slides.length),
      7000,
    );
    return () => clearInterval(id);
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative w-full lg:flex-1 overflow-hidden rounded-3xl border border-slate-200/50 h-64 lg:h-80 shadow-2xl">
      {/* Image container - always full width */}
      <div
        className="absolute inset-0 flex h-full w-full transition-transform duration-700 ease-out"
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {slides.map((slide) => (
          <div
            key={slide.src}
            className="relative flex h-full w-full flex-shrink-0"
            style={{
              backgroundImage: `url('${slide.src}')`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-slate-900/60" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rammisGold/90">
                  Internal Portal
                </p>
                <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white">
                  {slide.title}
                </h1>
                <p className="mt-2 max-w-sm sm:max-w-xl text-sm lg:text-base text-slate-100/90">
                  {slide.subtitle}
                </p>
              </div>
              <p className="text-xs text-slate-300/90">Today • {today}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Brand accent bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rammisBlue via-rammisLightBlue to-rammisGold" />

      {/* Dots navigation */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => {
          const isActive = index === current;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setCurrent(index)}
              className={`
                h-1.5 rounded-full transition-all
                ${isActive ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}
              `}
            />
          );
        })}
      </div>
    </div>
  );
}
