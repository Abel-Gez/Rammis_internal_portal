"use client";

import { useEffect, useState } from "react";
import useAuthGuard from "@/hooks/useAuthGuard";
import { getNews, createNews, updateNews, deleteNews } from "@/services/news";
import { hasPermission } from "@/utils/permissions";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function NewsPage() {
  const user = useAuthGuard("news.view");

  const [newsList, setNewsList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [publishedDate, setPublishedDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // form fields

  // ✅ FETCH NEWS
  const fetchNews = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getNews(search, page);

      const list = Array.isArray(data) ? data : data.results || [];

      setNews(list);
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.warn("Page not found, resetting to page 1");
        fetchNews(1); // fallback
      } else {
        console.error(err);
        setNews([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOAD DATA
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchNews();
    }, 300);

    return () => clearTimeout(delay);
  }, [search, page]);

  // ✅ CREATE NEWS
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!title || !content) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);
    if (publishedDate) {
      formData.append("published_date", publishedDate); // ✅ correct format
    }

    if (isEditMode && selectedNews?.id) {
      await updateNews(selectedNews.id, formData);
    } else {
      await createNews(formData);
    }

    resetForm();
    setIsModalOpen(false);
    fetchNews();
  };

  const handleView = (n: any) => {
    setSelectedNews(n);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (n: any) => {
    setSelectedNews(n);
    setTitle(n.title);
    setContent(n.content);
    setPublishedDate(n.published_date || "");
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const openDelete = (id: number) => {
    setSelectedDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDeleteId) return;

    try {
      setDeleting(true);
      await deleteNews(selectedDeleteId); // 👈 make sure this exists
      fetchNews();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setSelectedDeleteId(null);
    }
  };
  // ✅ DELETE
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this news?")) return;

    try {
      await deleteNews(id);
      fetchNews();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImage(null);
    setPublishedDate("");
    setSelectedNews(null);
    setIsEditMode(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">News</h1>

          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        {/* CREATE NEWS */}
        {hasPermission(user, "news.create") && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded shadow space-y-3"
          >
            <h2 className="font-medium">Create News</h2>

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <input
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              type="file"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full border p-2 rounded"
            />

            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {uploading ? "Posting..." : "Post"}
            </button>
          </form>
        )}

        {/* NEWS LIST */}
        <div className="space-y-4">
          {loading ? (
            <p>Loading...</p>
          ) : news.length === 0 ? (
            <p>No news found</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  {n.image && (
                    <img
                      src={n.image}
                      className="h-40 w-full object-cover rounded-lg mb-3"
                    />
                  )}

                  <h2 className="font-semibold text-slate-900">{n.title}</h2>

                  <p className="text-xs text-slate-500 mt-1">
                    {n.published_date}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleView(n)}
                      className="text-xs text-blue-600"
                    >
                      View
                    </button>

                    {hasPermission(user, "news.change") && (
                      <button
                        onClick={() => handleEdit(n)}
                        className="text-xs text-yellow-600"
                      >
                        Edit
                      </button>
                    )}

                    {hasPermission(user, "news.delete") && (
                      <button
                        onClick={() => openDelete(n.id)}
                        className="text-xs text-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>

          <span>Page {page}</span>

          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => {
          resetForm();
          setIsModalOpen(false);
        }}
        title={
          isEditMode
            ? "Edit News"
            : selectedNews
              ? "News Details"
              : "Create News"
        }
      >
        {isEditMode || !selectedNews ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full border p-2 rounded"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
              className="w-full border p-2 rounded"
            />

            <input
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              type="file"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />

            <button className="w-full bg-blue-600 text-white py-2 rounded">
              {isEditMode ? "Update" : "Create"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">{selectedNews.title}</h1>
            <p className="text-sm text-slate-600 whitespace-pre-line">
              {selectedNews.content}
            </p>
          </div>
        )}
      </Modal>
      <ConfirmModal
        open={confirmOpen}
        title="Delete News"
        message="Are you sure you want to delete this news?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedDeleteId(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
