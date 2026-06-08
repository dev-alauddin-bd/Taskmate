import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function ManagerTeamPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div>Unauthorized</div>;
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
    <div className="space-y-6 p-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">My Team</h1>
        <p className="text-sm text-gray-500">
          Manage all your project teams in one place
        </p>
      </div>

      {/* PROJECT LIST */}
      {projects.map((project) => (
        <div
          key={project.id}
          className="border rounded-xl p-4 space-y-4 glass-panel"
        >

          {/* PROJECT HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">
                {project.name}
              </h2>
              <p className="text-sm text-gray-500">
                {project.description}
              </p>
            </div>

            <div className="text-sm text-gray-500">
              Members: {project._count.members} | Tasks:{" "}
              {project._count.tasks}
            </div>
          </div>

          {/* TEAM MEMBERS */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {project.members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b last:border-none"
                  >
                    <td className="py-2 font-medium">
                      {m.user.name}
                    </td>

                    <td className="text-gray-500">
                      {m.user.email}
                    </td>

                    <td>
                      <span className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-800">
                        {m.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          m.user.isActive
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {m.user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      ))}

    </div>
  );
}