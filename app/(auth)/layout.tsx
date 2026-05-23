import "@/app/globals.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`font-sans antialiased bg-slate-50 text-slate-950`}>
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
