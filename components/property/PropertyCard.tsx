"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bed, Bath, Maximize, MapPin, Building, Eye, Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import SavePropertyButton from "./SavePropertyButton";
import LazyImage from "@/components/ui/LazyImage";

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  area: string;
  city: string;
  propertyType: "HOUSE" | "APARTMENT" | "PLOT" | "COMMERCIAL" | "OFFICE";
  listingType: "SALE" | "RENT";
  bedrooms: number;
  bathrooms: number;
  marla: number;
  status: "AVAILABLE" | "SOLD" | "RENTED";
  imageUrls: string[];
  videoUrl: string | null;
  views?: number;
  favoritesCount?: number;
  createdAt?: Date | string;
  ownerId?: string;
  owner?: {
    name: string | null;
    profileImage: string | null;
    image?: string | null;
  };
}

interface PropertyCardProps {
  property: Property;
  index?: number;
}

import { formatPKR } from "@/lib/utils";

const formatArea = (marlas: number) => {
  if (marlas === 20) return "1 Kanal";
  if (marlas > 20 && marlas % 20 === 0) return `${marlas / 20} Kanal`;
  return `${marlas} Marla`;
};

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const { data: session } = useSession();
  const isOwner = !!(session?.user?.id && property.ownerId && session.user.id === property.ownerId);

  const mainImage =
    property.imageUrls?.[0] ||
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        delay: (index % 6) * 0.08,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
      whileHover={{ y: -4, transition: { duration: 0.22 } }}
    >
      {/* Property Image */}
      <div className="relative h-56 w-full overflow-hidden bg-muted">
        <LazyImage
          src={mainImage}
          alt={property.title}
          className="h-full w-full object-cover"
          wrapperClassName="h-full w-full"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Listing type & property type badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + (index % 6) * 0.08 }}
            className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-sm"
          >
            For {property.listingType === "SALE" ? "Sale" : "Rent"}
          </motion.span>
          <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-sm text-white shadow-sm">
            {property.propertyType}
          </span>
        </div>

        {/* Wishlist button */}
        <div className="absolute top-3 right-3">
          <SavePropertyButton propertyId={property.id} />
        </div>

        {/* Status badge (if not AVAILABLE) */}
        {property.status !== "AVAILABLE" && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-red-600 text-white shadow">
              {property.status}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4 flex-grow">
        {/* Price & Title */}
        <div className="flex flex-col gap-1.5">
          <div className="text-xl font-bold text-primary">
            {formatPKR(property.price)}{" "}
            {property.listingType === "RENT" && (
              <span className="text-xs font-normal text-muted-foreground">/ month</span>
            )}
          </div>
          <h3 className="font-bold text-base sm:text-lg line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {property.title}
          </h3>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="truncate">
            {property.address}, {property.area}
          </span>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border/60 text-xs font-medium text-muted-foreground">
          {property.propertyType !== "PLOT" ? (
            <>
              <div className="flex items-center justify-center gap-1.5">
                <Bed className="h-4 w-4 text-primary" />
                <span>{property.bedrooms ?? 0} Bed</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Bath className="h-4 w-4 text-primary" />
                <span>{property.bathrooms ?? 0} Bath</span>
              </div>
            </>
          ) : (
            <div className="col-span-2 flex items-center justify-start gap-1.5 pl-2">
              <Building className="h-4 w-4 text-primary" />
              <span>Plot Land Space</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-1.5 border-l border-border/60">
            <Maximize className="h-4 w-4 text-primary" />
            <span>{formatArea(property.marla)}</span>
          </div>
        </div>

        {/* View & Save counts - only visible to the property owner */}
        {isOwner && (
          <div className="flex items-center gap-3 text-[10px] font-bold py-1 px-2 rounded bg-accent/40 w-fit">
            <span className="flex items-center gap-1 text-emerald-500">
              <Eye className="h-3.5 w-3.5" />
              {property.views ?? 0} Views
            </span>
            <span className="h-3 w-px bg-border/60" />
            <span className="flex items-center gap-1 text-rose-500">
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              {property.favoritesCount ?? 0} Saves
            </span>
          </div>
        )}

        {/* Footer: owner + CTA */}
        <div className="flex items-center justify-between gap-4 mt-1">
          {property.owner ? (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center font-bold text-xs overflow-hidden">
                {property.owner.profileImage || property.owner.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={property.owner.profileImage || property.owner.image || ""}
                    alt={property.owner.name || "Owner"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  property.owner.name?.[0]?.toUpperCase() || "O"
                )}
              </div>
              <span className="text-xs text-muted-foreground font-medium truncate max-w-[100px]">
                {property.owner.name}
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Peshawar Property Hub</div>
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link
              href={`/properties/${property.id}`}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-accent text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              View Details
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
