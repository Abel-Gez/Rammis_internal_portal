import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-rammisBlue-dark/80 to-rammisBlue/60">
        <div className="flex min-h-screen bg-gradient-to-br from-rammisBlue-dark/80 via-rammisBlue/80 to-rammisLightBlue/80">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-6 bg-slate-50/90">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
