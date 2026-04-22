import { getCSRFToken } from "@/utils/csrf";
import api from "./api";

export async function getDocuments(search = "", page = 1) {
  const res = await api.get(`/documents/?search=${search}&page=${page}`);
  return res.data;
}

export async function createDocument(formData: FormData) {

  await api.get("/auth/csrf/"); // Ensure CSRF cookie is set

  const csrfToken = getCSRFToken();

  const res = await api.post("/documents/", formData, {
    headers: {
      "X-CSRFToken": csrfToken || "",
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function deleteDocument(id: number) {
  await api.get("/auth/csrf/"); // Ensure CSRF cookie is set
  const csrfToken = getCSRFToken();
  
  const res = await api.delete(`/documents/${id}/`, {
    headers: {
      "X-CSRFToken": csrfToken || "",
    },
  });
  return res.data;
}