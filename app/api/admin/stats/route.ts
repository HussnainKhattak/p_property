import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [totalUsers, totalProperties, recentProperties] = await Promise.all([
      db.user.count(),
      db.property.count(),
      db.property.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalProperties,
      recentProperties,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Failed to fetch stats: " + error.message },
      { status: 500 }
    );
  }
}
