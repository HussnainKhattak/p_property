import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidObjectId } from "@/lib/utils";

// GET /api/users/[id] — Fetch a user's public profile (seller/agent info)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        profileImage: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: { properties: true },
        },
        properties: {
          where: { isApproved: true },
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            area: true,
            imageUrls: true,
            propertyType: true,
            listingType: true,
            bedrooms: true,
            bathrooms: true,
            marla: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Failed to fetch user: " + error.message }, { status: 500 });
  }
}
