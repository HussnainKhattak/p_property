import Link from "next/link";
import { ShieldAlert, ArrowLeft, LayoutDashboard, Home } from "lucide-react";

export const metadata = {
  title: "403 - Access Denied | Peshawar Property Hub",
  description: "You do not have permission to view this page.",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-background">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6 animate-in fade-in duration-300">
        {/* Warning Icon Badge */}
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-inner">
          <ShieldAlert className="h-8 w-8" />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-red-500">
            Error 403
          </span>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Access Denied
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">
            You do not have administrative privileges to access this area. If you believe this is an error, please contact support or sign in with an administrator account.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2 border-t border-border/60">
          <Link
            href="/"
            className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-bold text-foreground hover:bg-accent transition-colors"
          >
            <Home className="h-4 w-4" />
            Home Page
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/95 transition-colors shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
