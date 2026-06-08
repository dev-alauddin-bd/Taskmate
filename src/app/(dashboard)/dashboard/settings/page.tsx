"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Settings, UploadCloud, User } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  const avatar =
    preview ||
    // @ts-ignore
    session?.user?.avatar ||
    null;

  /* ================= UPLOAD ================= */
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const sigRes = await fetch("/api/cloudinary/signature");
      const sigData = await sigRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", String(sigData.timestamp));
      formData.append("signature", sigData.signature);
      formData.append("folder", "avatars");

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        const res = JSON.parse(xhr.responseText);

        if (res.secure_url) {
          setPreview(res.secure_url);
        }

        setUploading(false);
      };

      xhr.onerror = () => {
        setUploading(false);
        toast.error("Upload failed");
      };

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`
      );

      xhr.send(formData);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
      setUploading(false);
    }
  };

  /* ================= SAVE PROFILE ================= */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          avatar,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Profile updated successfully");

        // 🔥 IMPORTANT FIX: session + UI sync
        await update();     // NextAuth session refresh
        router.refresh();   // server components refresh
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* HEADER */}
      <DashboardHeader
        title="Settings"
        subtitle="Manage your profile & preferences"
      >
        <Settings className="w-6 h-6 text-[var(--primary)]" />
      </DashboardHeader>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ================= FORM ================= */}
        <section className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-6">

          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Profile Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME */}
            <div>
              <label className="text-xs text-[var(--text-muted)]">
                Full Name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            {/* UPLOAD */}
            <div>
              <label className="text-xs text-[var(--text-muted)]">
                Profile Image
              </label>

              <label className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-xl p-6 cursor-pointer hover:bg-[var(--surface-hover)] transition">

                <UploadCloud className="w-8 h-8 text-[var(--primary)]" />

                <p className="text-sm text-[var(--text-muted)] mt-2">
                  Click to upload image
                </p>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>

              {/* PROGRESS */}
              {uploading && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>

                  <div className="h-2 bg-[var(--surface-hover)] rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary)] transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* BUTTON */}
            <button
              disabled={uploading || saving}
              className="w-full py-2 rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 disabled:opacity-50"
            >
              {uploading
                ? `Uploading ${uploadProgress}%`
                : saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </form>
        </section>

        {/* ================= SIDEBAR ================= */}
        <aside className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 text-center space-y-5">

          <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-[var(--primary)]/20 flex items-center justify-center bg-[var(--background)]">

            {avatar ? (
              <img
                src={avatar}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-[var(--text-muted)]" />
            )}

          </div>

          <div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              {name || "Your Name"}
            </h3>
          </div>

          <div className="bg-[var(--surface-hover)]/10 p-4 rounded-xl">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[var(--text-muted)]">
                Profile Completion
              </span>

              <span className="text-green-500 font-semibold">
                {avatar && name ? "100%" : "50%"}
              </span>
            </div>

            <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{
                  width: avatar && name ? "100%" : "50%",
                }}
              />
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            💡 Add a clear profile picture for better recognition
          </p>

        </aside>
      </div>
    </div>
  );
}