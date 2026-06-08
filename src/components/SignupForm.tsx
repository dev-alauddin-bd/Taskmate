"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to sign up");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        
        {/* NAME */}
        <div>
          <label className="label font-semibold mb-1.5 block" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            className="input"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="label font-semibold mb-1.5 block" htmlFor="email">
            Email Address
          </label>
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
        
        {/* PASSWORD */}
        <div>
          <label className="label font-semibold mb-1.5 block" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {/* ROLE */}
        <div>
          <label className="label font-semibold mb-1.5 block" htmlFor="role">
            Role
          </label>
          <select 
            id="role" 
            className="input bg-[var(--surface)] text-[var(--foreground)]" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="MEMBER" className="bg-[var(--surface)]">Team Member</option>
            <option value="PROJECT_MANAGER" className="bg-[var(--surface)]">Project Manager</option>
            <option value="ADMIN" className="bg-[var(--surface)]">Admin</option>
          </select>
        </div>
        
        {/* BUTTON */}
        <button 
          type="submit" 
          className="btn btn-primary w-full mt-2" 
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      {/* LINK TO LOGIN */}
      <div className="text-center text-sm text-[var(--text-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--primary)] hover:underline font-semibold">
          Log in
        </Link>
      </div>
    </div>
  );
}
