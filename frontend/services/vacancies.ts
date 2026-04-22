import api from "./api";

// GET
export async function getVacancies(search = "", page = 1) {
  const res = await api.get(`/vacancies/vacancies/?search=${search}&page=${page}`);
  return res.data;
}

// CREATE
export async function createVacancy(data: any) {
  const res = await api.post("/vacancies/vacancies/", data);
  return res.data;
}

// DELETE
export async function deleteVacancy(id: number) {
  await api.delete(`/vacancies/vacancies/${id}/`);
}

// GET Employment Types
export async function getEmploymentTypes() {
  const res = await api.get("/vacancies/employment-types/");
  return res.data;
}

// UPDATE
export async function updateVacancy(id: number, data: any) {
  const res = await api.patch(`/vacancies/vacancies/${id}/`, data);
  return res.data;
}