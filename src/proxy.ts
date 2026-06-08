import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(function middleware(req) {
  const token = req.nextauth.token;
  const role = token?.role;
  const pathname = req.nextUrl.pathname;

  // ❌ no login → go to ROOT (NOT /api/auth/signin)
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  console.log(token)

  // ADMIN ROUTE
  if (
    pathname.startsWith("/dashboard/admin") &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // MANAGER ROUTE
  if (
    pathname.startsWith("/dashboard/manager") &&
    role !== "PROJECT_MANAGER" &&
    role !== "MANAGER"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // MEMBER ROUTE
  if (
    pathname.startsWith("/dashboard/member") &&
    role !== "MEMBER"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}, {
  callbacks: {
    authorized: () => true,
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};