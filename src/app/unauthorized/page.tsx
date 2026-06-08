import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Unauthorized() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background)] p-6">
      
      {/* Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-2xl shadow-2xl p-8 text-center">
        
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[var(--danger)]/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-[var(--primary)]/20 blur-3xl" />

        {/* Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--danger)]/10 text-[var(--danger)] animate-pulse">
          <ShieldAlert size={32} />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[var(--danger)] mb-3">
          Unauthorized Access
        </h1>

        {/* Description */}
        <p className="text-[var(--foreground)]/80 leading-relaxed mb-6">
          You don’t have permission to view this page.  
          Please sign in with an authorized account or return to dashboard.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 font-semibold text-white hover:bg-[var(--primary-hover)] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition"
          >
            Login
          </Link>

        </div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-[var(--foreground)]/50">
          If you believe this is a mistake, contact your administrator.
        </p>
      </div>
    </section>
  );
}