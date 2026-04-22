"use client";

import { use, useEffect, useState } from "react";
import { getDocuments, createDocument } from "@/services/documents";
import useAuthGuard from "@/hooks/useAuthGuard";
import { hasPermission } from "@/utils/permissions";
import { useUser } from "@/hooks/useUser";
import { deleteDocument } from "@/services/documents";

export default function DocumentsPage() {
  useAuthGuard("documents.view");

  // ✅ STATE (ALL AT TOP)
  const [documents, setDocuments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const user = useUser();
  const [loadingList, setLoadingList] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ✅ FETCH DOCUMENTS
  const fetchDocuments = async () => {
    try {
      setLoadingList(true);

      const data = await getDocuments(search, page);

      // ✅ HANDLE PAGINATED RESPONSE (DRF STANDARD)
      setDocuments(data.results || []);
      setTotal(data.count || 0);
      setNext(data.next || null);
      setPrevious(data.previous || null);
    } catch (err) {
      console.error(err);

      // fallback safety
      setDocuments([]);
      setTotal(0);
      setNext(null);
      setPrevious(null);
    } finally {
      setLoadingList(false);
    }
  };

  // ✅ LOAD ON PAGE
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDocuments();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  // ✅ UPLOAD FUNCTION
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      setUploading(true);
      await createDocument(formData);
      setTitle("");
      setFile(null);
      await fetchDocuments();
    } catch (err: any) {
      console.error("UPLOAD ERROR:", err.response?.data);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await deleteDocument(id);
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Documents</h1>
            <p className="text-sm text-slate-500">
              Upload, search, and manage internal documents in one place.
            </p>
          </div>

          {/* Search */}
          <div className="w-full sm:w-72">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Upload Card */}
        {hasPermission(user, "documents.create") && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-slate-900">
                  Upload new document
                </h2>
                <p className="text-xs text-slate-500">
                  PDF, Word, Excel or images up to 10MB.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleUpload}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <input
                type="text"
                placeholder="Document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />

              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              />

              <button
                type="submit"
                disabled={!title || !file || uploading}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </form>
          </div>
        )}

        {/* Table Card */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-medium text-slate-800">
              Documents list
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loadingList && documents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-sm text-slate-500"
                    >
                      Loading documents…
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No documents found. Try adjusting your search or upload a
                      new document.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="max-w-xs truncate px-4 py-3 text-slate-900">
                        {doc.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {doc.document_type || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setPreviewUrl(
                                `http://127.0.0.1:8000/api/files/download/documents/${doc.id}/`,
                              )
                            }
                            className="inline-flex items-center rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                          >
                            Preview
                          </button>
                          {hasPermission(user, "documents.view") && (
                            <a
                              href={`http://127.0.0.1:8000/api/files/download/documents/${doc.id}/`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Download
                            </a>
                          )}

                          {hasPermission(user, "documents.delete") && (
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="inline-flex items-center rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                Showing {documents.length} of {total} documents
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={!previous || loadingList}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Previous
                </button>

                <span className="text-xs text-slate-600">Page {page}</span>

                <button
                  disabled={!next || loadingList}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-[90%] h-[90%] bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 z-10 bg-white border px-3 py-1 text-sm rounded-md shadow"
            >
              Close
            </button>

            {/* Preview Content */}
            <iframe src={previewUrl} className="w-full h-full" />
          </div>
        </div>
      )}
    </div>
  );
}
