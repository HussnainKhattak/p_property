import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, image } = body;

    if (!title || !description || !image) {
      return NextResponse.json(
        { error: "Title, description, and image URL are required" },
        { status: 400 }
      );
    }

    const updated = await db.category.update({
      where: { id },
      data: {
        title,
        description,
        image,
      },
    });

    // Revalidate paths using static cached assets
    revalidatePath("/");

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Category update error:", error);
    return NextResponse.json(
      { error: "Failed to update category: " + error.message },
      { status: 500 }
    );
  }
}
