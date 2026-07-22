import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidObjectId } from "@/lib/utils";

// POST /api/properties/[id]/favorite — Add property to user's favorites
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: propertyId } = await params;
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

    if (!existingBookmark) {
      await db.savedProperty.create({
        data: {
          userId: session.user.id,
          propertyId,
        },
      });
    }

    // Sync actual total favorites count for property
    const actualCount = await db.savedProperty.count({
      where: { propertyId },
    });

    await db.property.update({
      where: { id: propertyId },
      data: { favoritesCount: actualCount },
    });

    return NextResponse.json({
      saved: true,
      favoritesCount: actualCount,
      message: "Added to saved properties",
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Favorite add error:", error);
    return NextResponse.json(
      { error: "Favorite operation failed: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id]/favorite — Remove property from user's favorites
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: propertyId } = await params;
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

    if (existingBookmark) {
      await db.savedProperty.delete({
        where: { id: existingBookmark.id },
      });
    }

    // Sync actual total favorites count for property
    const actualCount = await db.savedProperty.count({
      where: { propertyId },
    });

    await db.property.update({
      where: { id: propertyId },
      data: { favoritesCount: actualCount },
    });

    return NextResponse.json({
      saved: false,
      favoritesCount: actualCount,
      message: "Removed from saved properties",
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Favorite delete error:", error);
    return NextResponse.json(
      { error: "Favorite removal failed: " + error.message },
      { status: 500 }
    );
  }
}
