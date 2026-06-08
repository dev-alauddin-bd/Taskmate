"use client";

import { useState } from "react";
import { Paperclip, Upload, FileText, Trash2 } from "lucide-react";

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

      const res = await fetch(
        `/api/tasks/${taskId}/attachments`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error("Upload failed");

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
    <section className="space-y-5">

      {/* HEADER */}
      <div className="flex items-center gap-2">
        <Paperclip className="w-5 h-5 text-[var(--primary)]" />

        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Attachments
        </h2>

        <span className="ml-auto text-xs text-[var(--text-muted)]">
          {attachments.length} files
        </span>
      </div>

      {/* UPLOAD BOX */}
      <div className="bg-card border border-[var(--border)] rounded-xl p-4 space-y-3">

        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
          className="
            w-full
            text-sm
            text-[var(--text-muted)]
            file:mr-4
            file:px-4
            file:py-2
            file:rounded-lg
            file:border-0
            file:bg-[var(--primary)]
            file:text-white
            hover:file:opacity-90
          "
        />

        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="
              inline-flex items-center gap-2
              px-4 py-2
              rounded-lg
              bg-[var(--primary)]
              text-white
              text-sm
              hover:opacity-90
              transition
              disabled:opacity-50
              cursor-pointer
              disabled:cursor-not-allowed
            "
          >
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {attachments.length === 0 ? (
        <div className="bg-card border border-[var(--border)] rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            No attachments yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">

          {attachments.map((a) => (
            <div
              key={a.id}
              className="
                flex items-center justify-between
                bg-card
                border border-[var(--border)]
                rounded-xl
                p-4
                hover:bg-[var(--surface-hover)]
                transition
              "
            >

              {/* FILE INFO */}
              <div className="flex items-center gap-3">

                <FileText className="w-5 h-5 text-[var(--primary)]" />

                <div className="flex flex-col">
                  <a
                    href={a.fileUrl}
                    target="_blank"
                    className="
                      text-sm
                      font-medium
                      text-[var(--foreground)]
                      hover:text-[var(--primary)]
                      transition
                    "
                  >
                    {a.fileName}
                  </a>

                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(
                      a.uploadedAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* ACTION (future delete) */}
              <button
                className="
                cursor-pointer
                  p-2
                  rounded-lg
                  hover:bg-[var(--surface-hover)]
                  text-[var(--text-muted)]
                  hover:text-[var(--danger)]
                  transition
                "
              >
                <Trash2 size={16} />
              </button>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}