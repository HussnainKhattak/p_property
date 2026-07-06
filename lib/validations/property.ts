import { z } from "zod";

// Match Prisma enum types as string validation schema
export const PropertyTypeEnum = z.enum(["HOUSE", "APARTMENT", "PLOT", "COMMERCIAL", "OFFICE"]);
export const ListingTypeEnum = z.enum(["RENT", "SALE"]);
export const PropertyStatusEnum = z.enum(["AVAILABLE", "SOLD", "RENTED"]);

export const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().default("Peshawar"),
  area: z.string().min(3, "Area location is required"),
  marla: z.coerce.number().positive("Area size in marla must be a positive number"),
  propertyType: PropertyTypeEnum,
  listingType: ListingTypeEnum,
  bedrooms: z.coerce.number().int().nonnegative().default(0),
  bathrooms: z.coerce.number().int().nonnegative().default(0),
  status: PropertyStatusEnum.default("AVAILABLE"),
  imageUrls: z.array(z.string().url("Invalid image URL")).default([]),
  videoUrl: z.string().url("Invalid video URL").optional().nullable(),
});

export const bookingSchema = z.object({
  visitDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "Visit date must be in the future",
  }),
  message: z.string().max(500, "Message cannot exceed 500 characters").optional().nullable(),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().min(5, "Review comment must be at least 5 characters").max(1000, "Review cannot exceed 1000 characters"),
});

export type PropertyInput = z.infer<typeof propertySchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
