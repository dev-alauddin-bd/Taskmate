"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
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
  const searchParams = useSearchParams();

  // ================= URL STATES =================
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";
  const assigneeId = searchParams.get("assigneeId") || "";
  const deadlineStatus = searchParams.get("deadlineStatus") || "";
  const sortBy = searchParams.get("sortBy") || "dueDate";

  // ================= DEBOUNCE SEARCH =================
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);
  useEffect(() => setSearchInput(search), [search]);

  // ================= URL UPDATE =================
  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  // ================= DEBOUNCED SEARCH SYNC =================
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set("search", debouncedSearch);
    else params.delete("search");
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearch]);

  // ================= CREATE TASK STATE =================
  const [openTask, setOpenTask] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: "",
    userId: "",
  });

  // ================= FETCH PROJECTS =================
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  // ================= CLIENT‑SIDE VALIDATION =================
  const validateForm = () => {
    // 1️⃣ Duplicate title in the SAME project
    if (form.title && form.projectId) {
      const duplicate = tasks.some(
        (t: any) =>
          t.projectId === form.projectId &&
          t.title.trim().toLowerCase() === form.title.trim().toLowerCase()
      );
      if (duplicate) {
        toast.error("This task already exists in the project.");
        return false;
      }
    }

    // 2️⃣ Past deadline
    if (form.dueDate) {
      const due = new Date(form.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (due < today) {
        toast.error("Please select a valid deadline.");
        return false;
      }
    }

    // 3️⃣ Completed task cannot be assigned
    if (form.status === "COMPLETED" && form.userId) {
      toast.error("Completed tasks cannot be reassigned.");
      return false;
    }

    return true;
  };

  // ================= SUBMIT HANDLER =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed");
        return;
      }
      toast.success("Task created");
      setOpenTask(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <DashboardHeader title="Tasks" subtitle="Manage tasks">
        <button
          onClick={() => setOpenTask(true)}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl flex items-center gap-2"
        >
          <Plus size={16} /> Create Task
        </button>
      </DashboardHeader>

      {/* FILTER BAR */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* SEARCH */}
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search tasks..."
          className="input border border-[var(--border)] focus:border-[var(--primary)]"
        />

        {/* STATUS */}
        <select
          value={status}
          onChange={(e) => updateQuery("status", e.target.value)}
          className="input border border-[var(--border)] focus:border-[var(--primary)]"
        >
          <option value="">All Status</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        {/* PRIORITY */}
        <select
          value={priority}
          onChange={(e) => updateQuery("priority", e.target.value)}
          className="input border border-[var(--border)] focus:border-[var(--primary)]"
        >
          <option value="">All Priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* ASSIGNEE */}
        <select
          value={assigneeId}
          onChange={(e) => updateQuery("assigneeId", e.target.value)}
          className="input border border-[var(--border)] focus:border-[var(--primary)]"
        >
          <option value="">All Members</option>
          {users.map((u: any) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* DEADLINE STATUS */}
        <select
          value={deadlineStatus}
          onChange={(e) => updateQuery("deadlineStatus", e.target.value)}
          className="input border border-[var(--border)] focus:border-[var(--primary)]"
        >
          <option value="">All Deadline</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="OVERDUE">Overdue</option>
        </select>

        {/* SORT BY */}
        <select
          value={sortBy}
          onChange={(e) => updateQuery("sortBy", e.target.value)}
          className="input border border-[var(--border)] focus:border-[var(--primary)]"
        >
          <option value="createdAt">Latest</option>
          <option value="dueDate">Nearest Deadline</option>
          <option value="priority">Priority</option>
          <option value="updatedAt">Recently Updated</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
        <TasksClient tasks={tasks} />
      </div>

      {/* PAGINATION */}
      <Suspense fallback={null}>
        <Pagination page={page} limit={limit} total={total} basePath={pathname} />
      </Suspense>

      {/* CREATE‑TASK MODAL */}
      <Modal isOpen={openTask} onClose={() => setOpenTask(false)} title="Create Task">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TITLE */}
          <input
            className="input border border-[var(--border)] focus:border-[var(--primary)]"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          {/* DESCRIPTION */}
          <textarea
            className="input border border-[var(--border)] focus:border-[var(--primary)]"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* PROJECT SELECT */}
          <select
            className="input border border-[var(--border)] focus:border-[var(--primary)]"
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          >
            <option value="">Select Project</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* PRIORITY SELECT */}
          <select
            className="input border border-[var(--border)] focus:border-[var(--primary)]"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* STATUS SELECT */}
          <select
            className="input border border-[var(--border)] focus:border-[var(--primary)]"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* DUE DATE */}
          <input
            type="date"
            className="input border border-[var(--border)] focus:border-[var(--primary)]"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />

          {/* ASSIGNEE SELECT */}
          <select
            className="input border border-[var(--border)] focus:border-[var(--primary)]"
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
          >
            <option value="">Unassigned</option>
            {users.map((u: any) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* SUBMIT */}
          <button
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl"
            disabled={loading}
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </form>
      </Modal>
    </div>
  );
}