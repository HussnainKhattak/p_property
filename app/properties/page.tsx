import { Suspense } from "react";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import PropertiesClient from "@/components/property/PropertiesClient";
import { Loader2 } from "lucide-react";
import { buildQueryWhereConditions } from "@/lib/search";

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
  const rawListType = get("listingType");
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

  // Use natural query builder to extract intent (rent/sale, house/apartment/etc.) and tokenized conditions
  const { finalPropType, finalListType, tokenConditions } = buildQueryWhereConditions(query, rawPropType, rawListType);

  const areaKeywords = area
    ? Array.from(new Set([
        area,
        ...area.split(" ").filter((w) => w.length > 2 && w.toLowerCase() !== "peshawar" && w.toLowerCase() !== "road")
      ]))
    : [];

  const where: Prisma.PropertyWhereInput = {
    AND: [
      ...tokenConditions,
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
      finalPropType ? { propertyType: finalPropType } : {},
      finalListType ? { listingType: finalListType as Prisma.EnumListingTypeFilter["equals"] } : {},
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
