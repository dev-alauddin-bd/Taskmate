"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* MOBILE SIDEBAR (drawer) */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* sidebar */}
          <div className="relative w-64 bg-[var(--surface)] h-full shadow-xl">
            <Sidebar onItemClick={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Navbar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}