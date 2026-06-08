import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (

    <div className="w-full max-w-md">
      <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-2xl shadow-2xl p-8">

        {/* glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-[var(--primary)]/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-[var(--danger)]/10 blur-3xl rounded-full" />

        {/* content */}
        <div className="text-center mb-8 relative">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Welcome Back
          </h1>
          <p className="text-[var(--text-muted)] mt-2">
            Sign in to manage your projects
          </p>
        </div>

        <LoginForm />
      </div>
    </div>

  );
}