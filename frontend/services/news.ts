import api from "./api";

// ✅ GET NEWS (with search + pagination)
export async function getNews(search = "", page = 1) {
  const res = await api.get(`/news/?search=${search}&page=${page}`);
  return res.data;
}

// ✅ CREATE NEWS
export async function createNews(formData: FormData) {
  await api.get("/auth/csrf/");

  const res = await api.post("/news/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

// ✅ DELETE NEWS
export async function deleteNews(id: number) {
  await api.get("/auth/csrf/");
  await api.delete(`/news/${id}/`);
}

// ✅ UPDATE NEWS
export async function updateNews(id: number, formData: FormData) {
  await api.get("/auth/csrf/");

  const res = await api.put(`/news/${id}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}