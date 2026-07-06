import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidObjectId } from "@/lib/utils";
import { bookingSchema } from "@/lib/validations/property";

// GET /api/bookings?propertyId=xxx — Get bookings for the authenticated user
// Admins / Agents see all; regular users see only their own
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    // Build filter - property owners & admins see all bookings, users see their own
    const where =
      session.user.role === "ADMIN"
        ? propertyId && isValidObjectId(propertyId)
          ? { propertyId }
          : {}
        : { userId: session.user.id };

    const bookings = await db.booking.findMany({
      where,
      include: {
        property: {
          select: { id: true, title: true, city: true, area: true, imageUrls: true, price: true },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Failed to fetch bookings: " + error.message }, { status: 500 });
  }
}

// POST /api/bookings — Create a visit booking for a property
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId, ...rest } = body;

    if (!propertyId || !isValidObjectId(propertyId)) {
      return NextResponse.json({ error: "Valid property ID is required" }, { status: 400 });
    }

    const parsed = bookingSchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid booking data" },
        { status: 400 }
      );
    }

    // Prevent booking own property
    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true, title: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.ownerId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot book your own property" },
        { status: 400 }
      );
    }

    // Check for duplicate pending booking
    const existingBooking = await db.booking.findFirst({
      where: {
        userId: session.user.id,
        propertyId,
        status: "PENDING",
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "You already have a pending booking for this property" },
        { status: 409 }
      );
    }

    const booking = await db.booking.create({
      data: {
        userId: session.user.id,
        propertyId,
        visitDate: parsed.data.visitDate,
        message: parsed.data.message ?? null,
        status: "PENDING",
      },
      include: {
        property: { select: { title: true, city: true, area: true } },
      },
    });

    return NextResponse.json({ booking, message: "Booking created successfully" }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Failed to create booking: " + error.message }, { status: 500 });
  }
}
