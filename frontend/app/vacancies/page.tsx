"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  getVacancies,
  createVacancy,
  deleteVacancy,
  getEmploymentTypes,
  updateVacancy,
} from "@/services/vacancies";
import useAuthGuard from "@/hooks/useAuthGuard";
import { hasPermission } from "@/utils/permissions";
import api from "@/services/api";

export default function VacanciesPage() {
  type EmploymentType = {
    id: number;
    name: string;
  };

  type Department = {
    id: number;
    name: string;
  };

  type VisibilityLevel = {
    id: number;
    name: string;
  };

  const user = useAuthGuard("vacancies.view");

  const [visibilityLevels, setVisibilityLevels] = useState<VisibilityLevel[]>(
    [],
  );
  const [visibility, setVisibility] = useState<number | null>(null);

  const [types, setTypes] = useState<EmploymentType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [department, setDepartment] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<number | null>(null);
  const [deadline, setDeadline] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMeta = async () => {
    const vis = await api.get("/access-control/visibility-levels/");
    const list = vis.data.results || vis.data;
    const deps = await api.get("/departments/");

    setVisibilityLevels(list);
    setDepartments(deps.data.results || deps.data);
    const publicLevel = list.find((v: any) => v.name === "public");
    if (publicLevel) setVisibility(publicLevel.id);
  };

  const fetchVacancies = async () => {
    try {
      setLoading(true);

      const data = await getVacancies(search);

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : [];

      setVacancies(list);
    } catch (err) {
      console.error(err);
      setVacancies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchVacancies();
      fetchMeta();
      fetchTypes();
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  const fetchTypes = async () => {
    try {
      const data = await getEmploymentTypes();
      console.log("Employment Types:", data); // 👈 ADD THIS
      setTypes(data.results || data);
    } catch (err) {
      console.error("Error fetching types:", err);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let finalVisibility: number | null = visibility;

    if (!finalVisibility) {
      const publicLevel = visibilityLevels.find(
        (v: any) => v.name.toLowerCase() === "public",
      );

      if (!publicLevel) {
        console.error(
          "Public visibility level not found. Please ensure it exists in the system.",
        );
        return;
      }

      finalVisibility = publicLevel.id; // ✅ no optional chaining now
    }

    const payload = {
      title,
      location,
      description,
      requirements,
      responsibilities,
      employment_type: type,
      visibility_level: finalVisibility,
      department: department || null,
      application_deadline: deadline || null,
    };

    console.log("Submitting vacancy:", payload);

    try {
      if (isEditMode && selectedVacancy) {
        // ✏️ UPDATE
        await updateVacancy(selectedVacancy.id, payload);
      } else {
        // ➕ CREATE
        await createVacancy(payload);
      }

      // ✅ reset form
      setTitle("");
      setLocation("");
      setType(null);
      setVisibility(null);
      setDepartment(null);
      setDeadline("");

      setIsModalOpen(false);
      fetchVacancies();
    } catch (err) {
      console.error("Error submitting vacancy:", err);
    }
  };

  const handleView = (vacancy: any) => {
    setSelectedVacancy(vacancy);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (v: any) => {
    setSelectedVacancy(v);
    setIsEditMode(true);
    setIsModalOpen(true);

    setTitle(v.title || "");
    setLocation(v.location || "");
    setDescription(v.description || "");
    setRequirements(v.requirements || "");
    setResponsibilities(v.responsibilities || "");
    setType(v.employment_type || null);
    setVisibility(v.visibility_level || null);
    setDepartment(v.department || null);
    setDeadline(v.application_deadline || "");
  };

  const resetForm = () => {
    setTitle("");
    setLocation("");
    setDescription("");
    setRequirements("");
    setResponsibilities("");
    setType(null);
    setVisibility(null);
    setDepartment(null);
    setDeadline("");

    setSelectedVacancy(null);
    setIsEditMode(false);
  };

  const handleDelete = async (id: number) => {
    await deleteVacancy(id);
    fetchVacancies();
  };

  const confirmDelete = async () => {
    if (!selectedDeleteId) return;

    try {
      setDeleting(true);
      await deleteVacancy(selectedDeleteId);
      fetchVacancies();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setSelectedDeleteId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Vacancies</h1>

      {/* CREATE
      {hasPermission(user, "vacancies.create") && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <input
            placeholder="Job title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border p-2 text-sm"
          />

          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-lg border p-2 text-sm"
          />

          <select
            value={type || ""}
            onChange={(e) => setType(Number(e.target.value))}
            className="rounded-lg border p-2 text-sm"
          >
            <option value="">Select type</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="rounded-lg border p-2 text-sm"
          />

          <select
            value={visibility || ""}
            onChange={(e) => setVisibility(Number(e.target.value))}
            className="rounded-lg border p-2 text-sm"
          >
            <option value="">Visibility</option>
            {visibilityLevels.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <button className="rounded-lg bg-rammisLightBlue text-white text-sm px-4 py-2 hover:bg-rammisBlue">
            Create
          </button>
        </form>
      )} */}

      {hasPermission(user, "vacancies.create") && (
        <button
          onClick={() => {
            resetForm();
            setIsEditMode(false);
            setIsModalOpen(true);
          }}
          className="rounded-lg bg-rammisLightBlue text-white px-4 py-2 text-sm hover:bg-rammisBlue"
        >
          + Create Vacancy
        </button>
      )}

      <input
        placeholder="Search vacancies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border p-2 text-sm mb-4"
      />
      {/* LIST */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center text-slate-500 py-10">
            Loading vacancies...
          </div>
        ) : vacancies.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 py-10">
            No vacancies available.
          </div>
        ) : (
          vacancies.map((v) => (
            <div
              key={v.id}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Title */}
              <h2 className="text-lg font-semibold text-slate-900 line-clamp-2">
                {v.title}
              </h2>

              {/* Meta */}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {v.employment_type_name && (
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">
                    {v.employment_type_name}
                  </span>
                )}

                {v.location && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                    📍 {v.location}
                  </span>
                )}
              </div>

              {/* Deadline */}
              {v.application_deadline && (
                <p className="mt-3 text-xs text-red-500">
                  Deadline:{" "}
                  {new Date(v.application_deadline).toLocaleDateString()}
                </p>
              )}

              {/* Actions */}
              <div className="mt-4 flex justify-between items-center">
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => handleView(v)}
                >
                  View Details
                </button>

                {hasPermission(user, "vacancies.change") && (
                  <button
                    onClick={() => handleEdit(v)}
                    className="text-xs text-yellow-600 hover:underline"
                  >
                    Edit
                  </button>
                )}

                {hasPermission(user, "vacancies.delete") && (
                  <button
                    onClick={() => {
                      setSelectedDeleteId(v.id);
                      setConfirmOpen(true);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => {
          resetForm();
          setIsModalOpen(false);
        }}
        title={
          isEditMode
            ? "Edit Vacancy"
            : selectedVacancy
              ? "Vacancy Details"
              : "Create Vacancy"
        }
      >
        {isEditMode || !selectedVacancy ? (
          // ================= EDIT FORM =================
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job Title"
              className="w-full border rounded-lg p-2"
            />

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full border rounded-lg p-2"
            />

            <select
              value={type || ""}
              onChange={(e) => setType(Number(e.target.value))}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Employment Type</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={visibility || ""}
              onChange={(e) => setVisibility(Number(e.target.value))}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Visibility</option>
              {visibilityLevels.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border rounded-lg p-2"
            />

            {/* NEW FIELDS */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full border rounded-lg p-2"
            />

            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Requirements"
              className="w-full border rounded-lg p-2"
            />

            <textarea
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              placeholder="Responsibilities"
              className="w-full border rounded-lg p-2"
            />

            <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
              {isEditMode ? "Update Vacancy" : "Create Vacancy"}
            </button>
          </form>
        ) : (
          // ================= VIEW MODE =================
          <div className="space-y-5">
            {/* TITLE */}
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                {selectedVacancy.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Posted on{" "}
                {new Date(selectedVacancy.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* BADGES */}
            <div className="flex flex-wrap gap-2">
              {selectedVacancy.employment_type_name && (
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {selectedVacancy.employment_type_name}
                </span>
              )}

              {selectedVacancy.location && (
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                  📍 {selectedVacancy.location}
                </span>
              )}
            </div>

            {/* DEADLINE */}
            {selectedVacancy.application_deadline && (
              <div className="text-sm text-red-500">
                Deadline:{" "}
                {new Date(
                  selectedVacancy.application_deadline,
                ).toLocaleDateString()}
              </div>
            )}

            {/* DESCRIPTION */}
            {selectedVacancy.description && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  Description
                </h3>
                <p className="text-sm text-slate-600 whitespace-pre-line">
                  {selectedVacancy.description}
                </p>
              </div>
            )}

            {/* REQUIREMENTS */}
            {selectedVacancy.requirements && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  Requirements
                </h3>
                <p className="text-sm text-slate-600 whitespace-pre-line">
                  {selectedVacancy.requirements}
                </p>
              </div>
            )}

            {/* RESPONSIBILITIES */}
            {selectedVacancy.responsibilities && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  Responsibilities
                </h3>
                <p className="text-sm text-slate-600 whitespace-pre-line">
                  {selectedVacancy.responsibilities}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
      <ConfirmModal
        open={confirmOpen}
        title="Delete Vacancy"
        message="This action cannot be undone. Are you sure you want to delete this vacancy?"
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
