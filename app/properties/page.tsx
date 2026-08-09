import { Suspense } from "react";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import PropertiesClient from "@/components/property/PropertiesClient";
import { Loader2 } from "lucide-react";
import { normalizePropertyType } from "@/lib/utils";

interface PropertiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getInitialProperties(sp: Record<string, string | string[] | undefined>) {
  const get = (key: string) => (typeof sp[key] === "string" ? sp[key] as string : "");

  const query = get("query");
  const city = get("city");
  const area = get("area");
  const minPrice = get("minPrice");
  const maxPrice = get("maxPrice");
  const minMarla = get("minMarla");
  const maxMarla = get("maxMarla");
  const rawPropType = get("propertyType");
  const propType = normalizePropertyType(rawPropType);
  const rawListType = get("listingType");
  const normalizedListType = rawListType
    ? rawListType.toUpperCase() === "BUY" || rawListType.toUpperCase() === "SALE"
      ? "SALE"
      : rawListType.toUpperCase() === "RENT"
        ? "RENT"
        : undefined
    : undefined;
  const subcategory = get("subcategory");
  const bedrooms = get("bedrooms");
  const bathrooms = get("bathrooms");
  const sortBy = get("sortBy") || "newest";
  const page = parseInt(get("page") || "1");
  const limit = 12;

  const parsedMinPrice = minPrice && !isNaN(parseFloat(minPrice)) ? parseFloat(minPrice) : undefined;
  const parsedMaxPrice = maxPrice && !isNaN(parseFloat(maxPrice)) ? parseFloat(maxPrice) : undefined;
  const parsedMinMarla = minMarla && !isNaN(parseFloat(minMarla)) ? parseFloat(minMarla) : undefined;
  const parsedMaxMarla = maxMarla && !isNaN(parseFloat(maxMarla)) ? parseFloat(maxMarla) : undefined;

  const areaKeywords = area
    ? Array.from(new Set([
        area,
        ...area.split(" ").filter((w) => w.length > 2 && w.toLowerCase() !== "peshawar" && w.toLowerCase() !== "road")
      ]))
    : [];

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
      areaKeywords.length > 0
        ? {
            OR: areaKeywords.flatMap((kw) => [
              { area:    { contains: kw, mode: "insensitive" } },
              { address: { contains: kw, mode: "insensitive" } },
              { city:    { contains: kw, mode: "insensitive" } },
              { title:   { contains: kw, mode: "insensitive" } },
            ]),
          }
        : {},
      propType ? { propertyType: propType } : {},
      normalizedListType ? { listingType: normalizedListType as Prisma.EnumListingTypeFilter["equals"] } : {},
      subcategory ? { subcategory: subcategory } : {},
      parsedMinPrice !== undefined ? { price: { gte: parsedMinPrice } } : {},
      parsedMaxPrice !== undefined ? { price: { lte: parsedMaxPrice } } : {},
      parsedMinMarla !== undefined ? { marla: { gte: parsedMinMarla } } : {},
      parsedMaxMarla !== undefined ? { marla: { lte: parsedMaxMarla } } : {},
      bedrooms ? { bedrooms: { gte: parseInt(bedrooms) } } : {},
      bathrooms ? { bathrooms: { gte: parseInt(bathrooms) } } : {},
    ],
  };

  const orderByMap: Record<string, Prisma.PropertyOrderByWithRelationInput> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
  };

  const [properties, totalCount] = await Promise.all([
    db.property.findMany({
      where,
      orderBy: orderByMap[sortBy] ?? { createdAt: "desc" },
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

  return {
    properties: properties.map((p) => ({
      ...p,
      ownerId: p.ownerId ?? undefined,
      owner: p.owner ?? undefined,
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    page,
  };
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const sp = await searchParams;
  const initial = await getInitialProperties(sp);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PropertiesClient initial={initial} />
    </Suspense>
  );
}
