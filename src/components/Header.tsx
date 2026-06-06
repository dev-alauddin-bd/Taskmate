"use client";

import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)]">
      <Link href="/" className="text-xl font-bold text-[var(--foreground)] transition-colors hover:text-[var(--primary)]">
        Taskmate
      </Link>
      {/* Navigation can be expanded as needed */}
      <nav className="flex gap-4">
        <Link href="/projects" className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
          Projects
        </Link>
        <Link href="/dashboard" className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
          Dashboard
        </Link>
      </nav>
      <LocaleSwitcher />
    </header>
  );
}
