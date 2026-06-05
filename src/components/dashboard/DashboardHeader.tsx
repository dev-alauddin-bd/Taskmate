import React, { ReactNode } from 'react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode; // optional actions such as button
}

export default function DashboardHeader({ title, subtitle, children }: DashboardHeaderProps) {
  return (
    <section className="flex items-center justify-between p-8 border border-[var(--border)] rounded-2xl">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-[var(--text-muted)]">{subtitle}</p>
        )}
      </div>
      {children && <div className="ml-4">{children}</div>}
    </section>
  );
}
