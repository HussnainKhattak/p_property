import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(3, "Username must be at least 3 characters").max(30, "Username cannot exceed 30 characters"),
  phone: z.string().optional().nullable(),
  profileImage: z.union([z.string().url("Invalid image URL"), z.literal(""), z.null()]).optional(),
});

// PATCH /api/profile — update authenticated user's profile
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const trimmedName = parsed.data.name.trim();

    // Check for duplicate username (case-insensitive)
    const existingName = await db.user.findFirst({
      where: {
        name: { equals: trimmedName, mode: "insensitive" },
        NOT: { id: session.user.id },
      },
    });

    if (existingName) {
      return NextResponse.json(
        { error: "Username is already taken by another account. Please choose a different username." },
        { status: 400 }
      );
    }

    const newProfileImage = parsed.data.profileImage || null;

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: trimmedName,
        phone: parsed.data.phone ?? null,
        profileImage: newProfileImage,
        image: newProfileImage,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err: any) {
    console.error("[Profile API Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}

export { PATCH as PUT };

// GET /api/profile — fetch full profile data
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true, phone: true,
        profileImage: true, role: true, createdAt: true,
        _count: { select: { properties: true, bookings: true, reviews: true } },
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch profile." },
      { status: 500 }
    );
  }
}
