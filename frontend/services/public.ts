import publicApi from "./publicApi";
import api from "./api";

// Public data — uses unauthenticated axios so Django always filters
// to visibility_level = "Public" regardless of whether the visitor
// has an active session cookie.

export async function getPublicSlides() {
  const res = await publicApi.get("/hero/");
  return Array.isArray(res.data) ? res.data : res.data.results || [];
}

export async function getPublicNews(limit = 6) {
  const res = await publicApi.get(`/news/?page_size=${limit}`);
  return Array.isArray(res.data) ? res.data : res.data.results || [];
}

export async function getPublicVacancies(limit = 6) {
  const res = await publicApi.get(`/vacancies/vacancies/?page_size=${limit}`);
  return Array.isArray(res.data) ? res.data : res.data.results || [];
}

export async function getPublicDocuments(limit = 6) {
  const res = await publicApi.get(`/documents/?page_size=${limit}`);
  return Array.isArray(res.data) ? res.data : res.data.results || [];
}

// Departments — uses authenticated client (only staff need this in forms)
export async function getDepartments() {
  const res = await api.get("/departments/");
  return res.data.results || res.data || [];
}
