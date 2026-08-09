import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl, cookies } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as any)?.role;
      const hasAdminCookie = cookies.get("admin_session")?.value === "true";
      const isAdmin = userRole === "ADMIN" || hasAdminCookie;

      const pathname = nextUrl.pathname;

      // ── Admin routes protection ──
      if (pathname.startsWith("/admin")) {
        // Allow access to /admin/login for unauthenticated users
        if (pathname === "/admin/login") {
          if (isAdmin) {
            return Response.redirect(new URL("/admin", nextUrl));
          }
          return true;
        }

        // Block non-admin users (or logged-in users with role !== "ADMIN") from all /admin/* routes
        if (!isAdmin) {
          return Response.redirect(new URL("/unauthorized", nextUrl));
        }

        return true;
      }

      // ── Protected user routes ──
      const protectedPaths = ["/dashboard", "/profile", "/properties/add", "/properties/edit"];
      const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

      // ── Auth page routes ──
      const authPaths = ["/login", "/register"];
      const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

      if (isProtectedPath) {
        if (isLoggedIn) return true;
        return false; // Redirect to /login
      }

      if (isAuthPath && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Placed here as placeholder; populated with Credentials provider in auth.ts
} satisfies NextAuthConfig;
