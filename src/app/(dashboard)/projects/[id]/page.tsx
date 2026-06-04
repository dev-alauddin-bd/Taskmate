import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { ProjectTasksView } from "@/components/ProjectTasksView";

export default async function ProjectDetailsPage({ params }: { params: { id?: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const id = params?.id ?? "";
  if (!id) {
    notFound();
    return null;
  }

  const project = await prisma.project.findUnique({
    where: { id: String(id) },
    include: {
      manager: { select: { name: true } },
      tasks: {
        include: {
          assignee: { select: { name: true, email: true } },
        },
        orderBy: { dueDate: "asc" }
      }
    }
  });

  if (!project) {
    notFound();
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="glass-panel p-6 sm:p-8 rounded-xl shadow-sm border-t-4 border-t-[var(--primary)]">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                {project.name}
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                project.status === "ACTIVE" ? "bg-[var(--primary-light)] text-[var(--primary)]" :
                project.status === "COMPLETED" ? "bg-[var(--success)]/10 text-[var(--success)]" :
                "bg-[var(--warning)]/10 text-[var(--warning)]"
              }`}>
                {project.status}
              </span>
            </div>
            {project.description && (
              <p className="text-[var(--text-muted)] text-sm md:text-base max-w-2xl mt-2">
                {project.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-1 text-sm bg-[var(--surface-hover)] p-4 rounded-lg">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">Manager:</span>
              <span className="font-medium text-[var(--foreground)]">{project.manager.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">Deadline:</span>
              <span className="font-medium text-[var(--foreground)]">{format(new Date(project.deadline), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
      </div>

      <ProjectTasksView 
        projectId={project.id} 
        initialTasks={project.tasks} 
        role={session.user.role} 
      />
    </div>
  );
}
