import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { propertySchema } from "@/lib/validations/property";
import { isValidObjectId } from "@/lib/utils";

// GET /api/properties/[id] — Fetch details of a single property listing
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;

    if (!isValidObjectId(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const property = await db.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: {
          select: { name: true, phone: true, profileImage: true, image: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Failed to fetch property: " + error.message }, { status: 500 });
  }
}

// PATCH /api/properties/[id] — Update a property (owner only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isValidObjectId(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const property = await db.property.findUnique({ where: { id: propertyId } });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this property" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = propertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const updated = await db.property.update({
      where: { id: propertyId },
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
      },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Property update error:", error);
    return NextResponse.json({ error: "Failed to update property." }, { status: 500 });
  }
}

// PUT /api/properties/[id] — Alias to PATCH for standard REST compliance
export { PATCH as PUT };

// DELETE /api/properties/[id] — Delete a property (owner only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isValidObjectId(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const property = await db.property.findUnique({ where: { id: propertyId } });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this property" },
        { status: 403 }
      );
    }

    await db.property.delete({ where: { id: propertyId } });

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Property deletion error:", error);
    return NextResponse.json({ error: "Failed to delete property." }, { status: 500 });
  }
}
