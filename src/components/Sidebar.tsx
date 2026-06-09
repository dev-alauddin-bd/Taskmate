"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Activity,
  Settings,
  Bell,
  BarChart3,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { type LucideIcon } from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export function Sidebar({ onItemClick }: { onItemClick?: () => void } = {}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "GUEST";

  let navItems: NavItem[] = [];

  const adminNavItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/dashboard/admin/projects", icon: FolderKanban },
    { name: "Tasks", href: "/dashboard/admin/tasks", icon: CheckSquare },
    { name: "Team Members", href: "/dashboard/admin/members", icon: Users },
    { name: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
    { name: "Activity Logs", href: "/dashboard/admin/activity", icon: Activity },
    { name: "Notifications", href: "/dashboard/admin/notifications", icon: Bell },
    { name: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ];

  const managerNavItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Projects", href: "/dashboard/manager/projects", icon: FolderKanban },
    { name: "Task Management", href: "/dashboard/manager/tasks", icon: CheckSquare },
    { name: "Team Members", href: "/dashboard/manager/team", icon: Users },
    { name: "Analytics", href: "/dashboard/manager/analytics", icon: BarChart3 },
    { name: "Notifications", href: "/dashboard/manager/notifications", icon: Bell },
  ];

  const memberNavItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Tasks", href: "/dashboard/member/tasks", icon: CheckSquare },
    { name: "Notifications", href: "/dashboard/member/notifications", icon: Bell },
    { name: "Profile", href: "/dashboard/member/profile", icon: UserCircle },
  ];

  switch (role) {
    case "ADMIN":
      navItems = adminNavItems;
      break;
    case "PROJECT_MANAGER":
    case "MANAGER":
      navItems = managerNavItems;
      break;
    case "MEMBER":
      navItems = memberNavItems;
      break;
    default:
      navItems = [];
  }

  return (
    <aside className="w-64 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col h-full">

      {/* TOP LOGO */}
      <Link href="/dashboard" onClick={onItemClick}>
        <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--primary)] flex items-center gap-2">
            <CheckSquare className="w-6 h-6" />
            Taskmate
          </h2>
        </div>
      </Link>

      {/* NAV ITEMS */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">

        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}

      </nav>

      {/* BOTTOM LOGOUT */}
      <div className="p-4 border-t border-[var(--border)]">

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="
            flex items-center gap-3 w-full
            px-3 py-2.5 rounded-lg
            text-red-500
            hover:bg-red-500
            hover:text-white
            transition-all
          "
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

      </div>

    </aside>
  );
}