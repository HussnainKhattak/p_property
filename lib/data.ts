import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { Property } from "@/components/property/PropertyCard";

/**
 * Performance diagnostic logger
 */
export function logTiming(name: string, startTime: number) {
  const duration = Date.now() - startTime;
  console.log(`[Perf Audit] ${name} completed in ${duration}ms`);
  return duration;
}

/**
 * Select only minimal required fields for property cards
 */
const PROPERTY_CARD_SELECT = {
  id: true,
  title: true,
  description: true,
  price: true,
  address: true,
  area: true,
  city: true,
  propertyType: true,
  subcategory: true,
  listingType: true,
  bedrooms: true,
  bathrooms: true,
  marla: true,
  status: true,
  imageUrls: true,
  videoUrl: true,
  views: true,
  createdAt: true,
  owner: {
    select: {
      name: true,
      profileImage: true,
      image: true,
    },
  },
} as const;

/**
 * Cached Featured Properties (Top 3 most viewed)
 */
export const getFeaturedProperties = unstable_cache(
  async (): Promise<Property[]> => {
    const start = Date.now();
    try {
      const properties = await db.property.findMany({
        where: { isApproved: true, status: "AVAILABLE" },
        orderBy: [{ views: "desc" }, { createdAt: "desc" }],
        take: 3,
        select: PROPERTY_CARD_SELECT,
      });

      logTiming("getFeaturedProperties DB Query", start);

      return properties.map((p) => ({
        ...p,
        propertyType: p.propertyType as Property["propertyType"],
        listingType: p.listingType as Property["listingType"],
        status: p.status as Property["status"],
        marla: Number(p.marla),
      }));
    } catch (err) {
      console.error("[Perf Audit] Error in getFeaturedProperties:", err);
      return [];
    }
  },
  ["featured-properties-v2"],
  { revalidate: 120, tags: ["featured-properties"] }
);

/**
 * Cached Latest Properties (Limited to small count, e.g. 4)
 */
export const getLatestProperties = unstable_cache(
  async (limit: number = 4): Promise<Property[]> => {
    const start = Date.now();
    try {
      const properties = await db.property.findMany({
        where: { isApproved: true, status: "AVAILABLE" },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: PROPERTY_CARD_SELECT,
      });

      logTiming("getLatestProperties DB Query", start);

      return properties.map((p) => ({
        ...p,
        propertyType: p.propertyType as Property["propertyType"],
        listingType: p.listingType as Property["listingType"],
        status: p.status as Property["status"],
        marla: Number(p.marla),
      }));
    } catch (err) {
      console.error("[Perf Audit] Error in getLatestProperties:", err);
      return [];
    }
  },
  ["latest-properties-v2"],
  { revalidate: 120, tags: ["latest-properties"] }
);

/**
 * Cached Popular Areas
 */
export const getPopularAreas = unstable_cache(
  async () => {
    const start = Date.now();
    try {
      const grouped = await db.property.groupBy({
        by: ["area"],
        where: { isApproved: true, status: "AVAILABLE" },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 4,
      });

      logTiming("getPopularAreas DB Query", start);
      return grouped;
    } catch (err) {
      console.error("[Perf Audit] Error in getPopularAreas:", err);
      return [];
    }
  },
  ["popular-areas-v2"],
  { revalidate: 300, tags: ["popular-areas"] }
);

/**
 * Cached Homepage Stats
 */
export const getHomepageStats = unstable_cache(
  async () => {
    const start = Date.now();
    try {
      const [totalProperties, totalUsers, totalViews, citiesRaw] = await Promise.all([
        db.property.count({ where: { isApproved: true } }),
        db.user.count(),
        db.property.aggregate({ _sum: { views: true } }),
        db.property.findMany({
          where: { isApproved: true },
          select: { city: true },
          distinct: ["city"],
        }),
      ]);

      logTiming("getHomepageStats DB Queries (Parallel)", start);

      return {
        totalProperties,
        totalUsers,
        totalViews: totalViews._sum.views ?? 0,
        totalCities: citiesRaw.length,
      };
    } catch (err) {
      console.error("[Perf Audit] Error in getHomepageStats:", err);
      return { totalProperties: 0, totalUsers: 0, totalViews: 0, totalCities: 0 };
    }
  },
  ["homepage-stats-v2"],
  { revalidate: 300, tags: ["homepage-stats"] }
);
