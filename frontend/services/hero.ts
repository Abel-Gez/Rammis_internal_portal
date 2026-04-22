import api from "./api";

export async function getHeroSlides() {
  const res = await api.get("/hero/");
  return res.data;
}