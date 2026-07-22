import { NextResponse } from "next/server";
import { getLatestProperties, logTiming } from "@/lib/data";

// GET /api/properties/latest — Fetch newest properties with caching & timing diagnostic
export async function GET() {
  const start = Date.now();
  try {
    const properties = await getLatestProperties(4);
    logTiming("API GET /api/properties/latest", start);

    return NextResponse.json(properties, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (err: unknown) {
    logTiming("API GET /api/properties/latest (Failed)", start);
    const error = err as Error;
    return NextResponse.json(
      { error: "Failed to fetch latest properties: " + error.message },
      { status: 500 }
    );
  }
}
