"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Activity, Settings } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Team", href: "/team", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },

  ];

  return (
    <aside className="w-64 bg-[var(--surface)] border-r border-[var(--border)] hidden md:flex flex-col shadow-sm z-10 sticky top-0 h-screen">
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)] shrink-0">
        <h2 className="text-xl font-bold text-[var(--primary)] flex items-center gap-2">
          <CheckSquare className="w-6 h-6" />
          Taskmate
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium shadow-sm" 
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] hover:translate-x-1"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
