import { PrismaClient } from "@prisma/client";

// Global type augmentation to cache Prisma Client across hot reloads and serverless lambdas
const globalWithPrisma = globalThis as unknown as {
  _prismaClient?: PrismaClient;
};

/**
 * Extracts and returns the Atlas cluster hostname without credentials.
 */
export function getAtlasHost(url?: string): string {
  const dbUrl = url || process.env.DATABASE_URL || "";
  if (!dbUrl) return "NOT_SET";
  const match = dbUrl.match(/@([^/?#]+)/);
  return match ? match[1] : "UNKNOWN_HOST";
}

/**
 * Returns DATABASE_URL with password masked for security.
 */
export function maskDatabaseUrl(url?: string): string {
  const dbUrl = url || process.env.DATABASE_URL || "";
  if (!dbUrl) return "NOT_SET";
  return dbUrl.replace(/\/\/[^:]+:[^@]+@/, "//****:****@");
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Reuse cached instance in development and production serverless environments
const db: PrismaClient = globalWithPrisma._prismaClient ?? createPrismaClient();

if (!globalWithPrisma._prismaClient) {
  globalWithPrisma._prismaClient = db;
}

/**
 * Connection diagnostic test: Pings database, logs latency, and reports errors.
 */
export async function pingDatabase() {
  const envLoaded = !!process.env.DATABASE_URL;
  const atlasHost = getAtlasHost();
  const maskedUrl = maskDatabaseUrl();
  const startTime = Date.now();

  console.log(`[DB Diagnostic] DATABASE_URL loaded: ${envLoaded}`);
  console.log(`[DB Diagnostic] Atlas Hostname: ${atlasHost}`);
  console.log(`[DB Diagnostic] Connection string: ${maskedUrl}`);
  console.log(`[DB Diagnostic] Connection attempt started...`);

  if (!envLoaded) {
    const errorMsg = "DATABASE_URL environment variable is missing or empty.";
    console.error(`[DB Diagnostic] Connection failure: ${errorMsg}`);
    return {
      connected: false,
      error: errorMsg,
      atlasHost,
      envLoaded: false,
      durationMs: Date.now() - startTime,
    };
  }

  try {
    // Execute ping command via Prisma MongoDB raw command
    await db.$runCommandRaw({ ping: 1 });
    const durationMs = Date.now() - startTime;
    console.log(`[DB Diagnostic] Connection success! Ping response in ${durationMs}ms`);
    return {
      connected: true,
      error: null,
      atlasHost,
      envLoaded: true,
      durationMs,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err?.message || String(err);
    console.error(`[DB Diagnostic] Connection failure after ${durationMs}ms:`, errorMessage);
    console.error(`[DB Diagnostic] Full Prisma error stack:\n`, err?.stack || err);

    return {
      connected: false,
      error: errorMessage,
      atlasHost,
      envLoaded: true,
      durationMs,
      stack: err?.stack,
    };
  }
}

export { db };
