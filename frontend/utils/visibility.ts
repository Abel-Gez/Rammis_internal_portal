// The two visibility options used across all CMS forms.
// Public  (id=1) → visible to everyone including unauthenticated guests.
// Internal(id=2) → visible only to authenticated staff.
export const VISIBILITY_OPTIONS = [
  { id: 1, name: "Public" },
  { id: 2, name: "Internal" },
] as const;

export const DEFAULT_VISIBILITY = 1; // Public
