"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import TasksClient from "@/components/dashboard/TasksClient";
import Pagination from "@/components/dashboard/Pagination";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Modal } from "@/components/Modal";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function TasksPageClient({
  tasks,
  users,
  page,
  limit,
  total,
}: any) {
  const router = useRouter();
  const pathname = usePathname();

  const [openTask, setOpenTask] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "MEDIUM",
    status: "ACTIVE",
    dueDate: "",
    userId: "",
  });

  /* ================= FETCH PROJECTS ================= */
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to fetch projects:", res.status, errorText);
          setProjects([]);
          return;
        }
        const data = await res.json();
        setProjects(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProjects();
  }, []);

  const openModal = () => setOpenTask(true);

  const closeModal = () => {
    setOpenTask(false);
    setForm({
      title: "",
      description: "",
      projectId: "",
      priority: "MEDIUM",
      status: "ACTIVE",
      dueDate: "",
      userId: "",
    });
  };

  /* ================= CREATE TASK ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.projectId) {
      toast.error("Title & Project required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create task");
        return;
      }

      toast.success("Task created successfully");

      closeModal();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* HEADER */}
      <DashboardHeader
        title="Tasks"
        subtitle="Manage all your tasks efficiently"
      >
        <button
          onClick={openModal}
          className="
            inline-flex items-center gap-2
            px-4 py-2 rounded-xl
            bg-[var(--primary)]
            text-white
            hover:opacity-90
            transition
            cursor-pointer
          "
        >
          <Plus size={16} />
          Create Task
        </button>
      </DashboardHeader>

      {/* TABLE */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
        <TasksClient tasks={tasks} users={users} />
      </div>

      {/* PAGINATION */}
      <Suspense fallback={null}>
        <Pagination
          page={page}
          limit={limit}
          total={total}
          basePath={pathname}
        />
      </Suspense>

      {/* ================= CREATE TASK MODAL ================= */}
      <Modal
        isOpen={openTask}
        onClose={closeModal}
        title="Create Task"
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* TITLE */}
          <input
            type="text"
            placeholder="Task Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="input w-full"
          />

          {/* DESCRIPTION */}
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="input w-full"
          />

          {/* PROJECT SELECT */}
          <select
            value={form.projectId}
            onChange={(e) =>
              setForm({ ...form, projectId: e.target.value })
            }
            className="input w-full"
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* PRIORITY */}
          <select
            value={form.priority}
            onChange={(e) =>
              setForm({ ...form, priority: e.target.value })
            }
            className="input w-full"
          >
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* DUE DATE */}
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm({ ...form, dueDate: e.target.value })
            }
            className="input w-full"
          />

          {/* ASSIGNEE SELECT */}
          <select
            value={form.userId}
            onChange={(e) =>
              setForm({ ...form, userId: e.target.value })
            }
            className="input w-full"
          >
            <option value="">Select Assignee</option>
            {users.map((u: any) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* BUTTONS */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-[var(--border)] cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                px-4 py-2 rounded-lg
                bg-[var(--primary)]
                text-white
                cursor-pointer
                disabled:opacity-50
              "
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>

        </form>
      </Modal>
    </div>
  );
}