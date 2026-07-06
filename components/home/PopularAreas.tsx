"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, Building } from "lucide-react";
import LazyImage from "@/components/ui/LazyImage";
import { slideUp, staggerContainer, cardItem } from "@/lib/animations";

const areas = [
  {
    name: "DHA Peshawar",
    description: "Peshawar's premium gated community with top security, state-of-the-art facilities, and unmatched investment potential.",
    listingsCount: 142,
    subAreas: ["Sector A", "Sector B", "Sector C", "Sector D"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  },
  {
    name: "Hayatabad",
    description: "The crown jewel of Peshawar. Green belts, parks, top schools, commercial sectors, and phase-wise planning.",
    listingsCount: 289,
    subAreas: ["Phase 1 - 7", "Phase 3", "Phase 6", "Phase 5"],
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  },
  {
    name: "Regi Model Town",
    description: "One of the oldest planned schemes offering modern layout at relatively affordable prices. Rapid construction ongoing.",
    listingsCount: 95,
    subAreas: ["Zone 1", "Zone 3", "Zone 4", "Zone 5"],
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
  },
  {
    name: "Warsak Road",
    description: "Host to several peaceful residential societies like Askari and Prime Town. Excellent connectivity to core city.",
    listingsCount: 78,
    subAreas: ["Askari 6", "Prime City", "Warsak Executive", "Yaseen Town"],
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
  },
];

export default function PopularAreas() {
  return (
    <section className="py-20 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          variants={slideUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 mb-3">
            <MapPin className="h-3.5 w-3.5" /> Neighborhood Finder
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Popular Neighborhoods in Peshawar
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base leading-relaxed">
            Peshawar&apos;s real estate market varies by sector. Check out the top localities to buy property or lease residential houses.
          </p>
        </motion.div>

        {/* Area Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {areas.map((area, i) => (
            <motion.div
              key={area.name}
              variants={cardItem}
              whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}
              transition={{ duration: 0.22 }}
              className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-md"
            >
              {/* Area Image */}
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <LazyImage
                  src={area.image}
                  alt={area.name}
                  className="h-full w-full object-cover"
                  wrapperClassName="h-full w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent pointer-events-none" />

                {/* Listing count badge */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-xl text-[10px] uppercase font-bold tracking-wider flex items-center gap-1"
                >
                  <Building className="h-3 w-3 text-primary" />
                  {area.listingsCount} Properties
                </motion.div>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors mb-2">
                  {area.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-grow mb-4">
                  {area.description}
                </p>

                {/* Sub-area pills */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {area.subAreas.map((sub) => (
                    <motion.span
                      key={sub}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent border border-border text-muted-foreground"
                      whileHover={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#10b981" }}
                      transition={{ duration: 0.15 }}
                    >
                      {sub}
                    </motion.span>
                  ))}
                </div>

                {/* Link */}
                <Link
                  href={`/properties?location=${encodeURIComponent(area.name)}`}
                  className="flex items-center gap-1 text-xs font-bold text-primary mt-auto hover:underline group/link"
                >
                  Browse Location
                  <ChevronRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
