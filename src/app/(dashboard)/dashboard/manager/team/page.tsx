import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function ManagerTeamPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div className="p-6 text-red-500">Unauthorized</div>;
  }

  const projects = await prisma.project.findMany({
    where: {
      managerId: session.user.id,
      isDeleted: false,
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          members: true,
          tasks: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Project Teams</h1>
        <p className="text-sm text-gray-500">
          Manage all your project teams in one place
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl border glass-panel p-5 flex flex-col gap-4"
          >
            {/* PROJECT HEADER */}
            <div>
              <h2 className="text-lg font-semibold">
                {project.name}
              </h2>
              <p className="text-sm text-gray-500 line-clamp-2">
                {project.description}
              </p>
            </div>

            {/* STATS */}
            <div className="flex justify-between text-sm">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                Members: {project._count.members}
              </span>

              <span className="px-3 py-1 rounded-full bg-green-50 text-green-600">
                Tasks: {project._count.tasks}
              </span>
            </div>

            {/* MEMBERS LIST */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {project.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-lg glass-panel"
                >
                  {/* LEFT */}
                  <div>
                    <p className="text-sm font-medium">
                      {m.user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {m.user.email}
                    </p>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">
                      {m.role}
                    </span>

                    <span
                      className={`text-xs font-semibold ${
                        m.user.isActive
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {m.user.isActive ? "Active" : "Inactive"}
                    </span>
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