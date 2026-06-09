"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/Modal";
import { ProjectForm } from "@/components/ProjectForm";
import DataTable, { getStatusColor } from "@/components/dashboard/DataTable";
import { Pencil, Trash2 } from "lucide-react";
import { TaskForm } from "@/components/TaskForm";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function ProjectsClient({ projects }: any) {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const isManager = role === "PROJECT_MANAGER";
  const canDelete = isAdmin;;
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const [taskProjectId, setTaskProjectId] = useState<string | null>(null);
  const [openTask, setOpenTask] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  const [projectList, setProjectList] = useState(projects);

  // ✅ Sync state when server props change
  useEffect(() => {
    setProjectList(projects);
  }, [projects]);

  const openEdit = (project: any) => {
    setEditData(project);
    setOpen(true);
  };

  const openTaskModal = (id: string) => {
    setTaskProjectId(id);
    setOpenTask(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditData(null);
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

      if (!res.ok) throw new Error("Delete failed");

      setProjectList((prev: any[]) =>
        prev.filter((p) => p.id !== deleteId)
      );

      

      toast.success("Project deleted successfully");
    } catch (err) {
      toast.error("Failed to delete project");
    } finally {
      setOpenDelete(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <DataTable
        data={projectList}
        columns={[
          {
            header: "Project Name",
            className: "min-w-[150px]",
            accessor: (p: any) => (
              <div>
                <div className="font-medium">{p.name}</div>
              </div>
            ),
          },

          {
            header: "Status",
            center: true,
            className: "whitespace-nowrap",
            accessor: (p: any) => (
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  p.status
                )}`}
              >
                {p.status}
              </span>
            ),
          },

          {
            header: "Deadline",
            className: "whitespace-nowrap",
            accessor: (p: any) =>
              new Date(p.deadline).toLocaleDateString(),
          },

          {
            header: "Manager",
            className: "whitespace-nowrap",
            accessor: (p: any) => p.manager?.name,
          },

          {
            header: "Tasks",
            center: true,
            className: "whitespace-nowrap",
            accessor: (p: any) => p._count.tasks,
          },

          {
            header: "Actions",
            center: true,
            className: "whitespace-nowrap",
            accessor: (p: any) => (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => openEdit(p)}
                  className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                >
                  <Pencil size={18} />
                </button>

                {canDelete && (
              <button
                onClick={() => confirmDelete(p.id)}
                className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
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
            className: "whitespace-nowrap",
            accessor: (p: any) => (
              <button
                onClick={() => openTaskModal(p.id)}
                className="px-3 py-1 rounded-xl bg-[var(--primary)] text-white hover:opacity-90 cursor-pointer"
              >
                Add Task
              </button>
            ),
          },
        ]}
      />

      <Modal
        isOpen={open}
        onClose={closeModal}
        title={editData ? "Edit Project" : "Create Project"}
      >
        <ProjectForm
          initialData={editData}
          onCancel={closeModal}
          onSuccess={() => {
            closeModal();
          }}
        />
      </Modal>

      <Modal
        isOpen={openTask}
        onClose={() => {
          setOpenTask(false);
          setTaskProjectId(null);
        }}
        title="Create Task"
      >
        {taskProjectId && (
          <TaskForm
            projectId={taskProjectId}
            onCancel={() => {
              setOpenTask(false);
              setTaskProjectId(null);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this project?
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setOpenDelete(false)}
              className="px-4 py-2 rounded-xl border cursor-pointer"
            >
              No
            </button>

            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 cursor-pointer"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}