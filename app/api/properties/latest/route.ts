import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/properties/latest — Fetch newest properties sorted by createdAt descending
export async function GET() {
  try {
    const properties = await db.property.findMany({
      where: { isApproved: true, status: "AVAILABLE" },
      orderBy: { createdAt: "desc" },
      take: 6,
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
      { error: "Failed to fetch latest properties: " + error.message },
      { status: 500 }
    );
  }
}
