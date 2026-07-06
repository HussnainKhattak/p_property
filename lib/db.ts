import { PrismaClient } from "@prisma/client";

// Module-level singleton — prevents multiple connections during hot reload
let db: PrismaClient;

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
} else {
  // In development, reuse the cached instance across Next.js hot reloads
  const globalWithPrisma = global as typeof globalThis & {
    _prismaClient?: PrismaClient;
  };
  if (!globalWithPrisma._prismaClient) {
    globalWithPrisma._prismaClient = new PrismaClient({
      log: ["error"],
    });
  }
  db = globalWithPrisma._prismaClient;
}

export { db };
