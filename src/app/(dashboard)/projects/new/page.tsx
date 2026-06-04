import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PM")) {
    redirect("/projects");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Create New Project
        </h1>
        <p className="text-[var(--text-muted)]">
          Fill in the details below to start a new project.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-xl shadow-sm">
        <ProjectForm />
      </div>
    </div>
  );
}
