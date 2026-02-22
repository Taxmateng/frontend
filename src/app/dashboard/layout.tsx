import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopBar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
