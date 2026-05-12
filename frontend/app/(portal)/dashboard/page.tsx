"use client";

import QuickLinks from "@/components/ui/QuickLinks";
import useAuthGuard from "@/hooks/useAuthGuard";
import useDashboard from "@/hooks/useDashboard";
import { hasPermission } from "@/utils/permissions";
import { VISIBILITY_OPTIONS, DEFAULT_VISIBILITY } from "@/utils/visibility";
import Portal from "@/components/ui/Portal";
import { useEffect, useState } from "react";
import HeroSlider from "@/components/dashboard/HeroSlider";
import {
  createHeroSlide, deleteHeroSlide, getHeroSlides, updateHeroSlide,
} from "@/services/hero";
import {
  BarChart3, FileText, Newspaper, Briefcase,
  Settings2, Plus, Pencil, Trash2, X, ArrowRight, Zap,
} from "lucide-react";

const statsConfig = [
  { key: "reports",   label: "Reports",   icon: BarChart3, gradient: "from-[#1D437F] to-[#4693C9]", light: "bg-[#1D437F]/8 text-[#1D437F]" },
  { key: "documents", label: "Documents", icon: FileText,  gradient: "from-[#4693C9] to-[#1D437F]", light: "bg-[#4693C9]/8 text-[#4693C9]" },
  { key: "news",      label: "News",      icon: Newspaper, gradient: "from-[#635E28] to-[#8a7e38]", light: "bg-[#635E28]/8 text-[#635E28]" },
  { key: "vacancies", label: "Vacancies", icon: Briefcase, gradient: "from-[#9F2E41] to-[#c44058]", light: "bg-[#9F2E41]/8 text-[#9F2E41]" },
];

