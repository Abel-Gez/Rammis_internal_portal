"use client";

import { useEffect, useRef, useState } from "react";
import { getDocuments, createDocument, deleteDocument } from "@/services/documents";
import { getDepartments } from "@/services/public";
import useAuthGuard from "@/hooks/useAuthGuard";
import { hasPermission } from "@/utils/permissions";
import { VISIBILITY_OPTIONS, DEFAULT_VISIBILITY } from "@/utils/visibility";
import Portal from "@/components/ui/Portal";
import {
  Search, Upload, FileText, FileSpreadsheet, FileImage, File,
  Download, Eye, Trash2, ChevronLeft, ChevronRight, X,
  CloudUpload, FolderOpen, Globe, Lock, Building,
} from "lucide-react";

type Department = { id: number; name: string };

// ── Helpers ────────────────────────────────────────────────────────────────

function getFileIcon(title: string, docType?: string) {
  const ext = (docType || title || "").toLowerCase();
  if (ext.includes("pdf"))                          return { Icon: FileText,       color: "text-[#9F2E41]", bg: "bg-[#9F2E41]/8" };
  if (ext.includes("xls") || ext.includes("csv"))  return { Icon: FileSpreadsheet, color: "text-[#635E28]", bg: "bg-[#635E28]/8" };
  if (ext.includes("png") || ext.includes("jpg") || ext.includes("image"))
                                                    return { Icon: FileImage,       color: "text-[#4693C9]", bg: "bg-[#4693C9]/8" };
  if (ext.includes("doc") || ext.includes("word")) return { Icon: FileText,       color: "text-[#1D437F]", bg: "bg-[#1D437F]/8" };
  return { Icon: File, color: "text-slate-400", bg: "bg-slate-100" };
}

function FileTypeBadge({ type }: { type?: string }) {
  if (!type) return <span className="text-slate-300">—</span>;
  const label = type.toUpperCase().replace("APPLICATION/", "").replace("VND.", "").split(".").pop() || type;
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      {label.slice(0, 6)}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[44, 20, 24, 32].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="skeleton h-3.5 rounded" style={{ width: `${w * 4}px`, maxWidth: "100%" }} />
        </td>
      ))}
    </tr>
  );
}

const selectCls = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#4693C9]/60 focus:ring-2 focus:ring-[#4693C9]/15";

