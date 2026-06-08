"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* EMAIL */}
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white"
        />

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading || demoLoading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold text-white"
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

      {/* DIVIDER */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-slate-400">Demo Access</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* DEMO BUTTONS */}
      <div className="space-y-3">

        <button
          onClick={() => handleDemoLogin("ADMIN")}
          disabled={loading || demoLoading}
          className="flex w-full items-center gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-white"
        >
          <Crown size={18} />
          Demo Admin
        </button>

        <button
          onClick={() => handleDemoLogin("PROJECT_MANAGER")}
          disabled={loading || demoLoading}
          className="flex w-full items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-white"
        >
          <Users size={18} />
          Demo Project Manager
        </button>

        <button
          onClick={() => handleDemoLogin("MEMBER")}
          disabled={loading || demoLoading}
          className="flex w-full items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-white"
        >
          <User size={18} />
          Demo Member
        </button>

      </div>
    </div>
  );
}