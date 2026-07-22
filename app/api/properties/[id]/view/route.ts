import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { isValidObjectId } from "@/lib/utils";

// POST /api/properties/[id]/view — Anti-inflation property view counter
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;

    if (!isValidObjectId(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const cookieName = `viewed_prop_${propertyId}`;
    const alreadyViewed = cookieStore.get(cookieName);

    // If viewed within last 30 minutes, return current views without double-counting
    if (alreadyViewed) {
      const current = await db.property.findUnique({
        where: { id: propertyId },
        select: { id: true, views: true },
      });
      return NextResponse.json({
        message: "View already counted recently",
        views: current?.views ?? 0,
        incremented: false,
      });
    }

    // Increment view count in MongoDB
    const updatedProperty = await db.property.update({
      where: { id: propertyId },
      data: {
        views: {
          increment: 1,
        },
      },
      select: { id: true, views: true },
    });

    const response = NextResponse.json({
      message: "View registered successfully",
      views: updatedProperty.views,
      incremented: true,
    });

    // Set 30-minute anti-inflation session cookie
    response.cookies.set(cookieName, "true", {
      maxAge: 60 * 30, // 30 minutes
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (err: unknown) {
    const error = err as Error;
    console.error("View increment error:", error);
    return NextResponse.json(
      { error: "Failed to increment view count: " + error.message },
      { status: 500 }
    );
  }
}
