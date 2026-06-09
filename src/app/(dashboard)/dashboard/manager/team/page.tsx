import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import KpiCard from "@/components/shared/KpiCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function ManagerTeamPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="p-6 text-red-500 font-medium">
        Unauthorized Access
      </div>
    );
  }

  const projects = await prisma.project.findMany({
    where: {
      managerId: session.user.id,
      isDeleted: false,
    },
    include: {
      members: { include: { user: true } },
      _count: { select: { members: true, tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

 return (
  <div className="space-y-6">

  <DashboardHeader title="Projects Team Members" subtitle="Manage teams, members & workload efficiently"/>

    {/* ================= 2. KPI CARDS ================= */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <KpiCard
        title="Total Projects"
        value={projects.length}
        icon={<span>📁</span>}
        color="var(--primary)"
      />

      <KpiCard
        title="Total Members"
        value={projects.reduce((a, p) => a + p._count.members, 0)}
        icon={<span>👥</span>}
        color="var(--success)"
      />

      <KpiCard
        title="Total Tasks"
        value={projects.reduce((a, p) => a + p._count.tasks, 0)}
        icon={<span>📌</span>}
        color="var(--info)"
      />
    </div>



    {/* ================= 4. CARDS GRID ================= */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      {projects.map((project) => (
        <div
          key={project.id}
          className="
            rounded-2xl border border-[var(--border)]
            bg-[var(--surface)]
            p-5
            shadow-sm
            hover:shadow-xl hover:-translate-y-1
            transition-all duration-300
            flex flex-col gap-5
          "
        >

          {/* PROJECT INFO */}
          <div>
            <h2 className="text-lg font-semibold">
              {project.name}
            </h2>
            <p className="text-sm text-[var(--text-muted)] line-clamp-2">
              {project.description || "No description"}
            </p>
          </div>

          {/* STATS */}
          <div className="flex justify-between text-xs">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600">
              👥 {project._count.members}
            </span>

            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600">
              📌 {project._count.tasks}
            </span>
          </div>

          {/* MEMBERS */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">

            {project.members.map((m) => (
              <div
                key={m.id}
                className="
                  flex justify-between items-center
                  p-3 rounded-xl
                  border border-[var(--border)]
                  bg-[var(--surface-hover)]
                  hover:bg-[var(--primary-light)]
                  transition
                "
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {m.user.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {m.user.email}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800">
                    {m.role}
                  </span>

                  <p className="text-xs text-green-500">
                    {m.user.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      ))}
    </div>

  </div>
);
}