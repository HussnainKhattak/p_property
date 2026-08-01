import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma, ListingType } from "@prisma/client";
import { normalizePropertyType } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const query     = searchParams.get("query")?.trim()      || "";
    const city      = searchParams.get("city")?.trim()       || "";
    const area      = searchParams.get("area")?.trim()       || "";
    const minPrice  = searchParams.get("minPrice")           || "";
    const maxPrice  = searchParams.get("maxPrice")           || "";
    const minMarla  = searchParams.get("minMarla")           || "";
    const maxMarla  = searchParams.get("maxMarla")           || "";
    const rawPropType = searchParams.get("propertyType")       || "";
    const propType    = normalizePropertyType(rawPropType);
    const rawListType = searchParams.get("listingType")        || "";
    const normalizedListType = rawListType
      ? rawListType.toUpperCase() === "BUY" || rawListType.toUpperCase() === "SALE"
        ? "SALE"
        : rawListType.toUpperCase() === "RENT"
        ? "RENT"
        : undefined
      : undefined;

    const subcategory = searchParams.get("subcategory")        || "";
    const bedrooms    = searchParams.get("bedrooms")           || "";
    const bathrooms   = searchParams.get("bathrooms")          || "";
    const sortBy      = searchParams.get("sortBy")             || "newest";
    const page        = parseInt(searchParams.get("page")  || "1");
    const limit       = parseInt(searchParams.get("limit") || "12");

    // Build MongoDB-compatible where clause
    const where: Prisma.PropertyWhereInput = {
      AND: [
        query
          ? {
              OR: [
                { title:       { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { area:        { contains: query, mode: "insensitive" } },
                { address:     { contains: query, mode: "insensitive" } },
                { city:        { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        city ? { city: { contains: city, mode: "insensitive" } } : {},
        area
          ? {
              OR: [
                { area:    { contains: area, mode: "insensitive" } },
                { address: { contains: area, mode: "insensitive" } },
                { city:    { contains: area, mode: "insensitive" } },
              ],
            }
          : {},
        propType           ? { propertyType: propType }                      : {},
        normalizedListType ? { listingType:  normalizedListType as ListingType } : {},
        subcategory        ? { subcategory:  subcategory }                    : {},
        minPrice           ? { price: { gte: parseFloat(minPrice) } }        : {},
        maxPrice           ? { price: { lte: parseFloat(maxPrice) } }        : {},
        minMarla           ? { marla: { gte: parseFloat(minMarla) } }        : {},
        maxMarla           ? { marla: { lte: parseFloat(maxMarla) } }        : {},
        bedrooms           ? { bedrooms:  { gte: parseInt(bedrooms)  } }    : {},
        bathrooms          ? { bathrooms: { gte: parseInt(bathrooms) } }    : {},
      ],
    };

    const orderByMap: Record<string, Prisma.PropertyOrderByWithRelationInput> = {
      newest:     { createdAt: "desc" },
      oldest:     { createdAt: "asc"  },
      price_asc:  { price:     "asc"  },
      price_desc: { price:     "desc" },
    };
    const orderBy = orderByMap[sortBy] ?? { createdAt: "desc" };

    const [properties, totalCount] = await Promise.all([
      db.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          owner: {
            select: { name: true, profileImage: true, image: true },
          },
        },
      }),
      db.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Search failed: " + error.message },
      { status: 500 }
    );
  }
}
