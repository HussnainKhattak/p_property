import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { ArrowRight, Clock } from "lucide-react";
import PropertyCard, { Property } from "../property/PropertyCard";
import { db } from "@/lib/db";

async function getLatestProperties(): Promise<Property[]> {
  // Opt out of Next.js data cache — always fetch live data
  noStore();
  try {
    const properties = await db.property.findMany({
      where: { isApproved: true, status: "AVAILABLE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        owner: {
          select: { name: true, profileImage: true, image: true },
        },
      },
    });

    return properties.map((p) => ({
      ...p,
      propertyType: p.propertyType as Property["propertyType"],
      listingType: p.listingType as Property["listingType"],
      status: p.status as Property["status"],
      marla: Number(p.marla),
    }));
  } catch {
    return [];
  }
}

export default async function LatestProperties() {
  const properties = await getLatestProperties();

  return (
    <section className="py-20 bg-accent/20 border-t border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="flex flex-col items-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Clock className="h-3.5 w-3.5" />
              Just Added
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Latest Property Listings
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
              Check out the newest listings added to our directory. Get in touch early before these high-demand properties are snatched up!
            </p>
          </div>
          <Link
            href="/properties?sort=newest"
            className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline group self-start md:self-end"
          >
            Browse All Listings
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Listings Grid */}
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl text-center gap-4">
            <Clock className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground font-medium">No listings yet.</p>
            <p className="text-sm text-muted-foreground/70">Newly added properties will appear here automatically.</p>
            <Link
              href="/properties/add"
              className="mt-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Add the First Property
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
