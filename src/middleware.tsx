import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "./types/enums";

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value;

  if (!role) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Admin-only routes
  if (
    req.nextUrl.pathname.startsWith("/admin") &&
    Number(role) !== Role.Admin
  ) {
    return NextResponse.redirect(new URL("/driver/trips", req.url));
  }

  // Driver-only routes
  if (
    req.nextUrl.pathname.startsWith("/driver") &&
    Number(role) !== Role.Driver
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

// Run middleware on these routes
export const config = {
  matcher: ["/admin/:path*", "/driver/:path*"],
};
