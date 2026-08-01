import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates that a string is a valid MongoDB ObjectId (24 hex characters).
 * Use before any database query that accepts an ID from user input.
 */
export function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

/**
 * Formats a PKR currency value into words (Lakh / Crore) or standard format.
 */
export function formatPKR(price: number): string {
  if (price >= 10000000) {
    return `${(price / 10000000).toFixed(2).replace(/\.00$/, "")} Crore`;
  }
  if (price >= 100000) {
    return `${(price / 100000).toFixed(2).replace(/\.00$/, "")} Lakh`;
  }
  return `${price.toLocaleString()} PKR`;
}

/**
 * Normalizes property type string (e.g. "Apartment", "apartments", "APARTMENT")
 * to standard Prisma PropertyType enum ("APARTMENT" | "HOUSE" | "SHOP" | "PLOT").
 */
export function normalizePropertyType(type?: string | null): "APARTMENT" | "HOUSE" | "SHOP" | "PLOT" | undefined {
  if (!type) return undefined;
  const upper = type.trim().toUpperCase();
  if (upper === "APARTMENT" || upper === "APARTMENTS") return "APARTMENT";
  if (upper === "HOUSE" || upper === "HOUSES") return "HOUSE";
  if (upper === "SHOP" || upper === "SHOPS") return "SHOP";
  if (upper === "PLOT" || upper === "PLOTS") return "PLOT";
  return undefined;
}
