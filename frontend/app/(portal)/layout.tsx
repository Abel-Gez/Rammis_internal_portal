import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        {/*
          Step 3: The <main> is position:relative so the pattern div can sit
          absolutely behind all page content without affecting layout.
        */}
        <main className="relative flex-1 overflow-y-auto p-6">
          {/* Islamic geometric pattern — absolute, pointer-events:none so it
              never interferes with clicks or scrolling */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 pattern-light"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.6) 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.6) 100%)",
            }}
          />
          {children}
        </main>
      </div>
    </div>
  );
}
