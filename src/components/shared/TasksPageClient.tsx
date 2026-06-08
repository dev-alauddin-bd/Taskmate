"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TasksClient from "@/components/dashboard/TasksClient";
import Pagination from "@/components/dashboard/Pagination";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Modal } from "../Modal";
import { TaskForm } from "../TaskForm";

export default function TasksPageClient({
  tasks,
  users,
  page,
  limit,
  total,
}: any) {
  const router = useRouter();

  const [openTask, setOpenTask] = useState(false);
  const [taskProjectId, setTaskProjectId] = useState<string | null>(null);

  const openTaskModal = (projectId: string) => {
    setTaskProjectId(projectId);
    setOpenTask(true);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <DashboardHeader
        title="Manager Tasks"
        subtitle="View and manage tasks for your projects."
      />

      {/* ADD BUTTON */}
      <button
        onClick={() => openTaskModal("GENERAL")}
        className="px-3 py-1 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition"
      >
        + Task
      </button>

      {/* TABLE */}
      <TasksClient tasks={tasks} users={users} />

      {/* PAGINATION */}
      <Pagination
        page={page}
        limit={limit}
        total={total}
        basePath="/manager/tasks"
      />

      {/* MODAL */}
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

    </div>
  );
}