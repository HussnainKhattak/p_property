"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import PropertyCard, { Property } from "../property/PropertyCard";
import { staggerContainer, cardItem, slideUp } from "@/lib/animations";

const featuredListings: Property[] = [
  {
    id: "feat-1",
    title: "1 Kanal Modern Design Luxury House",
    description: "Brand new architect-designed double unit house in Sector A, DHA Peshawar. Double kitchen, imported fittings, marble floors.",
    price: 65000000,
    address: "Sector A, Phase 1",
    city: "Peshawar",
    area: "DHA Peshawar",
    propertyType: "HOUSE",
    listingType: "SALE",
    bedrooms: 5,
    bathrooms: 6,
    marla: 20.0,
    status: "AVAILABLE",
    imageUrls: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"],
    videoUrl: null,
    owner: { name: "Afridi Estate", profileImage: null },
  },
  {
    id: "feat-2",
    title: "Penthouse Apartment in Hayatabad Heights",
    description: "Executive 3-bed penthouse with central cooling, hill views, standby generator, and custom woodwork.",
    price: 150000,
    address: "Phase 6, Ring Road",
    city: "Peshawar",
    area: "Hayatabad",
    propertyType: "APARTMENT",
    listingType: "RENT",
    bedrooms: 3,
    bathrooms: 3,
    marla: 12.0,
    status: "AVAILABLE",
    imageUrls: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"],
    videoUrl: null,
    owner: { name: "Khyber Realtors", profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80" },
  },
  {
    id: "feat-3",
    title: "10 Marla Corner Commercial Plaza",
    description: "Newly constructed commercial tower: B+G+3 floors. Heart of Regi Model Town commercial market.",
    price: 98000000,
    address: "Main Boulevard, Zone C",
    city: "Peshawar",
    area: "Regi Model Town",
    propertyType: "COMMERCIAL",
    listingType: "SALE",
    bedrooms: 0,
    bathrooms: 4,
    marla: 10.0,
    status: "AVAILABLE",
    imageUrls: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"],
    videoUrl: null,
    owner: { name: "Peshawar Properties", profileImage: null },
  },
];

export default function FeaturedProperties() {
  return (
    <section className="py-20 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
          variants={slideUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="flex flex-col items-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              Handpicked Deals
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Featured Properties
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
              Our curated selection of premium real estate offerings with certified legal documentations and outstanding investment potential.
            </p>
          </div>
          <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
            <Link
              href="/properties?featured=true"
              className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline group self-start md:self-end"
            >
              Explore Featured Listings
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Cards Grid with stagger */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {featuredListings.map((property, i) => (
            <motion.div key={property.id} variants={cardItem}>
              <PropertyCard property={property} index={i} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
