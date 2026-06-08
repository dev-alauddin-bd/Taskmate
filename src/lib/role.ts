export function getDashboardPathForRole(role: string | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "PROJECT_MANAGER":
    case "MANAGER":
      return "/dashboard/manager";
    case "MEMBER":
      return "/dashboard/member";
    default:
      return "/login";
  }
}
