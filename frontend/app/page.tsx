export default function Home() {
  return (
    <div className="flex h-full flex-col items-start justify-center gap-6 rounded-3xl bg-gradient-to-br from-rammisBlue/10 via-white to-rammisLightBlue/10 p-10 shadow-sm">
      <div className="inline-flex items-center rounded-full bg-rammisBlue/10 px-4 py-1 text-xs font-semibold text-rammisBlue">
        Secure Admin Access
      </div>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        Welcome to Rammis Bank Internal Portal
      </h1>
      <p className="max-w-2xl text-sm md:text-base text-slate-600">
        Manage website content, reports, documents, vacancies, and internal
        communications in one secure, centralized dashboard. Use the navigation
        on the left to get started or jump to your most frequent tasks.
      </p>
    </div>
  );
}
