import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await pingDatabase();

  if (result.connected) {
    return NextResponse.json({
      database: "connected",
    });
  }

  return NextResponse.json(
    {
      database: "failed",
      error: result.error,
      atlasHost: result.atlasHost,
      envLoaded: result.envLoaded,
    },
    { status: 500 }
  );
}
