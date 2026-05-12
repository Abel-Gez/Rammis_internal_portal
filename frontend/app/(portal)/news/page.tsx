"use client";

import { useEffect, useRef, useState } from "react";
import useAuthGuard from "@/hooks/useAuthGuard";
import { getNews, createNews, updateNews, deleteNews } from "@/services/news";
import { getDepartments } from "@/services/public";
import { hasPermission } from "@/utils/permissions";
import { VISIBILITY_OPTIONS, DEFAULT_VISIBILITY } from "@/utils/visibility";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  Search, Plus, Pencil, Trash2, Eye, Newspaper,
  Calendar, Upload, X, ChevronLeft, ChevronRight,
  Globe, Lock, Building,
} from "lucide-react";

type Department = { id: number; name: string };

function SkeletonCard() {
  return (
    <div className="card overflow-hidden p-0">
      <div className="skeleton h-44 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#4693C9]/60 focus:ring-2 focus:ring-[#4693C9]/15";
const selectCls = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#4693C9]/60 focus:ring-2 focus:ring-[#4693C9]/15";

export default function NewsPage() {
  const user = useAuthGuard("news.view");

  const [news, setNews]       = useState<any[]>([]);
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [loading, setLoading] = useState(false);

  // form
  const [title, setTitle]                   = useState("");
  const [content, setContent]               = useState("");
  const [image, setImage]                   = useState<File | null>(null);
  const [publishedDate, setPublishedDate]   = useState("");
  const [visibility, setVisibility]         = useState<number>(DEFAULT_VISIBILITY);
  const [department, setDepartment]         = useState<number | "">("");
  const [departments, setDepartments]       = useState<Department[]>([]);
  const [saving, setSaving]                 = useState(false);
  const [formError, setFormError]           = useState("");
  const fileRef                             = useRef<HTMLInputElement>(null);

  // modals
  const [formOpen, setFormOpen]       = useState(false);
  const [viewOpen, setViewOpen]       = useState(false);
  const [isEditMode, setIsEditMode]   = useState(false);
  const [selected, setSelected]       = useState<any | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId]       = useState<number | null>(null);
  const [deleting, setDeleting]       = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchNews = async (p = page) => {
    setLoading(true);
    try {
      const data = await getNews(search, p);
      const list = Array.isArray(data) ? data : data.results || [];
      setNews(list);
      setTotal(data.count || list.length);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch { setNews([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchNews(page), 300);
    return () => clearTimeout(t);
  }, [search, page]);

  useEffect(() => { setPage(1); }, [search]);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => {});
  }, []);

  // ── Form helpers ───────────────────────────────────────────────────────
  const resetForm = () => {
    setTitle(""); setContent(""); setImage(null);
    setPublishedDate(""); setSelected(null);
    setIsEditMode(false); setFormError("");
    setVisibility(DEFAULT_VISIBILITY);
    setDepartment("");
  };

  const openCreate = () => { resetForm(); setFormOpen(true); };
  const openEdit   = (n: any) => {
    setSelected(n);
    setTitle(n.title);
    setContent(n.content);
    setPublishedDate(n.published_date || "");
    setVisibility(n.visibility_level ?? DEFAULT_VISIBILITY);
    setDepartment(n.department || "");
    setImage(null);
    setIsEditMode(true);
    setFormOpen(true);
  };
  const openView = (n: any) => { setSelected(n); setViewOpen(true); };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setFormError("Title and content are required."); return; }
    setSaving(true);
    setFormError("");
    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", content);
    fd.append("visibility_level", String(visibility));
    if (image) fd.append("image", image);
    if (publishedDate) fd.append("published_date", publishedDate);
    if (department) fd.append("department", String(department));
    try {
      if (isEditMode && selected) { await updateNews(selected.id, fd); }
      else { await createNews(fd); }
      setFormOpen(false); resetForm(); fetchNews(1); setPage(1);
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally { setSaving(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteNews(deleteId); setConfirmOpen(false); setDeleteId(null); fetchNews(page); }
    catch { } finally { setDeleting(false); }
  };

  const totalPages = Math.max(1, Math.ceil(total / 10));
  const isPublic = visibility === 1;

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">News & Announcements</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {total > 0 ? `${total} article${total !== 1 ? "s" : ""} published` : "Internal news board for all staff."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition focus-within:border-[#4693C9]/60 focus-within:ring-2 focus-within:ring-[#4693C9]/15 cursor-text">
            <Search size={14} className="shrink-0 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search news…"
              className="w-44 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300" />
            {search && <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 transition"><X size={13} /></button>}
          </label>
          {hasPermission(user, "news.create") && (
            <button onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-[#1D437F] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#4693C9]">
              <Plus size={15} /> New Article
            </button>
          )}
        </div>
      </div>

      {/* ── News grid ── */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : news.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
          <Newspaper size={36} className="text-slate-200" />
          <p className="text-sm font-medium">{search ? `No articles matching "${search}"` : "No news articles yet."}</p>
          {search && <button onClick={() => setSearch("")} className="text-xs text-[#4693C9] hover:underline">Clear search</button>}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <div key={n.id} className="card group overflow-hidden p-0 flex flex-col">
              <div className="relative h-44 w-full shrink-0 bg-gradient-to-br from-[#1D437F]/10 to-[#4693C9]/10 overflow-hidden">
                {n.image ? (
                  <img src={n.image} alt={n.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center"><Newspaper size={36} className="text-[#4693C9]/30" /></div>
                )}
                {n.published_date && (
                  <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                    <Calendar size={10} />
                    {new Date(n.published_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
                {/* Visibility badge */}
                <span className={`absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide backdrop-blur-sm border
                  ${n.visibility_level === 1 ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300" : "bg-[#1D437F]/40 border-[#4693C9]/30 text-blue-200"}`}>
                  {n.visibility_level === 1 ? <><Globe size={9}/> Public</> : <><Lock size={9}/> Internal</>}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{n.title}</h2>
                <p className="mt-1.5 text-xs text-slate-400 line-clamp-3 leading-relaxed flex-1">{n.content}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <button onClick={() => openView(n)} className="flex items-center gap-1.5 text-xs font-semibold text-[#4693C9] transition hover:text-[#1D437F]">
                    <Eye size={13} /> Read more
                  </button>
                  <div className="flex items-center gap-1">
                    {hasPermission(user, "news.change") && (
                      <button onClick={() => openEdit(n)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#4693C9]/8 hover:text-[#1D437F]">
                        <Pencil size={13} />
                      </button>
                    )}
                    {hasPermission(user, "news.delete") && (
                      <button onClick={() => { setDeleteId(n.id); setConfirmOpen(true); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#9F2E41]/8 hover:text-[#9F2E41]">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Page {page} of {totalPages} · {total} article{total !== 1 ? "s" : ""}</p>
          <div className="flex items-center gap-1.5">
            <button disabled={!hasPrev || loading} onClick={() => setPage((p) => p - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#4693C9]/40 hover:text-[#1D437F] disabled:opacity-35 disabled:cursor-not-allowed">
              <ChevronLeft size={14} />
            </button>
            <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-[#1D437F] px-2 text-xs font-bold text-white">{page}</span>
            <button disabled={!hasNext || loading} onClick={() => setPage((p) => p + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#4693C9]/40 hover:text-[#1D437F] disabled:opacity-35 disabled:cursor-not-allowed">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal open={formOpen} onClose={() => { setFormOpen(false); resetForm(); }}
        title={isEditMode ? "Edit Article" : "New Article"}
        subtitle={isEditMode ? "Update the article details below" : "Fill in the details to publish a new article"}
        size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-[#9F2E41]/25 bg-[#9F2E41]/8 px-4 py-3 text-xs font-medium text-[#9F2E41]">{formError}</div>
          )}

          <FormField label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" required className={inputCls} />
          </FormField>

          <FormField label="Content">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write the article content…"
              required rows={5} className={`${inputCls} resize-none`} />
          </FormField>

          {/* Visibility + Department row */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Visibility">
              <div className="relative">
                <select value={visibility} onChange={(e) => setVisibility(Number(e.target.value))}
                  className={`${selectCls} pl-9`}>
                  {VISIBILITY_OPTIONS.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                  {isPublic ? <Globe size={14} /> : <Lock size={14} />}
                </span>
              </div>
            </FormField>

            <FormField label="Department">
              <div className="relative">
                <select value={department} onChange={(e) => setDepartment(Number(e.target.value) || "")}
                  className={`${selectCls} pl-9`}>
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                  <Building size={14} />
                </span>
              </div>
            </FormField>
          </div>

          {/* Date + Image row */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Publish Date">
              <input type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Cover Image">
              <div onClick={() => fileRef.current?.click()}
                className="relative flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-2.5 transition hover:border-[#4693C9]/50 hover:bg-slate-50">
                <Upload size={14} className="shrink-0 text-slate-300" />
                <span className="truncate text-xs text-slate-400">{image ? image.name : isEditMode ? "Replace image…" : "Upload image…"}</span>
                {image && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setImage(null); }} className="ml-auto text-slate-300 hover:text-[#9F2E41] transition shrink-0">
                    <X size={13} />
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] || null)} />
              </div>
            </FormField>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setFormOpen(false); resetForm(); }}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1D437F] py-2.5 text-sm font-bold text-white transition hover:bg-[#4693C9] disabled:opacity-60">
              {saving ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</> : isEditMode ? "Update Article" : "Publish Article"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── View Modal ── */}
      <Modal open={viewOpen} onClose={() => { setViewOpen(false); setSelected(null); }} title={selected?.title}
        subtitle={selected?.published_date ? new Date(selected.published_date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : undefined}
        size="lg">
        {selected && (
          <div className="space-y-5">
            {selected.image && <img src={selected.image} alt={selected.title} className="w-full rounded-xl object-cover max-h-64" />}
            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{selected.content}</p>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              {hasPermission(user, "news.change") && (
                <button onClick={() => { setViewOpen(false); openEdit(selected); }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#4693C9]/40 hover:text-[#1D437F]">
                  <Pencil size={13} /> Edit
                </button>
              )}
              {hasPermission(user, "news.delete") && (
                <button onClick={() => { setViewOpen(false); setDeleteId(selected.id); setConfirmOpen(true); }}
                  className="flex items-center gap-1.5 rounded-xl border border-transparent px-4 py-2 text-sm font-medium text-[#9F2E41] transition hover:bg-[#9F2E41]/8">
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal open={confirmOpen} title="Delete Article?"
        message="This article will be permanently removed. This action cannot be undone."
        onConfirm={confirmDelete} onCancel={() => { setConfirmOpen(false); setDeleteId(null); }} loading={deleting} />
    </div>
  );
}
