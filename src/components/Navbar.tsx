"use client";

import { signOut, useSession } from "next-auth/react";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";


export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {

  const { data: session } = useSession();

  const avatar = session?.user?.avatar;

  const initials =
    session?.user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="h-16 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        <ThemeToggle />

        <div className="flex items-center gap-3 pl-4 border-l border-[var(--border)]">

          {/* USER INFO */}
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-[var(--foreground)] leading-none">
              {session?.user?.name || "Loading..."}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
              {session?.user?.role || "Role"}
            </p>
          </div>

          {/* AVATAR */}
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--surface-hover)] flex items-center justify-center font-bold ring-2 ring-[var(--surface)] shadow-sm">

            {avatar ? (
              <img
                src={avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[var(--primary)]">
                {initials}
              </span>
            )}

          </div>

          {/* LOGOUT BUTTON */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="
              p-2 rounded-full
              bg-red-500/10
              text-red-500
              hover:bg-red-500
              hover:text-white
              transition-colors
              ml-1
            "
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>

        </div>
      </div>
    </header>
  );
}