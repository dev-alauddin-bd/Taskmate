import React from "react";

type Props = {
  role: "ADMIN" | "MANAGER" | "MEMBER";
};

export default function DashboardRolePage({ role }: Props) {
  const titles: Record<Props["role"], string> = {
    ADMIN: "Admin Dashboard",
    MANAGER: "Manager Dashboard",
    MEMBER: "Member Dashboard",
  };

  const descriptions: Record<Props["role"], string> = {
    ADMIN: "This page provides admin‑only tools for managing projects, users, and analytics.",
    MANAGER: "This page provides manager‑specific tools for overseeing projects, tasks, and team members.",
    MEMBER: "This page offers member‑specific views for your assigned tasks and projects.",
  };

  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold mb-4 text-[var(--primary)] animate-fade-in">
        {titles[role]}
      </h1>
      <p className="text-lg text-[var(--text-muted)]">
        {descriptions[role]}
      </p>
    </section>
  );
}
