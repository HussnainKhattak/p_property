import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidObjectId } from "@/lib/utils";

// POST /api/properties/[id]/view — Increment the view count for a property
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;

    if (!isValidObjectId(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    // Increment the view counter by 1
    const property = await db.property.update({
      where: { id: propertyId },
      data: {
        views: {
          increment: 1,
        },
      },
      select: { id: true, views: true },
    });

    return NextResponse.json({ message: "View registered successfully", views: property.views });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("View increment error:", error);
    return NextResponse.json(
      { error: "Failed to increment view count: " + error.message },
      { status: 500 }
    );
  }
}
