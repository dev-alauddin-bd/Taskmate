"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Users, Crown, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // NORMAL LOGIN
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res?.ok) {
        setError(res?.error || "Invalid email or password");
        return;
      }

      router.refresh();
      router.push("/dashboard");
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  // DEMO LOGIN (FIXED: password included)
  const handleDemoLogin = async (
    role: "ADMIN" | "PROJECT_MANAGER" | "MEMBER"
  ) => {
    setDemoLoading(true);
    setError("");

    try {
      const demoAccounts = {
        ADMIN: {
          email: "admin@demo.com",
          password: "password123",
        },
        PROJECT_MANAGER: {
          email: "pm@demo.com",
          password: "password123",
        },
        MEMBER: {
          email: "member@demo.com",
          password: "password123",
        },
      };

      const res = await signIn("credentials", {
        redirect: false,
        email: demoAccounts[role].email,
        password: demoAccounts[role].password,
      });

      if (!res?.ok) {
        setError(res?.error || "Demo login failed");
        return;
      }

      router.refresh();
      router.push("/dashboard");
    } catch {
      setError("Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4 text-left">

        {/* EMAIL */}
        <div>
          <label className="label font-semibold mb-1.5 block" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="label font-semibold mb-1.5 block" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading || demoLoading}
          className="btn btn-primary w-full mt-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* LINK TO SIGNUP */}
      <div className="text-center text-sm text-[var(--text-muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[var(--primary)] hover:underline font-semibold">
          Sign Up
        </Link>
      </div>

      {/* DIVIDER */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border)]/60" />
        <span className="text-xs text-[var(--text-muted)] font-medium">Demo Access</span>
        <div className="h-px flex-1 bg-[var(--border)]/60" />
      </div>

      {/* DEMO BUTTONS */}
      <div className="space-y-3">

        <button
          onClick={() => handleDemoLogin("ADMIN")}
          disabled={loading || demoLoading}
          className="btn btn-outline w-full justify-start gap-3 text-[var(--foreground)] border-[var(--warning)]/30 hover:bg-[var(--warning)]/10"
        >
          <Crown size={18} className="text-[var(--warning)]" />
          Demo Admin
        </button>

        <button
          onClick={() => handleDemoLogin("PROJECT_MANAGER")}
          disabled={loading || demoLoading}
          className="btn btn-outline w-full justify-start gap-3 text-[var(--foreground)] border-[var(--primary)]/30 hover:bg-[var(--primary)]/10"
        >
          <Users size={18} className="text-[var(--primary)]" />
          Demo Project Manager
        </button>

        <button
          onClick={() => handleDemoLogin("MEMBER")}
          disabled={loading || demoLoading}
          className="btn btn-outline w-full justify-start gap-3 text-[var(--foreground)] border-[var(--success)]/30 hover:bg-[var(--success)]/10"
        >
          <User size={18} className="text-[var(--success)]" />
          Demo Member
        </button>

      </div>
    </div>
  );
}