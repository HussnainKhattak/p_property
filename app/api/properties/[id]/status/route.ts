import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidObjectId } from "@/lib/utils";
import { PropertyStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

const ALLOWED_STATUSES: PropertyStatus[] = ["AVAILABLE", "BOOKED", "SOLD", "RENTED"];

// PATCH /api/properties/[id]/status — Update property status (owner or admin only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isValidObjectId(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !ALLOWED_STATUSES.includes(status as PropertyStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Only the property owner or an admin can change status
    const isOwner = property.ownerId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to update this property's status" },
        { status: 403 }
      );
    }

    const updated = await db.property.update({
      where: { id: propertyId },
      data: { status: status as PropertyStatus },
    });

    // Revalidate all property-related caches
    revalidatePath("/");
    revalidatePath("/properties");
    revalidateTag("properties");
    revalidateTag("featured-properties");
    revalidateTag("latest-properties");
    revalidateTag("popular-areas");
    revalidateTag("homepage-stats");

    return NextResponse.json({
      message: `Property status updated to ${status}`,
      property: updated,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Property status update error:", error);
    return NextResponse.json(
      { error: "Failed to update property status." },
      { status: 500 }
    );
  }
}
