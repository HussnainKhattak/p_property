import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { propertySchema } from "@/lib/validations/property";
import { Prisma, PropertyType, ListingType } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

// POST /api/properties — Create a new property listing
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = propertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const property = await db.property.create({
      data: {
        title:        parsed.data.title,
        description:  parsed.data.description,
        price:        parsed.data.price,
        marla:        parsed.data.marla,
        city:         parsed.data.city,
        area:         parsed.data.area,
        address:      parsed.data.address,
        propertyType: parsed.data.propertyType,
        subcategory:  parsed.data.subcategory,
        listingType:  parsed.data.listingType,
        bedrooms:     parsed.data.bedrooms,
        bathrooms:    parsed.data.bathrooms,
        imageUrls:    parsed.data.imageUrls ?? [],
        videoUrl:     parsed.data.videoUrl ?? null,
        ownerId:      session.user.id,
      },
    });

    // Immediately invalidate all homepage and listing caches
    // so new property appears without requiring a manual refresh
    revalidatePath("/");
    revalidatePath("/properties");
    revalidateTag("properties");
    revalidateTag("featured-properties");
    revalidateTag("latest-properties");

    return NextResponse.json(property, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Property creation error:", error);
    return NextResponse.json(
      { error: "Failed to create property." },
      { status: 500 }
    );
  }
}

// GET /api/properties — Fetch all properties with optional basic filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const area        = searchParams.get("area");
    const propType    = searchParams.get("propertyType");
    const listType    = searchParams.get("listingType");
    const subcategory = searchParams.get("subcategory");

    const where: Prisma.PropertyWhereInput = {};
    if (area)        where.area         = { contains: area,     mode: "insensitive" };
    if (propType)    where.propertyType = propType as PropertyType;
    if (listType)    where.listingType  = listType as ListingType;
    if (subcategory) where.subcategory  = subcategory;

    const properties = await db.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { name: true, phone: true, profileImage: true, image: true },
        },
      },
    });

    return NextResponse.json(properties);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Failed to fetch properties: " + error.message },
      { status: 500 }
    );
  }
}
