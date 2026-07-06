import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidObjectId } from "@/lib/utils";

// DELETE /api/bookings/[id] — Cancel a booking
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isValidObjectId(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const booking = await db.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isOwner = booking.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You cannot cancel this booking" }, { status: 403 });
    }

    await db.booking.delete({ where: { id: bookingId } });

    return NextResponse.json({ message: "Booking cancelled successfully" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Failed to cancel booking: " + error.message }, { status: 500 });
  }
}

// PATCH /api/bookings/[id] — Update booking status (Admin / Property Owner only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isValidObjectId(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const { status } = await req.json();
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { property: { select: { ownerId: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isPropertyOwner = booking.property.ownerId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isPropertyOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only the property owner or admin can update this booking" },
        { status: 403 }
      );
    }

    const updated = await db.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return NextResponse.json({ booking: updated, message: "Booking status updated" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Failed to update booking: " + error.message }, { status: 500 });
  }
}
