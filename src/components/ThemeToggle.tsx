"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Initialize from localStorage / prefers-color-scheme
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const stored = localStorage.getItem("theme");
    const dark = stored ? stored === "dark" : prefersDark;
    setIsDark(dark);
    setMounted(true);
  }, []);

  const updateRootClass = (dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark", "dark-theme");
      root.classList.remove("light", "light-theme");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.add("light", "light-theme");
      root.classList.remove("dark", "dark-theme");
      root.setAttribute("data-theme", "light");
    }
  };

  const toggle = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    updateRootClass(newVal);
    localStorage.setItem("theme", newVal ? "dark" : "light");
  };

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center p-2 rounded-full hover:bg-[var(--surface-hover)] transition-colors"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-[var(--foreground)]" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--foreground)]" />
      )}
    </button>
  );
}
