import api from "./api";

// READ
export async function getHeroSlides() {
  const res = await api.get("/hero/");
  return res.data;
}

// CREATE
export async function createHeroSlide(data: any) {
  const res = await api.post("/hero/", data);
  return res.data;
}

// UPDATE
export const updateHeroSlide = (id: number, data: FormData) =>
  api.patch(`/hero/${id}/`, data);  // ✅ PATCH NOT PUT

// DELETE
export async function deleteHeroSlide(id: number) {
  await api.delete(`/hero/${id}/`);
}

