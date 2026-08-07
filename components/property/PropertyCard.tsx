"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bed, Bath, Maximize, MapPin, Building, Eye, Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import SavePropertyButton from "./SavePropertyButton";
import LazyImage from "@/components/ui/LazyImage";
import AvatarZoom from "@/components/ui/AvatarZoom";
import DashboardActions from "../dashboard/DashboardActions";
import { useRouter } from "next/navigation";
import { useState } from "react";
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  area: string;
  city: string;
  propertyType: "HOUSE" | "APARTMENT" | "SHOP" | "PLOT";
  subcategory: string;
  listingType: "SALE" | "RENT";
  bedrooms: number;
  bathrooms: number;
  marla: number;
  status: "AVAILABLE" | "SOLD" | "RENTED" | "BOOKED";
  imageUrls: string[];
  videoUrl: string | null;
  views?: number;
  favoritesCount?: number;
  createdAt?: Date | string;
  ownerId?: string | null;
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

  const router = useRouter();
  const [localStatus, setLocalStatus] = useState(property.status);

  const handleStatusChange = (propertyId: string, newStatus: string) => {
    setLocalStatus(newStatus as Property["status"]);
    router.refresh();
  };

  const handleDelete = (propertyId: string) => {
    router.refresh();
  };

  const rawImage = property.imageUrls?.[0];
  const mainImage = rawImage
    ? rawImage.includes("res.cloudinary.com") && !rawImage.includes("w_600")
      ? rawImage.replace("/upload/", "/upload/w_600,c_scale,q_auto,f_auto/")
      : rawImage
    : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80";

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
      {/*
        Image section — padding-top percentage trick guarantees the container
        height is always exactly 56.25% of the card's own width (= 16:9).
        On a 360px-wide mobile card this = ~203px. The inner absolute div
        fills the space so LazyImage renders correctly inside it.
      */}
      <div className="relative w-full overflow-hidden bg-muted" style={{ paddingTop: "56.25%" }}>
        {/* Fills the padding-top space */}
        <div className="absolute inset-0">
          <LazyImage
            src={mainImage}
            alt={property.title}
            className="h-full w-full object-cover object-center"
            wrapperClassName="h-full w-full"
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Listing type & property type badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 sm:top-3 sm:left-3 sm:gap-2">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + (index % 6) * 0.08 }}
            className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-sm"
          >
            For {property.listingType === "SALE" ? "Sale" : "Rent"}
          </motion.span>
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-sm text-white shadow-sm">
            {property.propertyType}
          </span>
        </div>

        {/* Wishlist button */}
        <div className="absolute top-2 right-2 z-20 sm:top-3 sm:right-3">
          <SavePropertyButton propertyId={property.id} />
        </div>

        {isOwner && (
          <div className="absolute bottom-2 right-2 z-20 sm:bottom-3 sm:right-3">
            <DashboardActions
              propertyId={property.id}
              status={localStatus}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] uppercase font-bold tracking-wider backdrop-blur-md shadow-sm border ${
            localStatus === "AVAILABLE"
              ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/30"
              : localStatus === "BOOKED"
                ? "bg-red-500/20 text-red-100 border-red-400/30"
                : localStatus === "SOLD"
                  ? "bg-orange-500/20 text-orange-100 border-orange-400/30"
                  : "bg-amber-500/20 text-amber-100 border-amber-400/30"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
              localStatus === "AVAILABLE" ? "bg-emerald-400 animate-pulse" :
              localStatus === "BOOKED" ? "bg-red-400" :
              localStatus === "SOLD" ? "bg-orange-400" :
              "bg-amber-400"
            }`} />
            {localStatus}
          </span>
        </div>
      </div>

      {/* Card content */}
      <div className="p-3 sm:p-5 flex flex-col gap-2 sm:gap-3 flex-grow">

        {/* Price & Title */}
        <div className="flex flex-col gap-0.5">
          <div className="text-base sm:text-xl font-bold text-primary leading-tight">
            {formatPKR(property.price)}{" "}
            {property.listingType === "RENT" && (
              <span className="text-xs font-normal text-muted-foreground">/ month</span>
            )}
          </div>
          <h3 className="font-semibold text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors duration-200 leading-snug">
            {property.title}
          </h3>
        </div>

        {/* Location — single truncated line */}
        <div className="flex items-center gap-1 text-muted-foreground text-xs min-w-0">
          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary flex-shrink-0" />
          <span className="truncate">
            {property.address}, {property.area}
          </span>
        </div>

        {/* Specs row */}
        <div className="grid grid-cols-3 gap-1 py-1.5 sm:py-2.5 border-t border-b border-border/60 text-[10px] sm:text-xs font-medium text-muted-foreground">
          {property.propertyType !== "PLOT" ? (
            <>
              <div className="flex items-center justify-center gap-1">
                <Bed className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                <span>{property.bedrooms ?? 0} Bed</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Bath className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                <span>{property.bathrooms ?? 0} Bath</span>
              </div>
            </>
          ) : (
            <div className="col-span-2 flex items-center justify-start gap-1 pl-1">
              <Building className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
              <span>Plot Land</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-1 border-l border-border/60">
            <Maximize className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
            <span>{formatArea(property.marla)}</span>
          </div>
        </div>

        {/* View & Save counts — owner only */}
        {isOwner && (
          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold py-0.5 px-1.5 rounded bg-accent/40 w-fit">
            <span className="flex items-center gap-0.5 text-emerald-500">
              <Eye className="h-3 w-3" />
              {property.views ?? 0} Views
            </span>
            <span className="h-2.5 w-px bg-border/60" />
            <span className="flex items-center gap-0.5 text-rose-500">
              <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
              {property.favoritesCount ?? 0} Saves
            </span>
          </div>
        )}

        {/* Footer: agent avatar + name on left, View Details button on right — one row, never wraps */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-0.5">
          {property.owner ? (
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <AvatarZoom
                src={property.owner.profileImage || property.owner.image}
                alt={property.owner.name || "Owner"}
                size={24}
                zoomedSize={160}
                fallback={property.owner.name?.[0]?.toUpperCase() || "O"}
                className="bg-accent text-foreground text-[10px]"
              />
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
                {property.owner.name}
              </span>
            </div>
          ) : (
            <div className="text-[10px] sm:text-xs text-muted-foreground truncate flex-1">
              Peshawar Property Hub
            </div>
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="flex-shrink-0">
            <Link
              href={`/properties/${property.id}`}
              className="text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-accent text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 whitespace-nowrap"
            >
              View Details
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
