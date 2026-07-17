import Link from "next/link";
import { ChevronRight, MapPin, Building } from "lucide-react";
import { db } from "@/lib/db";

// Known Peshawar areas with static descriptions and sub-areas
const AREA_META: Record<
  string,
  { description: string; subAreas: string[] }
> = {
  "DHA Peshawar": {
    description:
      "Peshawar's premium gated community with top security, state-of-the-art facilities, and unmatched investment potential.",
    subAreas: ["Sector A", "Sector B", "Sector C", "Sector D"],
  },
  Hayatabad: {
    description:
      "The crown jewel of Peshawar. Green belts, parks, top schools, commercial sectors, and phase-wise planning.",
    subAreas: ["Phase 1 – 3", "Phase 4 – 5", "Phase 6", "Phase 7"],
  },
  "Regi Model Town": {
    description:
      "One of the oldest planned schemes offering modern layout at relatively affordable prices. Rapid construction ongoing.",
    subAreas: ["Zone 1", "Zone 3", "Zone 4", "Zone 5"],
  },
  "Warsak Road": {
    description:
      "Host to several peaceful residential societies like Askari and Prime Town. Excellent connectivity to core city.",
    subAreas: ["Askari 6", "Prime City", "Warsak Executive", "Yaseen Town"],
  },
  "University Town": {
    description:
      "Premier upscale residential enclave adjacent to major universities and the diplomatic enclave.",
    subAreas: ["Phase 1", "Phase 2", "Main Road"],
  },
  "Peshawar Cantonment": {
    description:
      "Oldest planned area of Peshawar, featuring heritage bungalows, military housing, and premium commercial strips.",
    subAreas: ["Old Cantonment", "New Cantonment", "Saddar Road"],
  },
};

async function getPopularAreas() {
  try {
    // Group properties by area from real DB
    const grouped = await db.property.groupBy({
      by: ["area"],
      where: { isApproved: true, status: "AVAILABLE" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 4,
    });

    return grouped.map((g) => ({
      name: g.area,
      count: g._count.id,
      ...(AREA_META[g.area] ?? {
        description: `Properties available in ${g.area}, Peshawar.`,
        subAreas: [],
      }),
    }));
  } catch {
    return [];
  }
}

export default async function PopularAreas() {
  const areas = await getPopularAreas();

  if (areas.length === 0) return null;

  return (
    <section className="py-20 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 mb-3">
            <MapPin className="h-3.5 w-3.5" /> Neighborhood Finder
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Popular Neighborhoods in Peshawar
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base leading-relaxed">
            Peshawar&apos;s real estate market varies by sector. Check out the top localities to buy property or lease residential houses.
          </p>
        </div>

        {/* Area Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {areas.map((area) => (
            <div
              key={area.name}
              className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300"
            >
              {/* Body */}
              <div className="p-5 flex flex-col flex-grow">
                {/* Live listing count badge */}
                <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-xl text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary border border-primary/20 w-fit">
                  <Building className="h-3 w-3" />
                  {area.count} {area.count === 1 ? "Property" : "Properties"}
                </div>

                <h3 className="text-lg font-bold group-hover:text-primary transition-colors mb-2">
                  {area.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-grow mb-4">
                  {area.description}
                </p>

                {/* Sub-area pills */}
                {area.subAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {area.subAreas.map((sub) => (
                      <span
                        key={sub}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent border border-border text-muted-foreground"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                )}

                {/* Link */}
                <Link
                  href={`/properties?location=${encodeURIComponent(area.name)}`}
                  className="flex items-center gap-1 text-xs font-bold text-primary mt-auto hover:underline group/link"
                >
                  Browse Location
                  <ChevronRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
