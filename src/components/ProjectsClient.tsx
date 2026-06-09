"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";

import { Modal } from "@/components/Modal";
import { ProjectForm } from "@/components/ProjectForm";
import { TaskForm } from "@/components/TaskForm";
import DataTable, {
  getStatusColor,
} from "@/components/dashboard/DataTable";

import { useDebounce } from "@/hooks/useDebounce";

export default function ProjectsClient({ projects }: any) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const role = session?.user?.role;
  const canDelete = role === "ADMIN";

  // ================= URL STATES =================
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "latest";

  // ================= DEBOUNCED SEARCH =================
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 400);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // ================= QUERY UPDATE =================
  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");

    router.replace(`?${params.toString()}`);
  };

  // ================= DEBOUNCED URL SYNC =================
  useEffect(() => {
    if (debouncedSearch === search) return;

    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    params.set("page", "1");

    router.replace(`?${params.toString()}`);
  }, [debouncedSearch, router, searchParams, search]);

  // ================= MODALS =================
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const [taskProjectId, setTaskProjectId] = useState<string | null>(null);
  const [openTask, setOpenTask] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  const [projectList, setProjectList] = useState(projects);

  useEffect(() => {
    setProjectList(projects);
  }, [projects]);

  // ================= FILTER + SORT =================
  const filteredProjects = useMemo(() => {
    let data = [...projectList];

    // SEARCH
    if (debouncedSearch.trim()) {
      data = data.filter((p: any) =>
        p.name
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase())
      );
    }

    // STATUS
    if (status) {
      data = data.filter((p: any) => p.status === status);
    }

    // SORT
    switch (sort) {
      case "deadline":
        data.sort(
          (a: any, b: any) =>
            new Date(a.deadline).getTime() -
            new Date(b.deadline).getTime()
        );
        break;

      case "priority": {
        const priorityRank: Record<string, number> = {
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };

        data.sort(
          (a: any, b: any) =>
            (priorityRank[b.priority] || 0) -
            (priorityRank[a.priority] || 0)
        );
        break;
      }

      case "latest":
      default:
        data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
    }

    return data;
  }, [projectList, debouncedSearch, status, sort]);

  // ================= ACTIONS =================
  const openEdit = (project: any) => {
    setEditData(project);
    setOpen(true);
  };

  const openTaskModal = (id: string) => {
    setTaskProjectId(id);
    setOpenTask(true);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/projects/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setProjectList((prev: any[]) =>
        prev.filter((p) => p.id !== deleteId)
      );

      toast.success("Project deleted successfully");
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setOpenDelete(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      {/* ================= FILTER BAR ================= */}
      <div className="mb-6 border glass-panel p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            {/* SEARCH */}
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-64 rounded-xl border px-4 py-2"
            />

            {/* STATUS */}
            <select
              value={status}
              onChange={(e) =>
                updateQuery("status", e.target.value)
              }
              className="rounded-xl border px-4 py-2 glass-panel"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* SORT */}
            <select
              value={sort}
              onChange={(e) =>
                updateQuery("sort", e.target.value)
              }
              className="rounded-xl border px-4 py-2 glass-panel"
            >
              <option value="latest">Latest Created</option>
              <option value="deadline">Nearest Deadline</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Total:{" "}
            <span className="font-semibold text-foreground">
              {filteredProjects.length}
            </span>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-hidden  ">
        <DataTable
          data={filteredProjects}
          columns={[
            {
              header: "Project Name",
              accessor: (p: any) => (
                <div className="font-semibold">{p.name}</div>
              ),
            },

            {
              header: "Status",
              center: true,
              accessor: (p: any) => (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                    p.status
                  )}`}
                >
                  {p.status}
                </span>
              ),
            },

            {
              header: "Deadline",
              accessor: (p: any) =>
                new Date(p.deadline).toLocaleDateString(),
            },

            {
              header: "Manager",
              accessor: (p: any) => p.manager?.name || "-",
            },

            {
              header: "Tasks",
              center: true,
              accessor: (p: any) => p._count?.tasks || 0,
            },

            {
              header: "Actions",
              center: true,
              accessor: (p: any) => (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded-xl bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                  >
                    <Pencil size={18} />
                  </button>

                  {canDelete && (
                    <button
                      onClick={() => confirmDelete(p.id)}
                      className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ),
            },

            {
              header: "Add Task",
              center: true,
              accessor: (p: any) => (
                <button
                  onClick={() => openTaskModal(p.id)}
                  className="rounded-xl bg-[var(--primary)] px-3 py-1 text-white"
                >
                  Add Task
                </button>
              ),
            },
          ]}
        />
      </div>

      {/* ================= EDIT PROJECT ================= */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editData ? "Edit Project" : "Create Project"}
      >
        <ProjectForm
          initialData={editData}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </Modal>

      {/* ================= CREATE TASK ================= */}
      <Modal
        isOpen={openTask}
        onClose={() => setOpenTask(false)}
        title="Create Task"
      >
        {taskProjectId && (
          <TaskForm
            projectId={taskProjectId}
            onCancel={() => setOpenTask(false)}
          />
        )}
      </Modal>

      {/* ================= DELETE ================= */}
      <Modal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this project?</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setOpenDelete(false)}
              className="rounded-xl border px-4 py-2"
            >
              No
            </button>

            <button
              onClick={handleDelete}
              className="rounded-xl bg-red-500 px-4 py-2 text-white"
            >
              Yes
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}