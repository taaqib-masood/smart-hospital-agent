import { NextRequest, NextResponse } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/api/appointments",
  "/api/analytics",
  "/api/automation-rules",
  "/api/availability",
  "/api/clinic",
  "/api/communication-consents",
  "/api/consents",
  "/api/conversations",
  "/api/follow-ups",
  "/api/invoices",
  "/api/patients",
  "/api/whatsapp/send",
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

  if (path.startsWith("/api/consents/public/")) return res;

  // Demo mode is page-only; it must never expose authenticated API routes.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" && path.startsWith("/dashboard")) return res;

  // Only run on protected routes
  const isProtected = PROTECTED.some(p => path.startsWith(p));
  if (!isProtected) return res;

  try {
    const { createServerClient } = await import("@supabase/ssr");
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // API routes → 401
    if (!user && path.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Page routes → redirect to login
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", path);
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    console.error("Authentication middleware failed", error);
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication unavailable" }, { status: 503 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "auth_unavailable");
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/appointments/:path*",
    "/api/analytics/:path*",
    "/api/automation-rules/:path*",
    "/api/availability/:path*",
    "/api/clinic/:path*",
    "/api/communication-consents/:path*",
    "/api/consents/:path*",
    "/api/conversations/:path*",
    "/api/follow-ups/:path*",
    "/api/invoices/:path*",
    "/api/patients/:path*",
    "/api/whatsapp/send",
  ],
};
