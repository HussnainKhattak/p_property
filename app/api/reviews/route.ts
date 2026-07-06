import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidObjectId } from "@/lib/utils";
import { reviewSchema } from "@/lib/validations/property";

// GET /api/reviews?propertyId=xxx — Get all reviews for a property (public)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId || !isValidObjectId(propertyId)) {
      return NextResponse.json({ error: "Valid propertyId query parameter is required" }, { status: 400 });
    }

    const reviews = await db.review.findMany({
      where: { propertyId },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    return NextResponse.json({
      reviews,
      totalReviews: reviews.length,
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Failed to fetch reviews: " + error.message }, { status: 500 });
  }
}

// POST /api/reviews — Submit a review for a property (authenticated)
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

    const parsed = reviewSchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid review data" },
        { status: 400 }
      );
    }

    // Prevent reviewing own property
    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.ownerId === session.user.id) {
      return NextResponse.json({ error: "You cannot review your own property" }, { status: 400 });
    }

    // Upsert: update if already reviewed, create otherwise
    const review = await db.review.upsert({
      where: {
        userId_propertyId: {
          userId: session.user.id,
          propertyId,
        },
      },
      update: {
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
      create: {
        userId: session.user.id,
        propertyId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
      include: {
        user: { select: { name: true, profileImage: true, image: true } },
      },
    });

    return NextResponse.json({ review, message: "Review submitted successfully" }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Failed to submit review: " + error.message }, { status: 500 });
  }
}
