"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, User, Users, Crown } from "lucide-react";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (!res?.ok) {
      setError(res?.error || "Invalid credentials");
      return;
    }

    router.refresh();
    router.push("/dashboard");
  };

  const handleDemoLogin = async (role: "ADMIN" | "PROJECT_MANAGER" | "MEMBER") => {
    setDemoLoading(true);
    setError("");

    const demoEmails = {
      ADMIN: "admin@demo.com",
      PROJECT_MANAGER: "pm@demo.com",
      MEMBER: "member@demo.com",
    };

    const res = await signIn("credentials", {
      redirect: false,
      email: demoEmails[role],
      isDemo: "true",
    });

    setDemoLoading(false);

    if (!res?.ok) {
      setError(res?.error || "Demo login failed");
      return;
    }

    router.refresh();
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col gap-6 relative">

      {/* error */}
      {error && (
        <div className="p-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] text-sm">
          {error}
        </div>
      )}

      {/* form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <div>
          <label className="text-sm text-[var(--text-muted)]">Email</label>
          <input
            type="email"
            className="w-full mt-1 px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-[var(--text-muted)]">Password</label>
          <input
            type="password"
            className="w-full mt-1 px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading || demoLoading}
          className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-xs text-[var(--text-muted)]">Demo access</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      {/* demo buttons */}
      <div className="grid gap-3">

        <button
          onClick={() => handleDemoLogin("ADMIN")}
          disabled={loading || demoLoading}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition"
        >
          <Crown size={18} /> Demo Admin
        </button>

        <button
          onClick={() => handleDemoLogin("PROJECT_MANAGER")}
          disabled={loading || demoLoading}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition"
        >
          <Users size={18} /> Project Manager
        </button>

        <button
          onClick={() => handleDemoLogin("MEMBER")}
          disabled={loading || demoLoading}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition"
        >
          <User size={18} /> Team Member
        </button>
      </div>
    </div>
  );
}