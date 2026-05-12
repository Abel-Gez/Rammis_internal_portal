"use client";

import { useEffect, useState } from "react";
import useAuthGuard from "@/hooks/useAuthGuard";
import { hasPermission } from "@/utils/permissions";
import {
  getVacancies, createVacancy, updateVacancy,
  deleteVacancy, getEmploymentTypes,
} from "@/services/vacancies";
import { getDepartments } from "@/services/public";
import { VISIBILITY_OPTIONS, DEFAULT_VISIBILITY } from "@/utils/visibility";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  Search, Plus, Pencil, Trash2, Eye, Briefcase,
  MapPin, Clock, CalendarX, X, Building,
  ChevronLeft, ChevronRight, AlertCircle, Globe, Lock,
} from "lucide-react";

type EmploymentType = { id: number; name: string };
type Department     = { id: number; name: string };

function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-5 w-2/3 rounded" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="skeleton h-3 w-1/3 rounded" />
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

const inputCls    = "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#4693C9]/60 focus:ring-2 focus:ring-[#4693C9]/15";
const selectCls   = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#4693C9]/60 focus:ring-2 focus:ring-[#4693C9]/15";
const textareaCls = `${inputCls} resize-none`;

function deadlineStatus(deadline: string | null) {
  if (!deadline) return null;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days < 0)  return { label: "Expired",      cls: "bg-slate-100 text-slate-400" };
  if (days <= 7) return { label: `${days}d left`, cls: "bg-[#9F2E41]/10 text-[#9F2E41]" };
  return { label: new Date(deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" }), cls: "bg-[#635E28]/10 text-[#635E28]" };
}

export default function VacanciesPage() {
  const user = useAuthGuard("vacancies.view");

  const [vacancies, setVacancies]     = useState<any[]>([]);
  const [types, setTypes]             = useState<EmploymentType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [hasNext, setHasNext]         = useState(false);
  const [hasPrev, setHasPrev]         = useState(false);
  const [loading, setLoading]         = useState(false);

  // form
  const [title, setTitle]                       = useState("");
  const [location, setLocation]                 = useState("");
  const [description, setDescription]           = useState("");
  const [requirements, setRequirements]         = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [type, setType]                         = useState<number | "">("");
  const [visibility, setVisibility]             = useState<number>(DEFAULT_VISIBILITY);
  const [department, setDepartment]             = useState<number | "">("");
  const [deadline, setDeadline]                 = useState("");
  const [saving, setSaving]                     = useState(false);
  const [formError, setFormError]               = useState("");

  // modals
  const [formOpen, setFormOpen]       = useState(false);
  const [viewOpen, setViewOpen]       = useState(false);
  const [isEditMode, setIsEditMode]   = useState(false);
  const [selected, setSelected]       = useState<any | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId]       = useState<number | null>(null);
  const [deleting, setDeleting]       = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchVacancies = async (p = page) => {
    setLoading(true);
    try {
      const data = await getVacancies(search, p);
      const list = Array.isArray(data) ? data : data.results || [];
      setVacancies(list);
      setTotal(data.count || list.length);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch { setVacancies([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchVacancies(page), 300);
    return () => clearTimeout(t);
  }, [search, page]);

  useEffect(() => { setPage(1); }, [search]);

  useEffect(() => {
    Promise.allSettled([getDepartments(), getEmploymentTypes()]).then(([d, t]) => {
      if (d.status === "fulfilled") setDepartments(d.value);
      if (t.status === "fulfilled") setTypes(t.value.results || t.value);
    });
  }, []);

  // ── Form helpers ───────────────────────────────────────────────────────
  const resetForm = () => {
    setTitle(""); setLocation(""); setDescription("");
    setRequirements(""); setResponsibilities("");
    setType(""); setDepartment(""); setDeadline("");
    setVisibility(DEFAULT_VISIBILITY);
    setSelected(null); setIsEditMode(false); setFormError("");
  };

  const openCreate = () => { resetForm(); setFormOpen(true); };

  const openEdit = (v: any) => {
    setSelected(v);
    setTitle(v.title || "");
    setLocation(v.location || "");
    setDescription(v.description || "");
    setRequirements(v.requirements || "");
    setResponsibilities(v.responsibilities || "");
    setType(v.employment_type || "");
    setVisibility(v.visibility_level ?? DEFAULT_VISIBILITY);
    setDepartment(v.department || "");
    setDeadline(v.application_deadline || "");
    setIsEditMode(true);
    setFormOpen(true);
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) { setFormError("Job title is required."); return; }
    setSaving(true); setFormError("");
    const payload = {
      title, location, description, requirements, responsibilities,
      employment_type: type || null,
      visibility_level: visibility,
      department: department || null,
      application_deadline: deadline || null,
    };
    try {
      if (isEditMode && selected) { await updateVacancy(selected.id, payload); }
      else { await createVacancy(payload); }
      setFormOpen(false); resetForm(); fetchVacancies(1); setPage(1);
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally { setSaving(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteVacancy(deleteId); setConfirmOpen(false); setDeleteId(null); fetchVacancies(page); }
    catch { } finally { setDeleting(false); }
  };

  const totalPages = Math.max(1, Math.ceil(total / 10));
  const isPublic = visibility === 1;

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Vacancies</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {total > 0 ? `${total} open position${total !== 1 ? "s" : ""}` : "Internal job listings and career opportunities."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition focus-within:border-[#4693C9]/60 focus-within:ring-2 focus-within:ring-[#4693C9]/15 cursor-text">
            <Search size={14} className="shrink-0 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vacancies…"
              className="w-44 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300" />
            {search && <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 transition"><X size={13} /></button>}
          </label>
          {hasPermission(user, "vacancies.create") && (
            <button onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-[#1D437F] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#4693C9]">
              <Plus size={15} /> Post Vacancy
            </button>
          )}
        </div>
      </div>

      {/* ── Cards grid ── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : vacancies.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
          <Briefcase size={36} className="text-slate-200" />
          <p className="text-sm font-medium">{search ? `No vacancies matching "${search}"` : "No vacancies posted yet."}</p>
          {search && <button onClick={() => setSearch("")} className="text-xs text-[#4693C9] hover:underline">Clear search</button>}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vacancies.map((v) => {
            const dl = deadlineStatus(v.application_deadline);
            return (
              <div key={v.id} className="card group flex flex-col p-5 gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{v.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {v.employment_type_name && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#4693C9]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#4693C9]">
                        <Clock size={9} /> {v.employment_type_name}
                      </span>
                    )}
                    {v.department_name && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1D437F]/8 px-2.5 py-0.5 text-[10px] font-bold text-[#1D437F]">
                        <Building size={9} /> {v.department_name}
                      </span>
                    )}
                    {/* Visibility badge */}
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold
                      ${v.visibility_level === 1 ? "bg-emerald-50 text-emerald-600" : "bg-[#1D437F]/8 text-[#1D437F]"}`}>
                      {v.visibility_level === 1 ? <><Globe size={8}/> Public</> : <><Lock size={8}/> Internal</>}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-xs text-slate-400">
                  {v.location && (
                    <span className="flex items-center gap-1.5"><MapPin size={11} className="shrink-0 text-slate-300" /> {v.location}</span>
                  )}
                  {dl && (
                    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${dl.cls}`}>
                      <CalendarX size={9} /> Deadline: {dl.label}
                    </span>
                  )}
                </div>
                {v.description && <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1">{v.description}</p>}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                  <button onClick={() => { setSelected(v); setViewOpen(true); }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#4693C9] transition hover:text-[#1D437F]">
                    <Eye size={13} /> View Details
                  </button>
                  <div className="flex items-center gap-1">
                    {hasPermission(user, "vacancies.change") && (
                      <button onClick={() => openEdit(v)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#4693C9]/8 hover:text-[#1D437F]">
                        <Pencil size={13} />
                      </button>
                    )}
                    {hasPermission(user, "vacancies.delete") && (
                      <button onClick={() => { setDeleteId(v.id); setConfirmOpen(true); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#9F2E41]/8 hover:text-[#9F2E41]">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Page {page} of {totalPages} · {total} position{total !== 1 ? "s" : ""}</p>
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
        title={isEditMode ? "Edit Vacancy" : "Post New Vacancy"}
        subtitle={isEditMode ? "Update the vacancy details below" : "Fill in the job details to publish a new vacancy"}
        size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl border border-[#9F2E41]/25 bg-[#9F2E41]/8 px-4 py-3 text-xs font-medium text-[#9F2E41]">
              <AlertCircle size={14} className="shrink-0" /> {formError}
            </div>
          )}

          {/* Title + Location */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Job Title *">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Analyst" required className={inputCls} />
            </FormField>
            <FormField label="Location">
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Addis Ababa" className={inputCls} />
            </FormField>
          </div>

          {/* Visibility + Department */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Visibility">
              <div className="relative">
                <select value={visibility} onChange={(e) => setVisibility(Number(e.target.value))} className={`${selectCls} pl-9`}>
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
                <select value={department} onChange={(e) => setDepartment(Number(e.target.value) || "")} className={`${selectCls} pl-9`}>
                  <option value="">All Departments</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                  <Building size={14} />
                </span>
              </div>
            </FormField>
          </div>

          {/* Employment Type + Deadline */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Employment Type">
              <select value={type} onChange={(e) => setType(Number(e.target.value) || "")} className={selectCls}>
                <option value="">Select type</option>
                {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </FormField>
            <FormField label="Application Deadline">
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief overview of the role…" rows={3} className={textareaCls} />
          </FormField>
          <FormField label="Requirements">
            <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="List required qualifications and skills…" rows={3} className={textareaCls} />
          </FormField>
          <FormField label="Responsibilities">
            <textarea value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} placeholder="List key duties and responsibilities…" rows={3} className={textareaCls} />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setFormOpen(false); resetForm(); }}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1D437F] py-2.5 text-sm font-bold text-white transition hover:bg-[#4693C9] disabled:opacity-60">
              {saving ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</> : isEditMode ? "Update Vacancy" : "Post Vacancy"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── View Modal ── */}
      <Modal open={viewOpen} onClose={() => { setViewOpen(false); setSelected(null); }}
        title={selected?.title}
        subtitle={selected?.created_at ? `Posted ${new Date(selected.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}` : undefined}
        size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {selected.employment_type_name && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4693C9]/10 px-3 py-1 text-xs font-bold text-[#4693C9]">
                  <Clock size={11} /> {selected.employment_type_name}
                </span>
              )}
              {selected.location && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  <MapPin size={11} /> {selected.location}
                </span>
              )}
              {selected.department_name && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1D437F]/8 px-3 py-1 text-xs font-bold text-[#1D437F]">
                  <Building size={11} /> {selected.department_name}
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold
                ${selected.visibility_level === 1 ? "bg-emerald-50 text-emerald-600" : "bg-[#1D437F]/8 text-[#1D437F]"}`}>
                {selected.visibility_level === 1 ? <><Globe size={11}/> Public</> : <><Lock size={11}/> Internal</>}
              </span>
              {selected.application_deadline && (() => {
                const dl = deadlineStatus(selected.application_deadline);
                return dl ? (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${dl.cls}`}>
                    <CalendarX size={11} /> Deadline: {dl.label}
                  </span>
                ) : null;
              })()}
            </div>

            {[
              { heading: "Description",      body: selected.description },
              { heading: "Requirements",     body: selected.requirements },
              { heading: "Responsibilities", body: selected.responsibilities },
            ].map(({ heading, body }) => body ? (
              <div key={heading}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-px flex-1 bg-slate-100" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">{heading}</h3>
                  <span className="h-px flex-1 bg-slate-100" />
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{body}</p>
              </div>
            ) : null)}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              {hasPermission(user, "vacancies.change") && (
                <button onClick={() => { setViewOpen(false); openEdit(selected); }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#4693C9]/40 hover:text-[#1D437F]">
                  <Pencil size={13} /> Edit
                </button>
              )}
              {hasPermission(user, "vacancies.delete") && (
                <button onClick={() => { setViewOpen(false); setDeleteId(selected.id); setConfirmOpen(true); }}
                  className="flex items-center gap-1.5 rounded-xl border border-transparent px-4 py-2 text-sm font-medium text-[#9F2E41] transition hover:bg-[#9F2E41]/8">
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal open={confirmOpen} title="Delete Vacancy?"
        message="This vacancy will be permanently removed. This action cannot be undone."
        onConfirm={confirmDelete} onCancel={() => { setConfirmOpen(false); setDeleteId(null); }} loading={deleting} />
    </div>
  );
}
