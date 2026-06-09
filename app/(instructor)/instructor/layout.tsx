import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
      {/* Sidebar - Cố định trên Desktop */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-50 border-r border-slate-200 bg-white/90 backdrop-blur-md">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 w-full">
        <Navbar />
        <main className="p-6 lg:p-8 animate-in fade-in duration-1000 ease-out">
          {children}
        </main>
      </div>
    </div>
  );
}