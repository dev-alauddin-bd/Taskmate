"use client";

import { useEffect } from "react";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const theme = stored || (prefersDark ? "dark" : "light");
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark", "dark-theme");
      root.classList.remove("light", "light-theme");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.add("light", "light-theme");
      root.classList.remove("dark", "dark-theme");
      root.setAttribute("data-theme", "light");
    }
  }, []);

  return <>{children}</>;
}