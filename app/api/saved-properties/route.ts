import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidObjectId } from "@/lib/utils";

// GET /api/saved-properties — Fetch user's saved properties
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedList = await db.savedProperty.findMany({
      where: { userId: session.user.id },
      include: {
        property: {
          include: {
            owner: {
              select: { name: true, profileImage: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const properties = savedList
      .map((item) => item.property)
      .filter((prop) => prop !== null);

    return NextResponse.json(properties);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Saved properties retrieval error:", error);
    return NextResponse.json({ error: "Failed to fetch saved listings: " + error.message }, { status: 500 });
  }
}

// POST /api/saved-properties — Toggle bookmark status for a property
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId } = await req.json();

    if (!propertyId || !isValidObjectId(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const existingBookmark = await db.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: session.user.id,
          propertyId,
        },
      },
    });

    let isSaved = false;
    if (existingBookmark) {
      // Unbookmark
      await db.savedProperty.delete({
        where: { id: existingBookmark.id },
      });
      isSaved = false;
    } else {
      // Bookmark
      await db.savedProperty.create({
        data: {
          userId: session.user.id,
          propertyId,
        },
      });
      isSaved = true;
    }

    // Keep Property.favoritesCount synchronized with actual count
    const actualCount = await db.savedProperty.count({
      where: { propertyId },
    });

    await db.property.update({
      where: { id: propertyId },
      data: { favoritesCount: actualCount },
    });

    return NextResponse.json({
      saved: isSaved,
      favoritesCount: actualCount,
      message: isSaved ? "Added to saved properties" : "Removed from saved properties",
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Bookmark operation failed: " + error.message }, { status: 500 });
  }
}
