"use client";
import { signOut, useSession } from "next-auth/react";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="flex items-center gap-3 pl-4 border-l border-[var(--border)]">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-[var(--foreground)] leading-none">
              {session?.user?.name || "Loading..."}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
              {session?.user?.role || "Role"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-bold ring-2 ring-[var(--surface)] shadow-sm">
            <UserIcon className="w-5 h-5" />
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-full transition-colors ml-1"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
