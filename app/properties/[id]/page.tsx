import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Building, 
  MapPin, 
  Bed, 
  Bath, 
  Calendar, 
  ShieldCheck, 
  ArrowLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import PropertyCard, { formatPKR, Property } from "@/components/property/PropertyCard";
import PropertySidebarActions from "@/components/property/PropertySidebarActions";

import { isValidObjectId } from "@/lib/utils";

import RecentlyViewedTracker from "@/components/property/RecentlyViewedTracker";

interface PropertyDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const { id: propertyId } = await params;

  // Validate ObjectId for MongoDB
  if (!isValidObjectId(propertyId)) {
    notFound();
  }

  // 1. Fetch property by ID
  const property = await db.property.findUnique({
    where: { id: propertyId },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          image: true,
          role: true,
        },
      },
    },
  });

  if (!property) {
    notFound();
  }

  // 2. Fetch related properties (same area/locality, excluding current property)
  const relatedProperties = await db.property.findMany({
    where: {
      area: property.area,
      NOT: { id: property.id },
    },
    take: 3,
    include: {
      owner: {
        select: {
          name: true,
          profileImage: true,
          image: true,
        },
      },
    },
  });

  const formattedPrice = formatPKR(property.price);
  const postedDate = new Date(property.createdAt).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const mainImage = property.imageUrls?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&q=80";
  const allImages = property.imageUrls?.length ? property.imageUrls : [mainImage];

  return (
    <div className="bg-background text-foreground transition-colors duration-300">
      <RecentlyViewedTracker propertyId={property.id} />
      {/* Top Navigation Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <Link
            href="/properties"
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/properties" className="hover:text-primary">Properties</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground truncate max-w-[200px]">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Main Grid: Left details, Right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols on desktop) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Header Title Block */}
            <div className="flex flex-col gap-4 text-left">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground">
                  For {property.listingType === "SALE" ? "Sale" : "Rent"}
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-accent text-foreground">
                  {property.propertyType}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                {property.title}
              </h1>

              <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4.5 w-4.5 text-primary" />
                  {property.address}, {property.area}, {property.city}
                </span>
                <span className="hidden sm:inline">&bull;</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4.5 w-4.5 text-primary" />
                  Posted on {postedDate}
                </span>
              </div>
            </div>

            {/* Featured Large Image Panel */}
            <div className="flex flex-col gap-3">
              <div className="relative h-[300px] sm:h-[450px] w-full overflow-hidden rounded-3xl border border-border/80 shadow-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mainImage}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Real Elevation Photo
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {allImages.map((img, idx) => (
                    <div key={idx} className="relative h-16 rounded-xl overflow-hidden border border-border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`${property.title} gallery thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Property Specification Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm text-left">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Price</span>
                <span className="text-xl font-bold text-primary">
                  {formattedPrice} {property.listingType === "RENT" && <span className="text-xs font-normal text-muted-foreground">/ month</span>}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-l border-border/60 pl-4 sm:pl-6">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Area Size</span>
                <span className="text-xl font-bold text-foreground">{property.marla} Marla</span>
              </div>
              {property.propertyType !== "PLOT" ? (
                <>
                  <div className="flex flex-col gap-1 border-l border-border/60 pl-4 sm:pl-6">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Bedrooms</span>
                    <span className="text-xl font-bold text-foreground flex items-center gap-1.5">
                      <Bed className="h-4.5 w-4.5 text-primary" /> {property.bedrooms}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 border-l border-border/60 pl-4 sm:pl-6">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Bathrooms</span>
                    <span className="text-xl font-bold text-foreground flex items-center gap-1.5">
                      <Bath className="h-4.5 w-4.5 text-primary" /> {property.bathrooms}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1 border-l border-border/60 pl-4 sm:pl-6 col-span-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Land Details</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Building className="h-4.5 w-4.5 text-primary" /> Fully Developed Plot File
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-4 text-left">
              <h3 className="font-extrabold text-xl text-foreground">Property Description</h3>
              <div className="h-px bg-border/60 w-full" />
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Video Player Section */}
            {property.videoUrl && (
              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-4 text-left">
                <h3 className="font-extrabold text-xl text-foreground flex items-center gap-2">
                  🎥 Video Walkthrough Tour
                </h3>
                <div className="h-px bg-border/60 w-full" />
                <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-black aspect-video shadow-md">
                  <video
                    src={property.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column / Sticky Sidebar (4 cols on desktop) */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            {/* Seller Contact Profile Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-md flex flex-col gap-5 items-center text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground self-start mb-1 text-left">
                Listed By Seller
              </h3>
              
              <div className="relative flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold ring-4 ring-primary/20 overflow-hidden">
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
                <div>
                  <h4 className="font-bold text-base text-foreground">
                    {property.owner.name || "Peshawar Property Seller"}
                  </h4>
                  <span className="inline-block mt-0.5 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary">
                    {property.owner.role}
                  </span>
                </div>
              </div>

              <div className="w-full h-px bg-border/60" />

              {/* Seller details indicators */}
              <div className="w-full flex flex-col gap-2.5 text-xs text-muted-foreground text-left">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                  <span>Verified Identity Credentials</span>
                </div>
              </div>

              {/* Interaction Buttons client component */}
              <PropertySidebarActions
                ownerPhone={property.owner.phone}
                propertyTitle={property.title}
              />
            </div>
          </div>
        </div>

        {/* Bottom Related Properties Row */}
        {relatedProperties.length > 0 && (
          <div className="border-t border-border mt-16 pt-16 text-left">
            <h2 className="text-2xl font-extrabold tracking-tight mb-8">
              Similar Properties in {property.area}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop as Property} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
