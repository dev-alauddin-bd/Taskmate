import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRootPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // No active session, send user to login page
    redirect("/login");
  } else {
    // Redirect user to their role‑specific dashboard
    const role = session.user?.role;
    switch (role) {
      case "ADMIN":
        redirect("/dashboard/admin");
        break;
      case "PROJECT_MANAGER":
      case "MANAGER":
        redirect("/dashboard/manager");
        break;
      case "MEMBER":
        redirect("/dashboard/member");
        break;
      default:
        // Fallback to a generic dashboard or a not‑found page
        redirect("/dashboard/member");
    }
  }
}
