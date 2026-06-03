import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionTokenEdge } from "@/lib/auth/session-edge";

const COOKIE_NAME = "hlh_admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/api/admin")) return NextResponse.next();
  if (pathname === "/api/admin/login") return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!(await verifySessionTokenEdge(token))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
