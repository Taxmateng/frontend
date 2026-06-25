import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { AdminRedirectGuard } from "@/components/AdminRedirectGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-sans text-[#252a24]">
      <AdminRedirectGuard />
      <Sidebar />

      <div className="min-h-screen lg:pl-[280px]">
        <TopBar />

        <main className="px-5 pb-10 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
