"use client";

import { useEffect, useState } from "react";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const theme = stored || (prefersDark ? "dark" : "light");

    document.documentElement.classList.add(theme);

    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <>{children}</>;
}