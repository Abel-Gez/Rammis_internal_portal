import api from "./api";

export async function getQuickLinks() {
  const res = await api.get("/quick-links/");
  return res.data;
}