import { Footer, Navbar } from "./_components";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`font-sans antialiased bg-slate-50 text-slate-950`}>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </div>
  );
}
