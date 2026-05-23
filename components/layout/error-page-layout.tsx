import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility for class merging

interface ErrorPageLayoutProps {
  statusCode: string;
  title: string;
  message: string;
  icon: React.ElementType; // Lucide icon component
  buttonText?: string;
  buttonLink?: string;
  showHomeButton?: boolean;
}

export function ErrorPageLayout({
  statusCode,
  title,
  message,
  icon: Icon,
  buttonText = "Về trang chủ",
  buttonLink = "/",
  showHomeButton = true,
}: ErrorPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-slate-50 text-slate-950">
      <Icon className="w-20 h-20 md:w-24 md:h-24 text-indigo-600 mb-8 animate-in fade-in slide-in-from-top-10 duration-700" />
      <p className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.1] mb-4 text-indigo-600 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100">
        {statusCode}
      </p>
      <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
        {title}
      </h1>
      <p className="max-w-md text-lg text-slate-500 font-medium mb-10 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
        {message}
      </p>
      {showHomeButton && (
        <Link href={buttonLink} passHref>
          <Button size="lg" className="h-12 px-8 rounded-xl bg-indigo-600 font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 animate-in fade-in zoom-in-95 duration-700 delay-400">
            {buttonText}
          </Button>
        </Link>
      )}
    </div>
  );
}