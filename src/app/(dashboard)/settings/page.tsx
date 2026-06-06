"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Settings, UploadCloud, User } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session } = useSession();

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

  const displayAvatar =
    preview ||
    // @ts-ignore
    session?.user?.avatar ||
    null;

  const joinedAt =
    // @ts-ignore
    session?.user?.joinedAt
      ? new Date(
          // @ts-ignore
          session.user.joinedAt
        ).toLocaleDateString()
      : "Unknown";

  const handleAvatarChange = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const sigRes = await fetch("/api/cloudinary/signature");

      if (!sigRes.ok) {
        toast.error("Failed to get signature");
        return;
      }

      const sigData = await sigRes.json();

      const formData = new FormData();

      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", String(sigData.timestamp));
      formData.append("signature", sigData.signature);
      formData.append("folder", "avatars");

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round(
            (event.loaded / event.total) * 100
          );

          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);

        if (response.secure_url) {
          setPreview(response.secure_url);
        }

        setUploading(false);
      };

      xhr.onerror = () => {
        setUploading(false);
      };

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`
      );

      xhr.send(formData);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        name,
        avatar:
          preview ||
          // @ts-ignore
          session?.user?.avatar ||
          null,
      };

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Settings"
        subtitle="Manage your profile & account preferences"
      >
        <Settings className="w-6 h-6 text-[var(--primary)]" />
      </DashboardHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-lg font-bold">
              Profile Information
            </h2>
          </div>

          <p className="text-sm text-[var(--text-muted)]">
            Joined: {joinedAt}
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="text-xs text-[var(--text-muted)]">
                Full Name
              </label>

              <input
                className="input w-full"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[var(--text-muted)]">
                Profile Picture
              </label>

              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] p-6 cursor-pointer transition hover:bg-[var(--surface-hover)]/20">
                <UploadCloud className="w-8 h-8 text-[var(--primary)] mb-3" />

                <p className="text-sm text-center text-[var(--text-muted)]">
                  Click to upload profile image
                </p>

                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  PNG, JPG, WEBP (Max 5MB)
                </p>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>

              {uploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>Uploading Avatar...</span>
                    <span className="font-semibold">
                      {uploadProgress}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                      style={{
                        width: `${uploadProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || saving}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading
                ? `Uploading ${uploadProgress}%`
                : saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </form>
        </section>

        <aside className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--primary)]/20 bg-[var(--surface-hover)] flex items-center justify-center">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-[var(--text-muted)]" />
              )}
            </div>

            <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
          </div>

          <div>
            <h3 className="text-lg font-bold">
              {name || "Your Name"}
            </h3>

            <p className="text-xs text-[var(--text-muted)] mt-1">
              Member since {joinedAt}
            </p>
          </div>

          <div className="w-full rounded-xl bg-[var(--surface-hover)]/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)]">
                Profile Completion
              </span>

              <span className="text-xs font-semibold text-green-500">
                {displayAvatar && name ? "100%" : "50%"}
              </span>
            </div>

            <div className="h-2 w-full rounded-full overflow-hidden bg-[var(--surface-hover)]">
              <div
                className="h-full bg-green-500"
                style={{
                  width:
                    displayAvatar && name
                      ? "100%"
                      : "50%",
                }}
              />
            </div>
          </div>

          <div className="w-full rounded-xl bg-[var(--surface-hover)]/10 p-4 text-xs text-[var(--text-muted)]">
            💡 Upload a professional profile picture so teammates can easily
            recognize you.
          </div>
        </aside>
      </div>
    </div>
  );
}