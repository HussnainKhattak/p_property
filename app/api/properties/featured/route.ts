import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/properties/featured — Fetch top 3 featured properties sorted by views (fallback to newest)
export async function GET() {
  try {
    const properties = await db.property.findMany({
      where: { isApproved: true, status: "AVAILABLE" },
      orderBy: [
        { views: "desc" },
        { createdAt: "desc" },
      ],
      take: 3,
      include: {
        owner: {
          select: { name: true, phone: true, profileImage: true, image: true },
        },
      },
    });

    return NextResponse.json(properties);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Failed to fetch featured properties: " + error.message },
      { status: 500 }
    );
  }
}