// ── Main page ──────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const user = useAuthGuard("documents.view");

  const [documents, setDocuments]     = useState<any[]>([]);
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [hasNext, setHasNext]         = useState(false);
  const [hasPrev, setHasPrev]         = useState(false);
  const [search, setSearch]           = useState("");
  const [loadingList, setLoadingList] = useState(false);

  // upload form
  const [title, setTitle]           = useState("");
  const [file, setFile]             = useState<File | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging]     = useState(false);
  const [visibility, setVisibility] = useState<number>(DEFAULT_VISIBILITY);
  const [department, setDepartment] = useState<number | "">("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  // modals
  const [previewUrl, setPreviewUrl]         = useState<string | null>(null);  // inline URL
  const [previewDownloadUrl, setPreviewDownloadUrl] = useState<string | null>(null); // force-download URL
  const [previewTitle, setPreviewTitle]     = useState("");
  const [confirmId, setConfirmId]       = useState<number | null>(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchDocuments = async (p = page) => {
    setLoadingList(true);
    try {
      const data = await getDocuments(search, p);
      setDocuments(data.results || []);
      setTotal(data.count || 0);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch {
      setDocuments([]); setTotal(0);
    } finally { setLoadingList(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchDocuments(page), 300);
    return () => clearTimeout(t);
  }, [search, page]);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { getDepartments().then(setDepartments).catch(() => {}); }, []);

  // ── Upload ───────────────────────────────────────────────────────────────

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !title) return;
    setUploadError(""); setUploading(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("file", file);
    fd.append("visibility_level", String(visibility));
    if (department) fd.append("department", String(department));
    try {
      await createDocument(fd);
      setTitle(""); setFile(null); setDepartment("");
      setVisibility(DEFAULT_VISIBILITY);
      fetchDocuments(1); setPage(1);
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try { await deleteDocument(confirmId); setConfirmId(null); fetchDocuments(page); }
    catch { } finally { setDeleting(false); }
  };

  const totalPages = Math.ceil(total / 10) || 1;
  const isPublic = visibility === 1;

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Documents</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {total > 0 ? `${total} document${total !== 1 ? "s" : ""} in the library` : "Upload, search and manage internal documents."}
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition focus-within:border-[#4693C9]/60 focus-within:ring-2 focus-within:ring-[#4693C9]/15 w-full sm:w-72 cursor-text">
          <Search size={14} className="shrink-0 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents…"
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300" />
          {search && <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 transition"><X size={13} /></button>}
        </label>
      </div>

      {/* ── Upload zone ── */}
      {hasPermission(user, "documents.create") && (
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D437F]/8">
              <CloudUpload size={16} className="text-[#1D437F]" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Upload Document</p>
              <p className="text-xs text-slate-400">PDF, Word, Excel or images · Max 10 MB</p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="flex flex-col gap-3">
            {/* Title */}
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#4693C9]/60 focus:ring-2 focus:ring-[#4693C9]/15" />

            {/* Visibility + Department */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Visibility */}
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

              {/* Department */}
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
            </div>

            {/* Drop zone */}
            <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-center transition
                ${dragging ? "border-[#4693C9] bg-[#4693C9]/5" : "border-slate-200 hover:border-[#4693C9]/50 hover:bg-slate-50"}`}>
              <Upload size={20} className={dragging ? "text-[#4693C9]" : "text-slate-300"} />
              {file ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{file.name}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-slate-400 hover:text-[#9F2E41] transition"><X size={14} /></button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-400">Drag & drop a file here, or <span className="font-semibold text-[#4693C9]">browse</span></p>
                  <p className="text-xs text-slate-300">PDF, DOCX, XLSX, PNG, JPG</p>
                </>
              )}
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>

            {uploadError && <p className="text-xs text-[#9F2E41] font-medium">{uploadError}</p>}

            <button type="submit" disabled={!title || !file || uploading}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#1D437F] py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#4693C9] disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading
                ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Uploading…</>
                : <><Upload size={14} /> Upload Document</>}
            </button>
          </form>
        </div>
      )}

      {/* ── Documents table ── */}
      <div className="card overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <FolderOpen size={15} className="text-[#1D437F]" />
            <span className="text-sm font-bold text-slate-700">Document Library</span>
            {!loadingList && (
              <span className="rounded-full bg-[#1D437F]/8 px-2 py-0.5 text-[11px] font-semibold text-[#1D437F]">{total}</span>
            )}
          </div>
          {loadingList && <span className="text-xs text-slate-400 animate-pulse">Refreshing…</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Document</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Type</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Uploaded</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingList && documents.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <FolderOpen size={32} className="text-slate-200" />
                      <p className="text-sm font-medium">{search ? `No documents matching "${search}"` : "No documents yet"}</p>
                      {search && <button onClick={() => setSearch("")} className="text-xs text-[#4693C9] hover:underline">Clear search</button>}
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const { Icon, color, bg } = getFileIcon(doc.title, doc.document_type);
                  // Use the Next.js proxy route — avoids IPv4/IPv6 mismatches
                  // and keeps the iframe on the same origin as the app.
                  const previewSrc = `/api/file/documents/${doc.id}?inline=true`;
                  const downloadHref = `/api/file/documents/${doc.id}`;
                  return (
                    <tr key={doc.id} className="group transition hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                            <Icon size={17} className={color} />
                          </div>
                          <span className="truncate max-w-xs font-medium text-slate-800 text-sm">{doc.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><FileTypeBadge type={doc.document_type} /></td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(doc.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview — serves inline so PDF/image renders in the iframe */}
                          <button onClick={() => { setPreviewUrl(previewSrc); setPreviewDownloadUrl(downloadHref); setPreviewTitle(doc.title); }}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-[#4693C9]/40 hover:text-[#1D437F]">
                            <Eye size={12} /> Preview
                          </button>
                          {/* Download — visible to every user who can access this page */}
                          <a href={downloadHref} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-[#4693C9]/40 hover:text-[#1D437F]">
                            <Download size={12} /> Download
                          </a>
                          {hasPermission(user, "documents.delete") && (
                            <button onClick={() => setConfirmId(doc.id)}
                              className="flex items-center gap-1.5 rounded-lg border border-transparent bg-transparent px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:border-[#9F2E41]/20 hover:bg-[#9F2E41]/5 hover:text-[#9F2E41]">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
          <p className="text-xs text-slate-400">
            {total > 0 ? `Showing ${(page - 1) * 10 + 1}–${Math.min(page * 10, total)} of ${total}` : "No results"}
          </p>
          <div className="flex items-center gap-1.5">
            <button disabled={!hasPrev || loadingList} onClick={() => setPage((p) => p - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#4693C9]/40 hover:text-[#1D437F] disabled:opacity-35 disabled:cursor-not-allowed">
              <ChevronLeft size={14} />
            </button>
            <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-[#1D437F] px-2 text-xs font-bold text-white">{page}</span>
            <span className="text-xs text-slate-400">of {totalPages}</span>
            <button disabled={!hasNext || loadingList} onClick={() => setPage((p) => p + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#4693C9]/40 hover:text-[#1D437F] disabled:opacity-35 disabled:cursor-not-allowed">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {previewUrl && (
        <Portal>
          <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm">
            <div className="flex min-h-full items-start justify-center px-4 pb-8 pt-20">
              <div className="animate-slideUp flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ height: "80vh" }}>
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-[#1D437F] to-[#4693C9] px-5 py-3.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={16} className="shrink-0 text-white/70" />
                    <span className="truncate text-sm font-semibold text-white">{previewTitle}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <a href={previewDownloadUrl ?? "#"} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25">
                      <Download size={12} /> Download
                    </a>
                    <button onClick={() => { setPreviewUrl(null); setPreviewDownloadUrl(null); setPreviewTitle(""); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white">
                      <X size={15} />
                    </button>
                  </div>
                </div>
                <iframe src={previewUrl} className="flex-1 w-full bg-slate-100" />
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirmId !== null && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="animate-slideUp w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#9F2E41]/10">
                <Trash2 size={22} className="text-[#9F2E41]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Delete Document?</h3>
              <p className="mt-1.5 text-sm text-slate-400">This action cannot be undone.</p>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setConfirmId(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#9F2E41] py-2.5 text-sm font-bold text-white transition hover:bg-[#b8354a] disabled:opacity-60">
                  {deleting ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Trash2 size={14} />}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
