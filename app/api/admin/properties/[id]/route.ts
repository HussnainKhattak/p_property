import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidObjectId } from "@/lib/utils";

// PATCH /api/admin/properties/[id] — Toggle approval status (Approve/Reject)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!isValidObjectId(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const body = await req.json();
    const { isApproved } = body;

    if (typeof isApproved !== "boolean") {
      return NextResponse.json({ error: "isApproved must be a boolean" }, { status: 400 });
    }

    const updated = await db.property.update({
      where: { id: propertyId },
      data: { isApproved },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Failed to update property status: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/properties/[id] — Admin delete property bypass
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!isValidObjectId(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    await db.property.delete({
      where: { id: propertyId },
    });

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Failed to delete property listing: " + error.message },
      { status: 500 }
    );
  }
}