export default function DashboardPage() {
  const user = useAuthGuard("view_dashboard");
  const data = useDashboard();

  const [slides, setSlides]                         = useState<any[]>([]);
  const [isSlideManagerOpen, setIsSlideManagerOpen] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen]     = useState(false);
  const [isSlideEdit, setIsSlideEdit]               = useState(false);
  const [selectedSlide, setSelectedSlide]           = useState<any | null>(null);
  const [slideTitle, setSlideTitle]                 = useState("");
  const [slideSubtitle, setSlideSubtitle]           = useState("");
  const [slideImage, setSlideImage]                 = useState<File | null>(null);
  const [slideVisibility, setSlideVisibility]       = useState<number>(DEFAULT_VISIBILITY);
  const [confirmOpen, setConfirmOpen]               = useState(false);
  const [deleteId, setDeleteId]                     = useState<number | null>(null);
  const [saving, setSaving]                         = useState(false);

  const fetchSlides = async () => {
    try {
      const res = await getHeroSlides();
      setSlides(Array.isArray(res) ? res : res.results || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSlides(); }, []);

  if (!user || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-[#4693C9] border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const { totals, latest_reports, latest_documents, latest_news, active_vacancies } = data;

  const resetForm = () => {
    setSlideTitle(""); setSlideSubtitle(""); setSlideImage(null);
    setSelectedSlide(null); setIsSlideEdit(false);
    setSlideVisibility(DEFAULT_VISIBILITY);
  };

  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.append("title", slideTitle);
    fd.append("subtitle", slideSubtitle);
    if (slideImage) fd.append("image", slideImage);
    fd.append("visibility_level", String(slideVisibility));
    try {
      if (isSlideEdit && selectedSlide) {
        await updateHeroSlide(selectedSlide.id, fd);
      } else {
        await createHeroSlide(fd);
      }
      await fetchSlides();
      setIsSlideModalOpen(false);
      resetForm();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleSlideEdit = (slide: any) => {
    setSelectedSlide(slide);
    setSlideTitle(slide.title);
    setSlideSubtitle(slide.subtitle || "");
    setSlideVisibility(slide.visibility_level ?? DEFAULT_VISIBILITY);
    setIsSlideEdit(true);
    setIsSlideModalOpen(true);
  };

  const openDelete    = (id: number) => { setDeleteId(id); setConfirmOpen(true); };
  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteHeroSlide(deleteId);
    setConfirmOpen(false); setDeleteId(null); fetchSlides();
  };

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Hero + Quick Links ── */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="relative flex-1 min-w-0">
          <HeroSlider slides={slides} />
          {hasPermission(user, "hero.change") && (
            <div className="absolute top-4 right-4 z-30">
              <button onClick={() => setIsSlideManagerOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/60">
                <Settings2 size={13} /> Manage Slides
              </button>
            </div>
          )}
        </div>
        <div className="w-full lg:w-72 xl:w-80 shrink-0">
          <div className="h-full rounded-2xl bg-gradient-to-b from-[#1D437F] to-[#153260] p-4 shadow-xl border border-[#4693C9]/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                <Zap size={14} className="text-[#4693C9]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Quick Actions</h2>
                <p className="text-[10px] text-blue-300/60">One-click access</p>
              </div>
            </div>
            <QuickLinks />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">At a glance</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsConfig.map((stat, i) => (
            <StatCard key={stat.key} label={stat.label} value={totals[stat.key]}
              icon={stat.icon} gradient={stat.gradient} light={stat.light} delay={i * 60} />
          ))}
        </div>
      </section>

      {/* ── Content lists ── */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Recent activity</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ContentList title="Latest Reports"   items={latest_reports}   accent="#1D437F" />
          <ContentList title="Latest Documents" items={latest_documents} accent="#4693C9" />
          <ContentList title="Latest News"      items={latest_news}      accent="#635E28" />
          <ContentList title="Active Vacancies" items={active_vacancies} accent="#9F2E41" />
        </div>
      </section>

      {/* ── Slide Create/Edit Modal ── */}
      {isSlideModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="flex min-h-full items-start justify-center px-4 pb-8 pt-20">
              <div className="animate-slideUp w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#1D437F] to-[#4693C9] px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">{isSlideEdit ? "Edit Slide" : "New Slide"}</h2>
                    <p className="text-xs text-blue-200/70">Fill in the details below</p>
                  </div>
                  <button onClick={() => { setIsSlideModalOpen(false); resetForm(); }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition">
                    <X size={15} />
                  </button>
                </div>
                <form onSubmit={handleSlideSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Visibility</label>
                    <select value={slideVisibility}
                      onChange={(e) => setSlideVisibility(Number(e.target.value) || DEFAULT_VISIBILITY)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#4693C9] focus:ring-2 focus:ring-[#4693C9]/20">
                      {VISIBILITY_OPTIONS.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Title</label>
                    <input value={slideTitle} onChange={(e) => setSlideTitle(e.target.value)}
                      placeholder="Enter slide title" required
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#4693C9] focus:ring-2 focus:ring-[#4693C9]/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Subtitle</label>
                    <textarea value={slideSubtitle} onChange={(e) => setSlideSubtitle(e.target.value)}
                      placeholder="Enter slide subtitle" rows={3}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#4693C9] focus:ring-2 focus:ring-[#4693C9]/20 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Image</label>
                    <div className="relative rounded-xl border-2 border-dashed border-slate-200 px-4 py-3 transition hover:border-[#4693C9]/50">
                      <input type="file" accept="image/*"
                        onChange={(e) => setSlideImage(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      <p className="text-sm text-slate-400 text-center">
                        {slideImage ? slideImage.name : "Click to upload image"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => { setIsSlideModalOpen(false); resetForm(); }}
                      className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex-1 rounded-xl bg-[#1D437F] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4693C9] disabled:opacity-60">
                      {saving ? "Saving…" : isSlideEdit ? "Update Slide" : "Create Slide"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirmOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="animate-slideUp w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#9F2E41]/10">
                <Trash2 size={22} className="text-[#9F2E41]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Delete Slide?</h3>
              <p className="mt-1 text-sm text-slate-500">This action cannot be undone.</p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => { setConfirmOpen(false); setDeleteId(null); }}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-[#9F2E41] py-2.5 text-sm font-semibold text-white hover:bg-[#b8354a] transition">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Slide Manager Modal ── */}
      {isSlideManagerOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="flex min-h-full items-start justify-center px-4 pb-8 pt-20">
              <div className="animate-slideUp w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#1D437F] to-[#4693C9] px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">Hero Slides</h2>
                    <p className="text-xs text-blue-200/70">{slides.length} slide{slides.length !== 1 && "s"} configured</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { resetForm(); setIsSlideEdit(false); setIsSlideModalOpen(true); }}
                      className="flex items-center gap-1.5 rounded-xl bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25">
                      <Plus size={13} /> Add Slide
                    </button>
                    <button onClick={() => setIsSlideManagerOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition">
                      <X size={15} />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {slides.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <p className="text-sm">No slides yet. Add your first one.</p>
                    </div>
                  ) : (
                    slides.map((s) => (
                      <div key={s.id}
                        className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 transition hover:border-[#4693C9]/30 hover:bg-white">
                        {s.image && (
                          <div className="h-14 w-20 shrink-0 rounded-lg bg-cover bg-center border border-slate-200"
                            style={{ backgroundImage: `url(${s.image})` }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{s.title}</p>
                          {s.subtitle && <p className="text-xs text-slate-500 truncate mt-0.5">{s.subtitle}</p>}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400">Order: {s.order}</span>
                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${s.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                              {s.is_active ? "Active" : "Inactive"}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${s.visibility_level_id === 1 || s.visibility_level?.id === 1 ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                              {s.visibility_level_name || s.visibility_level?.name || "—"}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button onClick={() => handleSlideEdit(s)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#4693C9]/50 hover:text-[#1D437F] hover:bg-[#4693C9]/5">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => openDelete(s.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#9F2E41]/40 hover:text-[#9F2E41] hover:bg-[#9F2E41]/5">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, gradient, light, delay }: {
  label: string; value: number; icon: React.ElementType;
  gradient: string; light: string; delay: number;
}) {
  return (
    <div className="card group relative overflow-hidden p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${gradient}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 text-4xl font-bold text-slate-800 tabular-nums">{value ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">Total records</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${light} transition-transform group-hover:scale-110`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function ContentList({ title, items, accent }: {
  title: string; items: any[]; accent: string;
}) {
  return (
    <div className="card flex flex-col p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100"
        style={{ borderLeftColor: accent, borderLeftWidth: 3 }}>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: `${accent}14`, color: accent }}>
          {items.length} item{items.length !== 1 && "s"}
        </span>
      </div>
      <ul className="flex-1 divide-y divide-slate-50 px-2 py-1">
        {items.length === 0 ? (
          <li className="px-3 py-4 text-xs text-slate-400 text-center">No data available yet.</li>
        ) : (
          items.map((item) => (
            <li key={item.id}
              className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-slate-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{item.title}</p>
                  {item.created_at && (
                    <p className="text-[11px] text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              <span className="ml-3 flex shrink-0 items-center gap-0.5 text-[11px] font-medium opacity-0 transition group-hover:opacity-100"
                style={{ color: accent }}>
                View <ArrowRight size={10} />
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
