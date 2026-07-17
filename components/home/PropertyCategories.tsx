import Link from "next/link";
import { Home, Landmark, Building, Map, Briefcase, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";

const CATEGORY_META = [
  {
    name: "Luxury Houses",
    value: "HOUSE",
    description: "Premium villas, duplex houses, and modern town homes.",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-500",
    Icon: Home,
  },
  {
    name: "Modern Apartments",
    value: "APARTMENT",
    description: "High-rise executive suites and luxury flat systems.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
    Icon: Building,
  },
  {
    name: "Commercial Spaces",
    value: "COMMERCIAL",
    description: "Complete plazas, retail shop units, and department halls.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
    Icon: Landmark,
  },
  {
    name: "Residential Plots",
    value: "PLOT",
    description: "Developed plot files and premium construction land.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
    Icon: Map,
  },
  {
    name: "Corporate Offices",
    value: "OFFICE",
    description: "Furnished workspaces, call-centers, and boardrooms.",
    gradient: "from-rose-500/20 to-red-500/20",
    iconColor: "text-rose-500",
    Icon: Briefcase,
  },
];

async function getCategoryCounts(): Promise<Record<string, number>> {
  try {
    const grouped = await db.property.groupBy({
      by: ["propertyType"],
      where: { isApproved: true },
      _count: { id: true },
    });
    return Object.fromEntries(grouped.map((g) => [g.propertyType, g._count.id]));
  } catch {
    return {};
  }
}

export default async function PropertyCategories() {
  const counts = await getCategoryCounts();

  // Only show categories that have at least 1 listing, or show all with 0 count
  const categories = CATEGORY_META.map((cat) => ({
    ...cat,
    count: counts[cat.value] ?? 0,
  }));

  return (
    <section className="py-20 bg-accent/20 border-t border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="flex flex-col items-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              📁 Type Directory
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Browse by Property Category
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
              Quickly filter down properties in Peshawar based on specific layouts and structures.
            </p>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((cat) => {
            const Icon = cat.Icon;
            return (
              <Link
                key={cat.value}
                href={`/properties?propertyType=${cat.value}`}
                className="group flex flex-col bg-card border border-border rounded-2xl p-6 hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-sm h-full"
              >
                {/* Icon Box */}
                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${cat.gradient} ${cat.iconColor} w-fit mb-5 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-6 w-6" />
                </div>

                {/* Info */}
                <h3 className="font-bold text-base sm:text-lg mb-1 group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-grow">
                  {cat.description}
                </p>

                {/* Footer — real count from DB */}
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mt-auto border-t border-border/60 pt-3">
                  <span>
                    {cat.count === 0 ? "No listings yet" : `${cat.count} ${cat.count === 1 ? "Listing" : "Listings"}`}
                  </span>
                  <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
