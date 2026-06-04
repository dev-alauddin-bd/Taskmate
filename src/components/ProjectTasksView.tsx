"use client";

import { useState } from "react";
import { format } from "date-fns";
import { TaskForm } from "@/components/TaskForm";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ProjectTasksView({ projectId, initialTasks, role }: { projectId: string, initialTasks: any[], role: string }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (taskId: string, currentStatus: string, newStatus: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Tasks</h2>
        {(role === "ADMIN" || role === "PM") && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + Add Task
          </button>
        )}
      </div>

      <div className="glass-panel rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-hover)]">
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Task</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Status</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Priority</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Due Date</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Assignee</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {initialTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">
                    No tasks yet. Create one!
                  </td>
                </tr>
              ) : (
                initialTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-[var(--foreground)]">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-[var(--text-muted)] mt-1 truncate max-w-xs">{task.description}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <select 
                        className="input text-xs py-1 px-2 h-auto"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, task.status, e.target.value)}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        task.priority === "HIGH" ? "bg-[var(--danger)]/10 text-[var(--danger)]" :
                        task.priority === "MEDIUM" ? "bg-[var(--warning)]/10 text-[var(--warning)]" :
                        "bg-[var(--primary-light)] text-[var(--primary)]"
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-muted)]">
                      {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 text-sm text-[var(--foreground)]">
                      {task.assignee?.name || "Unassigned"}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {(role === "ADMIN" || role === "PM") && (
                        <button onClick={() => handleDeleteTask(task.id)} className="text-sm font-medium text-[var(--danger)] hover:underline">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--surface)] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="font-semibold text-lg text-[var(--foreground)]">Create New Task</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-[var(--foreground)]">
                ✕
              </button>
            </div>
            <div className="p-6">
              <TaskForm projectId={projectId} onCancel={() => setShowModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
