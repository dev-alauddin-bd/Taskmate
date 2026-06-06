"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { ProjectForm } from "@/components/ProjectForm";
import DataTable, { getStatusColor } from "@/components/dashboard/DataTable";
import { DeleteIcon, Edit2Icon, Eye, Pencil, Trash2 } from "lucide-react";

export default function ProjectsClient({ projects }: any) {
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const openEdit = (project: any) => {
        setEditData(project);
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
        setEditData(null);
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/projects/${id}`, {
            method: "DELETE",
        });
        window.location.reload();
    };

    return (
        <>
            <DataTable
                data={projects}
                columns={[
                    {
                        header: "Project Name",
                        accessor: (p: any) => (
                            <div>
                                <div className="font-medium">{p.name}</div>
                                <div className="text-xs text-gray-400">
                                    {p.description}
                                </div>
                            </div>
                        ),
                    },

                    {
                        header: "Status",
                        center: true,
                        accessor: (p: any) => (
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
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
                        accessor: (p: any) => p.manager?.name,
                    },

                    {
                        header: "Tasks",
                        center: true,
                        accessor: (p: any) => p._count.tasks,
                    },

                    {
                        header: "Actions",
                        center: true,
                        accessor: (p: any) => (
                            <div className="flex justify-center items-center gap-2">

                                {/* EDIT */}
                                <button
                                    onClick={() => openEdit(p)}
                                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                                    title="Edit"
                                >
                                    <Pencil size={18} />
                                </button>

                                {/* DELETE */}
                                <button
                                    onClick={() => handleDelete(p.id)}
                                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition cursor-pointer"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>

                                {/* VIEW (optional future use) */}
                                {/* <button
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                                    title="View"
                                >
                                    <Eye size={18} />
                                </button> */}

                            </div>
                        ),
                    },
                ]}
            />

            {/* MODAL */}
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
                        window.location.reload();
                    }}
                />
            </Modal>
        </>
    );
}