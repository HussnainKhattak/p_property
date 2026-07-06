import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Paths requiring login
      const protectedPaths = ["/dashboard", "/profile", "/properties/add", "/properties/edit"];
      const isProtectedPath = protectedPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      // Paths that should not be visible when logged in (redirect to dashboard)
      const authPaths = ["/login", "/register"];
      const isAuthPath = authPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

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
