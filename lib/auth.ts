import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";
import { authConfig } from "@/auth.config";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const authStart = Date.now();
        try {
          const parsedCredentials = loginSchema.safeParse(credentials);

          if (!parsedCredentials.success) {
            return null;
          }

          const { email, password } = parsedCredentials.data;
          const user = await db.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              password: true,
              role: true,
            },
          });

          if (!user || !user.password) {
            console.log(`[Perf Audit] Auth check failed (User not found) in ${Date.now() - authStart}ms`);
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          const duration = Date.now() - authStart;

          if (passwordsMatch) {
            console.log(`[Perf Audit] Authentication response time: ${duration}ms (Success)`);
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: user.role,
            };
          }

          console.log(`[Perf Audit] Authentication response time: ${duration}ms (Invalid Password)`);
          return null;
        } catch (err) {
          console.error(`[Perf Audit] Authentication error after ${Date.now() - authStart}ms:`, err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as Role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (!token.sub) return token;

      // If user object was passed on initial login, populate token immediately without DB lookup
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.role = (user as any).role;
        return token;
      }

      // Fast check only when token needs refresh
      if (!token.role) {
        const jwtStart = Date.now();
        const existingUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { name: true, email: true, role: true },
        });

        console.log(`[Perf Audit] JWT lookup completed in ${Date.now() - jwtStart}ms`);

        if (!existingUser) return token;

        token.name = existingUser.name;
        token.email = existingUser.email;
        token.role = existingUser.role;
      }

      return token;
    },
  },
});
