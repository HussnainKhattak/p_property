import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidObjectId } from "@/lib/utils";

// DELETE /api/reviews/[id] — Delete a review (owner or admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isValidObjectId(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    const review = await db.review.findUnique({ where: { id: reviewId } });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const isOwner = review.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You cannot delete this review" }, { status: 403 });
    }

    await db.review.delete({ where: { id: reviewId } });

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Failed to delete review: " + error.message }, { status: 500 });
  }
}
