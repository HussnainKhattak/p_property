import { Suspense } from "react";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import PropertiesClient from "@/components/property/PropertiesClient";
import { Loader2 } from "lucide-react";

interface PropertiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getInitialProperties(sp: Record<string, string | string[] | undefined>) {
  const get = (key: string) => (typeof sp[key] === "string" ? sp[key] as string : "");

  const query       = get("query");
  const city        = get("city");
  const area        = get("area");
  const minPrice    = get("minPrice");
  const maxPrice    = get("maxPrice");
  const minMarla    = get("minMarla");
  const maxMarla    = get("maxMarla");
  const propType    = get("propertyType");
  const listType    = get("listingType");
  const bedrooms    = get("bedrooms");
  const bathrooms   = get("bathrooms");
  const sortBy      = get("sortBy") || "newest";
  const page        = parseInt(get("page") || "1");
  const limit       = 12;

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
      city     ? { city: { contains: city, mode: "insensitive" } }                             : {},
      area     ? { area: { contains: area, mode: "insensitive" } }                             : {},
      propType ? { propertyType: propType as Prisma.EnumPropertyTypeFilter["equals"] }         : {},
      listType ? { listingType:  listType as Prisma.EnumListingTypeFilter["equals"]  }         : {},
      minPrice ? { price: { gte: parseFloat(minPrice) } }                                      : {},
      maxPrice ? { price: { lte: parseFloat(maxPrice) } }                                      : {},
      minMarla ? { marla: { gte: parseFloat(minMarla) } }                                      : {},
      maxMarla ? { marla: { lte: parseFloat(maxMarla) } }                                      : {},
      bedrooms  ? { bedrooms:  { gte: parseInt(bedrooms)  } }                                  : {},
      bathrooms ? { bathrooms: { gte: parseInt(bathrooms) } }                                  : {},
    ],
  };

  const orderByMap: Record<string, Prisma.PropertyOrderByWithRelationInput> = {
    newest:    { createdAt: "desc" },
    oldest:    { createdAt: "asc"  },
    price_asc: { price:     "asc"  },
    price_desc:{ price:     "desc" },
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
    properties,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    page,
  };
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const sp      = await searchParams;
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
