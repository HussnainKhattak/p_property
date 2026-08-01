import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { propertySchema } from "@/lib/validations/property";
import { Prisma, ListingType } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { normalizePropertyType } from "@/lib/utils";

// POST /api/properties — Create a new property listing
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("[API POST /properties] body.propertyType:", body.propertyType, "| body.listingType:", body.listingType, "| body.subcategory:", body.subcategory);

    const parsed = propertySchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      console.error("[API POST /properties] Validation failed:", issues);
      return NextResponse.json(
        { error: issues[0] ?? "Validation failed", details: issues },
        { status: 400 }
      );
    }

    // Derive clean subcategory: for non-plot types use the propertyType as subcategory base
    // so we always store a meaningful value and never mix it with listingType
    const cleanSubcategory =
      parsed.data.subcategory && parsed.data.subcategory.trim() !== ""
        ? parsed.data.subcategory.trim()
        : parsed.data.propertyType;

    let property;
    try {
      property = await db.property.create({
        data: {
          title:        parsed.data.title,
          description:  parsed.data.description,
          price:        parsed.data.price,
          marla:        parsed.data.marla,
          city:         parsed.data.city,
          area:         parsed.data.area,
          address:      parsed.data.address,
          propertyType: parsed.data.propertyType,
          subcategory:  cleanSubcategory,
          listingType:  parsed.data.listingType,
          bedrooms:     parsed.data.bedrooms ?? 0,
          bathrooms:    parsed.data.bathrooms ?? 0,
          imageUrls:    parsed.data.imageUrls ?? [],
          videoUrl:     parsed.data.videoUrl ?? null,
          ownerId:      session.user.id,
        },
      });
    } catch (dbErr: any) {
      console.error("[API POST /properties] Prisma/DB error:", dbErr?.message, dbErr?.code);
      return NextResponse.json(
        { error: `Database error: ${dbErr?.message ?? "Unknown error"}` },
        { status: 500 }
      );
    }

    console.log("[API POST /properties] Created property id:", property.id, "type:", property.propertyType);

    revalidatePath("/");
    revalidatePath("/properties");
    revalidateTag("properties");
    revalidateTag("featured-properties");
    revalidateTag("latest-properties");

    return NextResponse.json(property, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[API POST /properties] Unexpected error:", error?.message, error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to create property" },
      { status: 500 }
    );
  }
}

// GET /api/properties — Fetch all properties with optional basic filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const area        = searchParams.get("area");
    const rawPropType = searchParams.get("propertyType");
    const propType    = normalizePropertyType(rawPropType);
    const listType    = searchParams.get("listingType");
    const subcategory = searchParams.get("subcategory");
    const ownerId     = searchParams.get("ownerId");

    const where: Prisma.PropertyWhereInput = {};
    if (area)        where.area         = { contains: area, mode: "insensitive" };
    if (propType)    where.propertyType = propType;
    if (listType)    where.listingType  = listType as ListingType;
    if (subcategory) where.subcategory  = subcategory;
    if (ownerId)     where.ownerId      = ownerId;

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
