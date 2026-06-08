"use client";

import { SessionProvider } from "next-auth/react";
import { ReactLenis } from "lenis/react";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
    <SessionProvider>
      <ReactLenis root>
        {children}
      </ReactLenis>
    </SessionProvider>
    </ThemeProvider>
  );
}
