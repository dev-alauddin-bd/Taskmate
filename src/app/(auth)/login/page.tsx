import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Welcome Back</h1>
          <p className="text-[var(--text-muted)]">Sign in to manage your projects</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}
