import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const categories = await db.category.findMany({
      orderBy: { name: "asc" }
    });

    return NextResponse.json(categories);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Failed to fetch categories: " + error.message },
      { status: 500 }
    );
  }
}
