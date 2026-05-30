import { ReactNode } from "react";

export default function InstructorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Decor - Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[50%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}