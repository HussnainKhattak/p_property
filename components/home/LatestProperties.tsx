import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import PropertyCard, { Property } from "../property/PropertyCard";

export default function LatestProperties() {
  // Mock properties matching the updated schema
  const latestListings: Property[] = [
    {
      id: "late-1",
      title: "5 Marla Brand New House in Regi Model Town",
      description: "Elegant double-story 5 Marla house in Zone C. Features 3 bedrooms, modern designer woodwork, granite tiling, and secure parking.",
      price: 18500000,
      address: "Zone C, Sector 2",
      city: "Peshawar",
      area: "Regi Model Town",
      propertyType: "HOUSE",
      listingType: "SALE",
      bedrooms: 3,
      bathrooms: 4,
      marla: 5.0,
      status: "AVAILABLE",
      imageUrls: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"],
      videoUrl: null,
      owner: {
        name: "Zarak Khan",
        profileImage: null
      }
    },
    {
      id: "late-2",
      title: "1 Kanal Residential Plot in DHA Phase 1",
      description: "Direct deal corner plot in DHA Sector B. Front facing park, fully developed block, utility lines connected. Ready for construction.",
      price: 29000000,
      address: "Sector B, Block 1",
      city: "Peshawar",
      area: "DHA Peshawar",
      propertyType: "PLOT",
      listingType: "SALE",
      bedrooms: 0,
      bathrooms: 0,
      marla: 20.0,
      status: "AVAILABLE",
      imageUrls: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"],
      videoUrl: null,
      owner: {
        name: "Afridi Estate",
        profileImage: null
      }
    },
    {
      id: "late-3",
      title: "Fully Furnished Office on University Road",
      description: "Ideal office setup for IT company or call center. Situated in executive building, University Road. Includes workstations, manager cabins, and power backup.",
      price: 75000,
      address: "Dean's Trade Center",
      city: "Peshawar",
      area: "University Town",
      propertyType: "OFFICE",
      listingType: "RENT",
      bedrooms: 0,
      bathrooms: 2,
      marla: 5.5,
      status: "AVAILABLE",
      imageUrls: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"],
      videoUrl: null,
      owner: {
        name: "KP Business Spaces",
        profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80"
      }
    }
  ];

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
            Browse Newest Uploads
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestListings.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
