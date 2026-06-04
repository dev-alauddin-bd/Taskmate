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
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-md bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label className="label" htmlFor="name">Full Name</label>
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
            minLength={6}
          />
        </div>

        <div>
          <label className="label" htmlFor="role">Role</label>
          <select 
            id="role" 
            className="input" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="MEMBER">Team Member</option>
            <option value="PM">Project Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        
        <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <div className="text-center text-sm text-[var(--text-muted)]">
        Already have an account? <Link href="/login" className="text-[var(--primary)] hover:underline">Log in</Link>
      </div>
    </div>
  );
}
