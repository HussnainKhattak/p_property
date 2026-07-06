import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma, PropertyType, ListingType } from "@prisma/client";

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
    const propType  = searchParams.get("propertyType")       || "";
    const listType  = searchParams.get("listingType")        || "";
    const bedrooms  = searchParams.get("bedrooms")           || "";
    const bathrooms = searchParams.get("bathrooms")          || "";
    const sortBy    = searchParams.get("sortBy")             || "newest";
    const page      = parseInt(searchParams.get("page")  || "1");
    const limit     = parseInt(searchParams.get("limit") || "12");

    // Build MongoDB-compatible where clause
    const where: Prisma.PropertyWhereInput = {
      AND: [
        query
          ? {
              OR: [
                { title:       { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { area:        { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        city     ? { city: { contains: city, mode: "insensitive" } }  : {},
        area     ? { area: { contains: area, mode: "insensitive" } }  : {},
        propType ? { propertyType: propType as PropertyType }          : {},
        listType ? { listingType:  listType as ListingType  }          : {},
        minPrice ? { price: { gte: parseFloat(minPrice) } }           : {},
        maxPrice ? { price: { lte: parseFloat(maxPrice) } }           : {},
        minMarla ? { marla: { gte: parseFloat(minMarla) } }           : {},
        maxMarla ? { marla: { lte: parseFloat(maxMarla) } }           : {},
        bedrooms  ? { bedrooms:  { gte: parseInt(bedrooms)  } }       : {},
        bathrooms ? { bathrooms: { gte: parseInt(bathrooms) } }       : {},
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
