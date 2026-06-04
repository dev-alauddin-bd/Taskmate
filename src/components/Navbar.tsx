"use client";
import { signOut, useSession } from "next-auth/react";
import { Menu, LogOut, User as UserIcon, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Check initial theme
    if (document.documentElement.getAttribute("data-theme") === "dark") {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const el = document.documentElement;
    if (theme === "dark") {
      el.removeAttribute("data-theme");
      setTheme("light");
    } else {
      el.setAttribute("data-theme", "dark");
      setTheme("dark");
    }
  };

  return (
    <header className="h-16 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme} 
          className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] rounded-full hover:bg-[var(--surface-hover)] transition-all duration-200"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

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
