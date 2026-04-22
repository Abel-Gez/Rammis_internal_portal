"use client";

import { useUser } from "@/hooks/useUser";

export default function ProfilePage() {
  const user = useUser();

  if (user === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
          Loading profile…
        </div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
          Not logged in.
        </div>
      </div>
    );
  }

  const initials = (user.full_name || user.username || "?")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 sm:flex-row">
        {/* Left: avatar + basic info */}
        <div className="flex w-full flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:max-w-xs">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rammisLightBlue text-lg font-semibold text-white">
              {initials}
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900">
                {user.full_name || user.username}
              </h1>
              <p className="text-xs text-slate-500">
                {user.role || "Staff member"}
              </p>
              {user.department && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {user.department}
                </p>
              )}
            </div>
          </div>

          <div className="mt-2 rounded-lg bg-rammisLightBlue/30 px-3 py-2 text-xs text-black-50">
            Signed in as <span className="font-medium">{user.username}</span>.
            Keep your account details up to date.
          </div>
        </div>

        {/* Right: detailed fields */}
        <div className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">
            Profile information
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Basic details used across the internal portal.
          </p>

          <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Username
              </dt>
              <dd className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-slate-800">
                {user.username}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Full name
              </dt>
              <dd className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-slate-800">
                {user.full_name || "-"}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Email
              </dt>
              <dd className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-slate-800">
                {user.email || "-"}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Role
              </dt>
              <dd className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-slate-800">
                {user.role || "-"}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Department
              </dt>
              <dd className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-slate-800">
                {user.department || "-"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
