"use client";

import { useState } from "react";

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date | string;
}

interface Props {
  taskId: string;
  initialAttachments: Attachment[];
}

export default function TaskAttachments({
  taskId,
  initialAttachments,
}: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>(
    initialAttachments ?? []
  );

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("taskId", taskId);

    try {
      setUploading(true);

      const res = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Upload failed");

      setAttachments((prev) => [data, ...prev]);
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("File upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-lg space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/80 tracking-wide">
          Task Attachments
        </h2>

        <span className="text-xs text-white/40">
          {attachments.length} files
        </span>
      </div>

      {/* Upload Box */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white/5 border border-white/10 p-3 rounded-xl">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-xs text-white/70 file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </div>

      {/* Empty State */}
      {attachments.length === 0 ? (
        <div className="text-center py-8 text-white/40 text-sm border border-dashed border-white/10 rounded-xl">
          No attachments yet. Upload your first file 🚀
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              {/* File Info */}
              <div className="flex flex-col">
                <a
                  href={a.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline truncate max-w-[250px]"
                >
                  {a.fileName}
                </a>

                <span className="text-[11px] text-white/40">
                  Uploaded:{" "}
                  {new Date(a.uploadedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Action icon (optional future delete) */}
              <div className="text-xs text-white/30">
                📎
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}