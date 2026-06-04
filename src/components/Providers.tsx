"use client";

import { SessionProvider } from "next-auth/react";
import { ReactLenis } from "lenis/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReactLenis root>
        {children}
      </ReactLenis>
    </SessionProvider>
  );
}
