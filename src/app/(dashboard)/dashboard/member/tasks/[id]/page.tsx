import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";
import Link from "next/link";
import TaskComments from "@/components/dashboard/TaskComments";
import TaskAttachments from "@/components/dashboard/TaskAttachments";
import prisma from "@/lib/prisma";
import { TaskStatus, ActivityAction } from "../../../../../../../generated/prisma/enums";
import { taskSchema } from "@/lib/validations";

const card = "glass-panel rounded-3xl p-6 relative overflow-hidden";

export default async function MemberTaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  if (session.user.role !== "MEMBER") {
    redirect("/dashboard");
  }

  const task = await prisma.task.findFirst({
    where: {
      id: params.id,
      assignees: {
        some: {
          userId: session.user.id,
        },
      },
      isDeleted: false,
    },
    include: {
      project: true,
      assignees: { include: { user: true } },
      comments: { include: { user: true } },
      attachments: { include: { uploadedBy: true } },
    },
  });

  if (!task) notFound();

  // ================= SERVER ACTION =================
  async function updateStatus(formData: FormData) {
    "use server";

    const status = formData.get("status") as string;

    const allowed = ["TODO", "IN_PROGRESS", "COMPLETED"];

    if (!allowed.includes(status)) return;

    // old status store
    const oldStatus = task!.status;

    // update task
    await prisma.task.update({
      where: { id: task!.id },
      data: { status: status as TaskStatus },
    });

    // ================= ACTIVITY LOG =================
    await prisma.activityLog.create({
      data: {
        action: ActivityAction.TASK_UPDATED,
        details: { message: `${session!.user.name} changed task "${task!.title}" from ${oldStatus} to ${status}` },
        userId: session!.user.id,
        projectId: task!.projectId,
        taskId: task!.id,

      },
    });

    // ================= FORCE RELOAD =================
    redirect(`/dashboard/member/tasks/${task!.id}`);
  }

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div className={`${card} p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl`}>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">

          <div className="space-y-4 flex-1">

            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {task.title}
            </h1>

            <p className="text-sm md:text-base text-white/60">
              {task.description || "No description provided"}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">

              <span className="px-3 py-1 rounded-full text-xs bg-blue-500/15 text-blue-300 border border-blue-500/20">
                📁 {task.project?.name}
              </span>

              <span className="px-3 py-1 rounded-full text-xs bg-purple-500/15 text-purple-300 border border-purple-500/20 capitalize">
                📌 {task.status.replaceAll("_", " ")}
              </span>

              <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/15 text-yellow-300 border border-yellow-500/20 capitalize">
                ⚡ {task.priority}
              </span>

              <span className="px-3 py-1 rounded-full text-xs bg-green-500/15 text-green-300 border border-green-500/20">
                ⏰ Due {format(new Date(task.dueDate), "MMM d")}
              </span>

            </div>

          </div>

          {/* ================= STATUS SELECT ================= */}
          <div className="flex items-start justify-end">

            <form action={updateStatus} className="flex items-center gap-2">

              <select
                name="status"
                defaultValue={task.status}
                className="px-3 py-2 text-xs rounded-lg glass-panel border border-white/10 focus:outline-none"
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <button
                type="submit"
                className="px-3 py-2 text-xs rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30"
              >
                Update
              </button>

            </form>

          </div>

        </div>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT */}
        <div className={`lg:col-span-3 ${card} p-5 space-y-5`}>

          <h2 className="text-sm text-gray-400 font-semibold">
            Assignees
          </h2>

          <div className="space-y-2">
            {task.assignees.length > 0 ? (
              task.assignees.map((a) => (
                <div
                  key={a.id}
                  className="px-3 py-2 rounded-lg bg-white/5 text-white"
                >
                  {a.user?.name || "Unnamed"}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No assignees</p>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-gray-400 space-y-1">
            <p>ID: {task.id.slice(0, 8)}...</p>
            <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
            <p>Status: {task.status}</p>
          </div>

        </div>

        {/* CENTER */}
        <div className="lg:col-span-6 space-y-6">

          <div className={`${card} p-6`}>
            <h2 className="text-sm text-gray-400 mb-4">Comments</h2>

            <TaskComments
              taskId={task.id}
              initialComments={task.comments}
            />
          </div>

          <div className={`${card} p-6`}>
            <h2 className="text-sm text-gray-400 mb-4">Attachments</h2>

            <TaskAttachments
              taskId={task.id}
              initialAttachments={task.attachments}
            />
          </div>

        </div>

        {/* RIGHT */}
        <div className={`lg:col-span-3 ${card} p-5`}>

          <h2 className="text-sm text-gray-400 font-semibold mb-4">
            Overview
          </h2>

          <div className="space-y-3 text-sm text-gray-300">

            <div className="p-3 rounded-lg bg-white/5">
              <span className="text-gray-400">Priority:</span> {task.priority}
            </div>

            <div className="p-3 rounded-lg bg-white/5">
              <span className="text-gray-400">Status:</span> {task.status}
            </div>

            <div className="p-3 rounded-lg bg-white/5">
              <span className="text-gray-400">Due:</span>{" "}
              {format(new Date(task.dueDate), "MMM d, yyyy")}
            </div>

          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="flex justify-end">
        <Link
          href="/dashboard/manager/tasks"
          className="text-gray-400 hover:text-white transition"
        >
          ← Back to Tasks
        </Link>
      </div>

    </div>
  );
}