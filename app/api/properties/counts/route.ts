import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [total, grouped] = await Promise.all([
      db.property.count({ where: { isApproved: true } }),
      db.property.groupBy({
        by: ["propertyType"],
        where: { isApproved: true },
        _count: { id: true },
      }),
    ]);

    const counts: Record<string, number> = {
      ALL: total,
      APARTMENT: 0,
      HOUSE: 0,
      SHOP: 0,
      PLOT: 0,
    };

    grouped.forEach((g) => {
      counts[g.propertyType] = g._count.id;
    });

    return NextResponse.json(counts, {
      headers: {
        // Cache for 5 min at CDN/browser; serve stale for up to 10 min while revalidating.
        // Counts change rarely — this eliminates the DB round-trip for repeated navigations.
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Failed to fetch property counts: " + error.message },
      { status: 500 }
    );
  }
}
