"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleDemoLogin = async (role: "ADMIN" | "PROJECT_MANAGER" | "MEMBER") => {
    setDemoLoading(true);
    setError("");
    
    // Mapping demo roles to preset emails
    const demoEmails = {
      ADMIN: "admin@demo.com",
      PROJECT_MANAGER: "pm@demo.com",
      MEMBER: "member@demo.com"
    };

    const res = await signIn("credentials", {
      redirect: false,
      email: demoEmails[role],
      isDemo: "true",
    });

    if (res?.error) {
      setError(res.error);
      setDemoLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-md bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading || demoLoading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-[var(--border)]"></div>
        <span className="flex-shrink-0 mx-4 text-[var(--text-muted)] text-sm">Or continue with</span>
        <div className="flex-grow border-t border-[var(--border)]"></div>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={() => handleDemoLogin("ADMIN")}
          disabled={loading || demoLoading}
          className="btn btn-outline w-full"
        >
          Demo Admin
        </button>
        <button 
          onClick={() => handleDemoLogin("PROJECT_MANAGER")}
          disabled={loading || demoLoading}
          className="btn btn-outline w-full"
        >
          Demo Project Manager
        </button>
        <button 
          onClick={() => handleDemoLogin("MEMBER")}
          disabled={loading || demoLoading}
          className="btn btn-outline w-full"
        >
          Demo Team Member
        </button>
      </div>
    </div>
  );
}
