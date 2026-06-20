import { type NextRequest, NextResponse } from "next/server";
import { isEmailAllowed } from "@/lib/auth";
import { sanitizeNextPath } from "@/lib/auth-redirect";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/auth/signout"];

function isPublicApi(pathname: string) {
  return pathname === "/api/health";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    isPublicApi(pathname)
  ) {
    if (pathname === "/login") {
      const { supabaseResponse, user } = await updateSession(request);
      if (user?.email && isEmailAllowed(user.email)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return supabaseResponse;
    }
    const { supabaseResponse } = await updateSession(request);
    return supabaseResponse;
  }

  const { supabaseResponse, user } = await updateSession(request);

  if (!user?.email) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", sanitizeNextPath(pathname));
    return NextResponse.redirect(loginUrl);
  }

  if (!isEmailAllowed(user.email)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
