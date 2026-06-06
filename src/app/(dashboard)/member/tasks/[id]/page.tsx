"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { useRouter, useParams } from "next/navigation";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";

export default function MemberTaskDetails() {
    const { status } = useSession();

    const [task, setTask] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);


    const router = useRouter();
    const params = useParams();
    const id = (params as { id: string }).id;

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const handleStatusChange = async (
        taskId: string,
        newStatus: string
    ) => {
        try {
            await fetch(`/api/member/tasks/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: newStatus,
                }),
            });

            setTask((prev: any) => ({
                ...prev,
                status: newStatus,
            }));

            router.refresh();
        } catch (error) {
            console.error(error);
        }
    };



    useEffect(() => {
        const fetchTask = async () => {
            try {
                setLoading(true);

                const res = await fetch(`/api/member/tasks/${id}`);

                if (!res.ok) {
                    throw new Error("Failed to fetch task");
                }

                const data = await res.json();

                setTask(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchTask();
    }, [id]);

    if (loading || status === "loading") {
        return <LoadingSkeleton />
    }

    if (!task) {
        return (
            <div className="p-6 text-center text-[var(--text-muted)]">
                Task not found.
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* 🔥 SINGLE MASTER CARD */}
            <div className="glass-panel rounded-3xl p-6 md:p-10 space-y-8 shadow-sm border border-[var(--border)]/50">

                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                    <div className="space-y-3">

                        {/* Breadcrumb */}
                        <div className="text-xs tracking-widest uppercase text-[var(--text-muted)]">
                            {task.project?.name} / Tasks
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--foreground)]">
                            {task.title}
                        </h1>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 pt-1">

                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary)]/10 text-[var(--primary)]">
                                📁 {task.project?.name}
                            </span>

                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${task.status === "COMPLETED"
                                ? "bg-green-500/10 text-green-500"
                                : task.status === "IN_PROGRESS"
                                    ? "bg-blue-500/10 text-blue-500"
                                    : "bg-yellow-500/10 text-yellow-500"
                                }`}>
                                {task.status.replace("_", " ")}
                            </span>

                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${task.priority === "HIGH"
                                ? "bg-red-500/10 text-red-500"
                                : task.priority === "MEDIUM"
                                    ? "bg-orange-500/10 text-orange-500"
                                    : "bg-green-500/10 text-green-500"
                                }`}>
                                {task.priority}
                            </span>

                        </div>
                    </div>

                    {/* STATUS SELECT */}
                    <select
                        className="input w-full lg:w-56"
                        value={task.status}
                        onChange={(e) =>
                            handleStatusChange(task.id, e.target.value)
                        }
                    >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>

                </div>

                {/* GRID INFO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Status */}
                    <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-4">
                        <p className="text-xs text-[var(--text-muted)]">Task Status</p>
                        <p className="text-lg font-bold mt-1">{task.status}</p>
                    </div>

                    {/* Priority */}
                    <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-4">
                        <p className="text-xs text-[var(--text-muted)]">Task Priority</p>
                        <p className="text-lg font-bold mt-1">{task.priority}</p>
                    </div>

                    {/* Due Date */}
                    <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-4">
                        <p className="text-xs text-[var(--text-muted)]">Task Due Date</p>
                        <p className="text-lg font-bold mt-1">
                            {format(new Date(task.dueDate), "dd MMM yyyy")}
                        </p>
                    </div>

                </div>

                {/* PROJECT INFO */}
                {task.project && (
                    <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-5 space-y-3">

                        <h2 className="text-lg font-bold">
                            Project Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">

                            <div>
                                <p className="text-[var(--text-muted)]">Name</p>
                                <p className="font-semibold">{task.project.name}</p>
                            </div>

                            <div>
                                <p className="text-[var(--text-muted)]">Status</p>
                                <p className="font-semibold">{task.project.status}</p>
                            </div>

                            <div>
                                <p className="text-[var(--text-muted)]">Created</p>
                                <p className="font-semibold">
                                    {task.project.createdAt
                                        ? format(new Date(task.project.createdAt), "dd MMM yyyy")
                                        : "N/A"}
                                </p>
                            </div>

                        </div>

                    </div>
                )}

                {/* FOOTER INFO (TITLE CONTEXT) */}
                <div className="text-sm text-[var(--text-muted)] border-t border-[var(--border)] pt-4">
                    {task.project?.name} • Task ID: {task.id}
                </div>

            </div>

        </div>
    );
}