import { AdminNavbar } from "../_components/admin-navbar";
import { AdminSidebar } from "../_components/admin-sidebar";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Cố định bên trái trên Desktop */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-50">
        <AdminSidebar />
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1">
        <AdminNavbar />
        <main className="p-6 md:p-8 animate-in fade-in duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}