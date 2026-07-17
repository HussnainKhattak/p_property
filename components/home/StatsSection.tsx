import { db } from "@/lib/db";
import { Building2, Users, MapPin, Eye } from "lucide-react";

async function getStats() {
  try {
    const [totalProperties, totalUsers, totalViews, citiesRaw] = await Promise.all([
      db.property.count({ where: { isApproved: true } }),
      db.user.count(),
      db.property.aggregate({ _sum: { views: true } }),
      db.property.findMany({
        where: { isApproved: true },
        select: { city: true },
        distinct: ["city"],
      }),
    ]);

    return {
      totalProperties,
      totalUsers,
      totalViews: totalViews._sum.views ?? 0,
      totalCities: citiesRaw.length,
    };
  } catch {
    return { totalProperties: 0, totalUsers: 0, totalViews: 0, totalCities: 0 };
  }
}

function formatNumber(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
  return n.toString();
}

export default async function StatsSection() {
  const stats = await getStats();

  const items = [
    {
      icon: Building2,
      label: "Total Listings",
      value: formatNumber(stats.totalProperties),
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Users,
      label: "Registered Users",
      value: formatNumber(stats.totalUsers),
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: MapPin,
      label: "Cities Covered",
      value: formatNumber(stats.totalCities),
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      icon: Eye,
      label: "Total Views",
      value: formatNumber(stats.totalViews),
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <section className="py-16 bg-accent/20 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight sm:text-3xl">
            Peshawar Property Hub in Numbers
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            Trusted numbers from Peshawar's leading property marketplace
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div className={`text-3xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-muted-foreground font-medium text-center">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
