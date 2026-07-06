"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Landmark, Building, Map, Briefcase, ChevronRight } from "lucide-react";
import { slideUp, staggerContainer } from "@/lib/animations";

const categories = [
  {
    name: "Luxury Houses",
    value: "HOUSE",
    description: "Premium villas, duplex houses, and modern town homes.",
    count: 412,
    icon: Home,
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-500",
  },
  {
    name: "Modern Apartments",
    value: "APARTMENT",
    description: "High-rise executive suites and luxury flat systems.",
    count: 184,
    icon: Building,
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
  },
  {
    name: "Commercial Spaces",
    value: "COMMERCIAL",
    description: "Complete plazas, retail shop units, and department halls.",
    count: 73,
    icon: Landmark,
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
  },
  {
    name: "Residential Plots",
    value: "PLOT",
    description: "Developed plot files and premium construction land.",
    count: 326,
    icon: Map,
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
  },
  {
    name: "Corporate Offices",
    value: "OFFICE",
    description: "Furnished workspaces, call-centers, and boardrooms.",
    count: 51,
    icon: Briefcase,
    gradient: "from-rose-500/20 to-red-500/20",
    iconColor: "text-rose-500",
  },
];

export default function PropertyCategories() {
  return (
    <section className="py-20 bg-accent/20 border-t border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
          variants={slideUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
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
        </motion.div>

        {/* Category Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, boxShadow: "0 12px 36px rgba(0,0,0,0.12)" }}
              >
                <Link
                  href={`/properties?propertyType=${cat.value}`}
                  className="group flex flex-col bg-card border border-border rounded-2xl p-6 hover:border-primary transition-all duration-300 shadow-sm h-full"
                >
                  {/* Icon Box */}
                  <motion.div
                    className={`p-3.5 rounded-xl bg-gradient-to-br ${cat.gradient} ${cat.iconColor} w-fit mb-5`}
                    whileHover={{ scale: 1.12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>

                  {/* Info */}
                  <h3 className="font-bold text-base sm:text-lg mb-1 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-grow">
                    {cat.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mt-auto border-t border-border/60 pt-3">
                    <span>{cat.count} Listings</span>
                    <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
