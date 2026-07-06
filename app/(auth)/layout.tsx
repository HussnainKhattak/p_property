import Link from "next/link";
import { Building2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center px-4 py-12 bg-background">
      {/* Subtle radial background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md flex flex-col gap-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 mx-auto group">
          <div className="p-2.5 rounded-xl bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-105">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="font-black text-2xl tracking-tight">
            Peshawar <span className="text-primary">Property</span> Hub
          </span>
        </Link>

        {/* Card */}
        <div className="w-full bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/10">
          {children}
        </div>
      </div>
    </div>
  );
}
