"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Activity, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Bell,
  BarChart3,
  UserCircle,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

// Define the shape of a navigation item
type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;


  let navItems: NavItem[] = [];


  const adminNavItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Projects",
      href: "/admin/projects",
      icon: FolderKanban,
    },
    {
      name: "Tasks",
      href: "/admin/tasks",
      icon: CheckSquare,
    },
    {
      name: "Team Members",
      href: "/admin/members",
      icon: Users,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      name: "Activity Logs",
      href: "/admin/activity",
      icon: Activity,
    },
    {
      name: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const managerNavItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/manager",
      icon: LayoutDashboard,
    },
    {
      name: "Manage Projects",
      href: "/manager/projects",
      icon: FolderKanban,
    },
    {
      name: "Tasks",
      href: "/manager/tasks",
      icon: CheckSquare,
    },
    {
      name: "My Team",
      href: "/manager/team",
      icon: Users,
    },
    {
      name: "Analytics",
      href: "/manager/analytics",
      icon: BarChart3,
    },
    {
      name: "Activity Logs",
      href: "/manager/activity",
      icon: Activity,
    },
    {
      name: "Notifications",
      href: "/manager/notifications",
      icon: Bell,
    },
  ];

  const memberNavItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/member",
      icon: LayoutDashboard,
    },
    {
      name: "My Tasks",
      href: "/member/tasks",
      icon: CheckSquare,
    },

    {
      name: "Notifications",
      href: "/member/notifications",
      icon: Bell,
    },
    {
      name: "Profile",
      href: "/member/profile",
      icon: UserCircle,
    },
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
    <aside className="w-64 bg-[var(--surface)] border-r border-[var(--border)] hidden md:flex flex-col shadow-sm z-10 sticky top-0 h-screen">
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)] shrink-0">
        <h2 className="text-xl font-bold text-[var(--primary)] flex items-center gap-2">
          <CheckSquare className="w-6 h-6" />
          Taskmate
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
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
