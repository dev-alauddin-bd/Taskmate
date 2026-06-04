import React from 'react';

interface DashboardHeroProps {
  children?: React.ReactNode;
}

export default function DashboardHero({ children }: DashboardHeroProps) {
  return (
    <section className="py-8 bg-[var(--surface)] rounded-xl shadow-sm">
      {children}
    </section>
  );
}
