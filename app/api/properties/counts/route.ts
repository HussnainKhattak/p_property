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
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
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
