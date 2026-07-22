import Link from "next/link";
import { ChevronRight, Home, Building2, Store, Map } from "lucide-react";
import { db } from "@/lib/db";

const ICON_MAP: Record<string, any> = {
  APARTMENT: Building2,
  HOUSE: Home,
  SHOP: Store,
  PLOT: Map,
};

const COLOR_MAP: Record<string, { gradient: string; text: string }> = {
  APARTMENT: { gradient: "from-blue-500/20 to-indigo-500/20", text: "text-blue-500" },
  HOUSE: { gradient: "from-emerald-500/20 to-teal-500/20", text: "text-emerald-500" },
  SHOP: { gradient: "from-amber-500/20 to-orange-500/20", text: "text-amber-500" },
  PLOT: { gradient: "from-purple-500/20 to-pink-500/20", text: "text-purple-500" },
};

const STATIC_FALLBACK = [
  {
    name: "APARTMENT",
    title: "Find Your Perfect Apartment",
    description: "High-rise executive suites, modern flat systems, and student studio apartments.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
  },
  {
    name: "HOUSE",
    title: "Discover Your Dream Home",
    description: "Premium double-unit villas, single family homes, and heritage bungalows.",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
  },
  {
    name: "SHOP",
    title: "Grow Your Business",
    description: "Retail markets, department showrooms, plazas, and commercial business spots.",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80",
  },
  {
    name: "PLOT",
    title: "Invest In Land Opportunities",
    description: "Developed housing plots, utility files, and construction land blocks.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
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

async function getCategoryData() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });
    if (categories.length > 0) return categories;
  } catch (err) {
    console.error("Failed to load categories from database:", err);
  }
  return STATIC_FALLBACK;
}

export default async function PropertyCategories() {
  const [counts, dbCategories] = await Promise.all([
    getCategoryCounts(),
    getCategoryData(),
  ]);

  // Ensure categories are displayed in consistent order: APARTMENT, HOUSE, SHOP, PLOT
  const order = ["APARTMENT", "HOUSE", "SHOP", "PLOT"];
  const sortedCategories = [...dbCategories].sort(
    (a, b) => order.indexOf(a.name) - order.indexOf(b.name)
  );

  const categories = sortedCategories.map((cat) => ({
    ...cat,
    count: counts[cat.name] ?? 0,
    icon: ICON_MAP[cat.name] || Home,
    gradient: COLOR_MAP[cat.name]?.gradient || "from-zinc-500/20 to-zinc-600/20",
    iconColor: COLOR_MAP[cat.name]?.text || "text-zinc-500",
  }));

  return (
    <section className="py-24 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-3">
            📁 Directories
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Explore Property Categories
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base leading-relaxed">
            Find residential and commercial property listings in Peshawar managed directly by real sellers.
          </p>
        </div>

        {/* 4 Large Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            // Human readable name formatting (e.g. APARTMENT -> Apartment)
            const displayName = cat.name.charAt(0) + cat.name.slice(1).toLowerCase() + (cat.name === "SHOP" || cat.name === "PLOT" ? "s" : "s");

            return (
              <Link
                key={cat.name}
                href={`/properties?propertyType=${cat.name}`}
                className="group relative flex flex-col h-[280px] sm:h-[320px] rounded-3xl overflow-hidden border border-border shadow-md hover:shadow-2xl transition-all duration-500 bg-card text-left"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url('${cat.image}')` }}
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />

                {/* Inner Content (absolute on bottom) */}
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col gap-2 z-10 text-white">
                  
                  {/* Category Title and Badge */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-primary-foreground bg-primary px-2.5 py-0.5 rounded-lg">
                        {displayName}
                      </span>
                    </div>

                    <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                      {cat.count} {cat.count === 1 ? "Listing" : "Listings"}
                    </span>
                  </div>

                  {/* Main Callout Title */}
                  <h3 className="font-black text-xl sm:text-2xl mt-1 tracking-tight text-white group-hover:text-primary transition-colors">
                    {cat.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-md">
                    {cat.description}
                  </p>

                  {/* Browse Link CTA */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary mt-2 group-hover:underline">
                    Browse Category
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
