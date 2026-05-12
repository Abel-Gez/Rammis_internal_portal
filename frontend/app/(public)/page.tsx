"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, ArrowRight, ArrowDown,
  Building2, Newspaper, Briefcase, FileText,
  Calendar, MapPin, Clock, Eye, X, Lock,
} from "lucide-react";
import {
  getPublicSlides, getPublicNews,
  getPublicVacancies, getPublicDocuments,
} from "@/services/public";

// ── Intersection-observer hook for scroll-in animations ───────────────────
function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Full-screen Hero Slider ───────────────────────────────────────────────
function FullScreenSlider({ slides }: { slides: any[] }) {
  const [current, setCurrent] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const count = slides.length;

  const goTo = useCallback((idx: number) => {
    if (transitioning || idx === current) return;
    setTransitioning(true);
    setPrevIdx(current);
    setCurrent(idx);
    setTimeout(() => { setTransitioning(false); setPrevIdx(null); }, 900);
  }, [transitioning, current]);

  const next = useCallback(() => goTo((current + 1) % count), [current, count, goTo]);
  const prev = useCallback(() => goTo((current - 1 + count) % count), [current, count, goTo]);

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, [next, count]);

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  if (count === 0) {
    return (
      <div className="relative h-screen w-full bg-gradient-to-br from-[#060f1e] via-[#1D437F] to-[#4693C9] flex items-center justify-center">
        <div className="text-center space-y-4 animate-fadeIn">
          <Building2 size={64} className="mx-auto text-white/30" />
          <p className="text-white/40 tracking-widest uppercase text-sm">Rammis Bank Internal Portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#060f1e]">

      {/* Slide layers */}
      {slides.map((s, i) => {
        const isActive = i === current;
        const isPrev   = i === prevIdx;
        return (
          <div key={s.id ?? i}
            className="absolute inset-0 transition-opacity duration-900 ease-in-out"
            style={{ opacity: isActive ? 1 : isPrev ? 0 : 0, zIndex: isActive ? 2 : isPrev ? 1 : 0 }}>
            {s.image ? (
              <img src={s.image} alt={s.title}
                className="h-full w-full object-cover"
                style={{ transform: isActive ? "scale(1.04)" : "scale(1)", transition: "transform 7s ease-out" }} />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#0a1f3f] via-[#1D437F] to-[#4693C9]" />
            )}
            {/* Deep cinematic gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          </div>
        );
      })}

      {/* Accent bar top */}
      <div className="absolute inset-x-0 top-0 h-[3px] z-20 bg-gradient-to-r from-[#1D437F] via-[#4693C9] to-[#635E28]" />

      {/* Centered slide content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
        {slides.map((s, i) => (
          <div key={s.id ?? i}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-all duration-700"
            style={{ opacity: i === current ? 1 : 0, transform: i === current ? "translateY(0)" : "translateY(12px)", pointerEvents: i === current ? "auto" : "none" }}>

            {/* Tag */}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white/70 backdrop-blur-sm mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4693C9] animate-pulse" />
              Rammis Bank · Public Notice
            </span>

            {/* Main title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight max-w-4xl drop-shadow-2xl">
              {s.title}
            </h1>

            {/* Subtitle */}
            {s.subtitle && (
              <p className="mt-6 text-base sm:text-lg text-white/60 max-w-2xl leading-relaxed font-light">
                {s.subtitle}
              </p>
            )}

            {/* CTA */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/login"
                className="flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#1D437F] shadow-2xl transition hover:bg-[#4693C9] hover:text-white hover:scale-105">
                Staff Login <ArrowRight size={15} />
              </Link>
              <button onClick={scrollDown}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-medium text-white/70 backdrop-blur-sm transition hover:bg-white/12 hover:text-white">
                Explore News <ArrowDown size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      {count > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-5 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/25 text-white border border-white/12 backdrop-blur-sm transition hover:bg-black/50 hover:scale-110">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next}
            className="absolute right-5 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/25 text-white border border-white/12 backdrop-blur-sm transition hover:bg-black/50 hover:scale-110">
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-500 ${i === current ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/30 hover:bg-white/60"}`} />
          ))}
        </div>
      )}

      {/* Slide counter */}
      {count > 1 && (
        <p className="absolute bottom-20 right-6 z-20 text-[11px] font-semibold tabular-nums text-white/25">
          {String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </p>
      )}

      {/* Scroll-down nudge */}
      <button onClick={scrollDown}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-white/35 hover:text-white/70 transition group">
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Scroll</span>
        <ArrowDown size={16} className="animate-bounce" />
      </button>
    </div>
  );
}

// ── News card ─────────────────────────────────────────────────────────────
function NewsCard({ item, onView }: { item: any; onView: (n: any) => void }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] transition duration-300 hover:border-[#4693C9]/30 hover:bg-white/8 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30">
      <div className="relative overflow-hidden h-44 shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#1D437F]/40 to-[#4693C9]/15 flex items-center justify-center">
            <Newspaper size={32} className="text-[#4693C9]/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {item.published_date && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[10px] font-semibold text-white/80 backdrop-blur-sm">
            <Calendar size={9} />
            {new Date(item.published_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 gap-2.5">
        <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">{item.title}</h3>
        {item.content && (
          <p className="text-xs text-white/40 line-clamp-3 leading-relaxed flex-1">{item.content}</p>
        )}
        <button onClick={() => onView(item)}
          className="mt-1 flex w-fit items-center gap-1.5 text-xs font-bold text-[#4693C9] transition hover:text-white hover:gap-2.5">
          <Eye size={12} /> Read more
        </button>
      </div>
    </article>
  );
}

// ── Vacancy card ──────────────────────────────────────────────────────────
function VacancyCard({ item }: { item: any }) {
  const daysLeft = item.application_deadline
    ? Math.ceil((new Date(item.application_deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="group flex flex-col gap-3.5 rounded-2xl border border-white/8 bg-white/[0.04] p-5 transition duration-300 hover:border-[#4693C9]/30 hover:bg-white/8 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30">
      <div>
        <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">{item.title}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.employment_type_name && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#4693C9]/15 border border-[#4693C9]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#4693C9]">
              <Clock size={9} /> {item.employment_type_name}
            </span>
          )}
          {item.location && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/6 border border-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/50">
              <MapPin size={9} /> {item.location}
            </span>
          )}
        </div>
      </div>
      {item.description && (
        <p className="text-xs text-white/38 line-clamp-2 leading-relaxed flex-1">{item.description}</p>
      )}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/6">
        {daysLeft !== null && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold
            ${daysLeft < 0 ? "bg-white/6 text-white/25" : daysLeft <= 7 ? "bg-[#9F2E41]/20 text-[#e05070]" : "bg-emerald-500/15 text-emerald-400"}`}>
            <Calendar size={9} />
            {daysLeft < 0 ? "Expired" : daysLeft === 0 ? "Closes today" : `${daysLeft}d left`}
          </span>
        )}
        <Link href="/login"
          className="ml-auto flex items-center gap-1.5 text-xs font-bold text-[#4693C9] transition hover:text-white hover:gap-2.5">
          <Lock size={10} /> Login to apply
        </Link>
      </div>
    </div>
  );
}

// ── News modal ────────────────────────────────────────────────────────────
function NewsModal({ item, onClose }: { item: any; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex min-h-full items-start justify-center px-4 pb-12 pt-20"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="w-full max-w-2xl rounded-2xl bg-[#0d1b2e] border border-white/10 shadow-2xl overflow-hidden animate-slideUp"
          onClick={(e) => e.stopPropagation()}>
          {item.image && <img src={item.image} alt={item.title} className="w-full h-52 object-cover" />}
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-extrabold text-white leading-tight">{item.title}</h2>
              <button onClick={onClose}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-white/50 transition hover:bg-white/15 hover:text-white">
                <X size={15} />
              </button>
            </div>
            {item.published_date && (
              <p className="flex items-center gap-1.5 text-xs text-white/35">
                <Calendar size={11} />
                {new Date(item.published_date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            )}
            <p className="text-sm text-white/65 whitespace-pre-line leading-relaxed">{item.content}</p>
            <div className="pt-3 border-t border-white/8">
              <Link href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1D437F] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#4693C9]">
                Sign in for more <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Animated section wrapper ──────────────────────────────────────────────
function AnimatedSection({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const { ref, visible } = useVisible();
  return (
    <section ref={ref} className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}>
      {children}
    </section>
  );
}

// ── Section label ─────────────────────────────────────────────────────────
function SectionLabel({ icon: Icon, label, accent }: { icon: React.ElementType; label: string; accent: string }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}20`, border: `1px solid ${accent}30` }}>
        <Icon size={17} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: accent }}>
          {label}
        </p>
        <div className="mt-1 h-px w-24 rounded-full opacity-30" style={{ backgroundColor: accent }} />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function WelcomePage() {
  const [slides, setSlides]           = useState<any[]>([]);
  const [news, setNews]               = useState<any[]>([]);
  const [vacancies, setVacancies]     = useState<any[]>([]);
  const [documents, setDocuments]     = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [viewingNews, setViewingNews] = useState<any | null>(null);
  const [scrolled, setScrolled]       = useState(false);

  // Navbar appears solid after scrolling past hero
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.1);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    Promise.allSettled([
      getPublicSlides(), getPublicNews(6),
      getPublicVacancies(6), getPublicDocuments(6),
    ]).then(([s, n, v, d]) => {
      if (s.status === "fulfilled") setSlides(s.value);
      if (n.status === "fulfilled") setNews(n.value);
      if (v.status === "fulfilled") setVacancies(v.value);
      if (d.status === "fulfilled") setDocuments(d.value);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#060f1e] text-white">

      {/* ── Floating navbar — transparent on hero, solid on scroll ── */}
      <header className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 sm:px-12 transition-all duration-500
        ${scrolled
          ? "bg-[#060f1e]/95 backdrop-blur-xl border-b border-white/8 shadow-xl shadow-black/30"
          : "bg-transparent border-b border-transparent"}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-lg transition-all duration-500 ${scrolled ? "bg-white" : "bg-white/90"}`}>
            <Building2 size={18} className="text-[#1D437F]" />
          </div>
          <div className={`hidden sm:block transition-all duration-500 ${scrolled ? "opacity-100" : "opacity-85"}`}>
            <p className="text-sm font-bold text-white leading-none">Rammis Bank</p>
            <p className="text-[10px] text-white/45 tracking-widest uppercase">Internal Portal</p>
          </div>
        </div>
        <Link href="/login"
          className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#1D437F] shadow-xl transition hover:bg-[#4693C9] hover:text-white hover:scale-105">
          Staff Login <ArrowRight size={14} />
        </Link>
      </header>

      {/* ── Full-screen Hero ── */}
      {loading ? (
        <div className="h-screen w-full bg-gradient-to-br from-[#060f1e] via-[#0d1b2e] to-[#1D437F]/30 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-2 border-[#4693C9]/40 border-t-[#4693C9] animate-spin" />
            <p className="text-sm text-white/30 tracking-widest uppercase">Loading</p>
          </div>
        </div>
      ) : (
        <FullScreenSlider slides={slides} />
      )}

      {/* ── Content sections — appear on scroll ── */}
      <div className="relative bg-[#060f1e]">

        {/* Subtle top separator */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4693C9]/30 to-transparent" />

        <div className="mx-auto max-w-7xl px-5 sm:px-10 py-24 space-y-28">

          {/* ── News ── */}
          {(loading || news.length > 0) && (
            <AnimatedSection>
              <SectionLabel icon={Newspaper} label="Latest News & Announcements" accent="#4693C9" />
              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-64 rounded-2xl skeleton" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {news.map((n, i) => (
                    <div key={n.id}
                      style={{ animationDelay: `${i * 80}ms` }}
                      className="animate-fadeIn">
                      <NewsCard item={n} onView={setViewingNews} />
                    </div>
                  ))}
                </div>
              )}
            </AnimatedSection>
          )}

          {/* ── Vacancies ── */}
          {(loading || vacancies.length > 0) && (
            <AnimatedSection delay={80}>
              <SectionLabel icon={Briefcase} label="Open Vacancies" accent="#635E28" />
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-44 rounded-2xl skeleton" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {vacancies.map((v, i) => (
                    <div key={v.id} style={{ animationDelay: `${i * 80}ms` }} className="animate-fadeIn">
                      <VacancyCard item={v} />
                    </div>
                  ))}
                </div>
              )}
            </AnimatedSection>
          )}

          {/* ── Documents ── */}
          {(loading || documents.length > 0) && (
            <AnimatedSection delay={120}>
              <SectionLabel icon={FileText} label="Public Documents" accent="#9F2E41" />
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-xl skeleton" />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/8">
                  {documents.map((doc, i) => (
                    <div key={doc.id}
                      className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/4 group"
                      style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9F2E41]/15 border border-[#9F2E41]/20">
                        <FileText size={16} className="text-[#9F2E41]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-[#4693C9] transition">{doc.title}</p>
                        {doc.created_at && (
                          <p className="text-[11px] text-white/30 mt-0.5">
                            {new Date(doc.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                      </div>
                      <Link href="/login"
                        className="shrink-0 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/4 px-3.5 py-2 text-xs font-semibold text-white/50 transition hover:bg-[#4693C9]/20 hover:border-[#4693C9]/40 hover:text-[#4693C9]">
                        <Lock size={10} /> Login to download
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </AnimatedSection>
          )}

          {/* ── CTA banner ── */}
          <AnimatedSection delay={60}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1D437F] via-[#1a3560] to-[#4693C9]/70 px-8 py-16 text-center border border-[#4693C9]/20 shadow-2xl">
              {/* Decorative orbs */}
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#4693C9]/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#1D437F]/40 blur-3xl" />
              {/* Dot-grid overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />

              <div className="relative">
                <span className="inline-block rounded-full border border-white/20 bg-white/8 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 mb-5">
                  Staff Access
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  Ready to access the full portal?
                </h2>
                <p className="mt-4 text-sm text-white/50 max-w-lg mx-auto leading-relaxed">
                  Sign in with your Rammis Bank credentials to access internal documents, reports, news and more.
                </p>
                <Link href="/login"
                  className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-white px-9 py-4 text-sm font-extrabold text-[#1D437F] shadow-2xl transition hover:bg-slate-50 hover:scale-105 hover:shadow-white/20">
                  Sign In to Portal <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* ── Footer ── */}
        <footer className="border-t border-white/5 px-6 py-7 sm:px-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1D437F]">
                <Building2 size={14} className="text-white" />
              </div>
              <p className="text-xs text-white/25">
                © {new Date().getFullYear()} Rammis Bank — Internal Portal
              </p>
            </div>
            <p className="text-xs text-white/15">
              Authorised access only. All activity is monitored and logged.
            </p>
          </div>
        </footer>
      </div>

      {/* ── News detail modal ── */}
      {viewingNews && (
        <NewsModal item={viewingNews} onClose={() => setViewingNews(null)} />
      )}
    </div>
  );
}
