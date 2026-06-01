export default function PartnersLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans antialiased overflow-x-hidden overflow-x-hidden">
        {/* Navbar Placeholder */}
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-xl uppercase tracking-tighter text-indigo-600">
              Uniwise Partners
            </div>
            <button className="text-xs font-black uppercase tracking-widest bg-slate-900 text-white px-6 py-2.5 rounded-xl transition-all active:scale-95">
              Liên hệ
            </button>
          </div>
        </nav>
        {children}
      </div>
    );
  }