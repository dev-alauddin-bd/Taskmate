import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/SignupForm";

export default async function SignupPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role) {
    const role = session.user.role;
    if (role === "ADMIN") {
      redirect("/admin");
    } else if (role === "PROJECT_MANAGER" || role === "MANAGER") {
      redirect("/manager");
    } else {
      redirect("/member");
    }
  }

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Create Account</h1>
          <p className="text-[var(--text-muted)]">Join the project management system</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
