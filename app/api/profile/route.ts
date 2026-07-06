import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().nullable(),
  profileImage: z.string().url("Invalid image URL").optional().nullable(),
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

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        profileImage: parsed.data.profileImage ?? null,
      },
      select: {
        id: true, name: true, email: true, phone: true, profileImage: true, role: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile." },
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
