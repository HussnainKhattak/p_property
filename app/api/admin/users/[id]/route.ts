import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { isValidObjectId } from "@/lib/utils";

// PATCH /api/admin/users/[id] — Update user role
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ error: "Invalid role value" }, { status: 400 });
    }

    // Prevent admin from downgrading their own role
    if (userId === session.user.id) {
      return NextResponse.json({ error: "You cannot change your own admin role" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: role as Role },
    });

    return NextResponse.json(updatedUser);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Failed to update user role: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] — Delete user
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json({ error: "You cannot delete your own account here" }, { status: 400 });
    }

    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Failed to delete user: " + error.message },
      { status: 500 }
    );
  }
}
