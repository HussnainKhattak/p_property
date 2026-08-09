import { Prisma, ListingType } from "@prisma/client";
import { normalizePropertyType } from "./utils";

export interface ParsedSearchQuery {
  detectedListingType?: ListingType;
  detectedPropertyType?: string;
  tokens: string[];
}

/**
 * Natural language intent parser for search queries.
 * Detects property type (house/apartment/shop/plot) and listing type (rent/sale)
 * from multi-word natural queries like "luxury house for rent in hayatabad".
 */
export function parseNaturalQuery(query: string): ParsedSearchQuery {
  if (!query || !query.trim()) {
    return { tokens: [] };
  }

  const q = query.toLowerCase().trim();

  // Detect listing type intent
  let detectedListingType: ListingType | undefined = undefined;
  if (/\b(for rent|to rent|rental|rent)\b/i.test(q)) {
    detectedListingType = "RENT";
  } else if (/\b(for sale|to buy|buy|for sell|sale|sell)\b/i.test(q)) {
    detectedListingType = "SALE";
  }

  // Detect property type intent
  let detectedPropertyType: string | undefined = undefined;
  if (/\b(house|villas|villa|home|bungalow)\b/i.test(q)) {
    detectedPropertyType = "HOUSE";
  } else if (/\b(apartment|flat|studio|penthouse)\b/i.test(q)) {
    detectedPropertyType = "APARTMENT";
  } else if (/\b(shop|store|plaza|showroom|commercial)\b/i.test(q)) {
    detectedPropertyType = "SHOP";
  } else if (/\b(plot|land|file|marla|kanal)\b/i.test(q)) {
    detectedPropertyType = "PLOT";
  }

  // Stop words to omit from token matching
  const stopWords = new Set([
    "for", "to", "in", "at", "the", "a", "an", "and", "or", "of", "with", "near", "by", "is", "are"
  ]);

  // Extract individual keywords/tokens
  const rawTokens = q
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w));

  return {
    detectedListingType,
    detectedPropertyType,
    tokens: Array.from(new Set(rawTokens)),
  };
}

/**
 * Build Prisma MongoDB compatible search conditions from a natural text query and explicit filter params.
 */
export function buildQueryWhereConditions(
  query: string,
  rawPropType?: string,
  rawListType?: string
): {
  finalPropType?: string;
  finalListType?: ListingType;
  tokenConditions: Prisma.PropertyWhereInput[];
} {
  const parsed = parseNaturalQuery(query);

  const finalPropType = normalizePropertyType(rawPropType) || parsed.detectedPropertyType;
  const finalListType = rawListType
    ? rawListType.toUpperCase() === "BUY" || rawListType.toUpperCase() === "SALE"
      ? "SALE"
      : rawListType.toUpperCase() === "RENT"
      ? "RENT"
      : undefined
    : parsed.detectedListingType;

  // Filter out intent words if they are already handled by explicit enum filters
  const tokensToMatch = parsed.tokens.filter((t) => {
    if (finalPropType && ["house", "villas", "villa", "home", "apartment", "flat", "shop", "store", "plot", "land"].includes(t)) {
      return false;
    }
    if (finalListType && ["rent", "rental", "sale", "buy", "sell"].includes(t)) {
      return false;
    }
    return true;
  });

  const tokenConditions: Prisma.PropertyWhereInput[] = tokensToMatch.map((token) => ({
    OR: [
      { title: { contains: token, mode: "insensitive" as const } },
      { description: { contains: token, mode: "insensitive" as const } },
      { area: { contains: token, mode: "insensitive" as const } },
      { address: { contains: token, mode: "insensitive" as const } },
      { city: { contains: token, mode: "insensitive" as const } },
      { propertyType: { contains: token, mode: "insensitive" as const } },
      { subcategory: { contains: token, mode: "insensitive" as const } },
    ],
  }));

  return {
    finalPropType,
    finalListType,
    tokenConditions,
  };
}
