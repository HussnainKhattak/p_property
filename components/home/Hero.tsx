"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Home, DollarSign, ArrowRight } from "lucide-react";
import { slideLeft, slideRight, staggerContainer, cardItem, hoverScale, tapScale } from "@/lib/animations";

const locations = [
  "DHA Peshawar",
  "Hayatabad",
  "Regi Model Town",
  "Warsak Road",
  "University Town",
];

const propertyTypes = [
  { label: "House", value: "HOUSE" },
  { label: "Apartment", value: "APARTMENT" },
  { label: "Plot", value: "PLOT" },
  { label: "Commercial", value: "COMMERCIAL" },
  { label: "Office", value: "OFFICE" },
];



export default function Hero() {
  const [listingType, setListingType] = useState<"SALE" | "RENT">("SALE");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center py-20 overflow-hidden bg-zinc-950 text-white">
      {/* Background Image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80')`,
        }}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 via-neutral-950/75 to-neutral-950/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/20" />

      {/* Dot-grid pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Floating decorative orbs */}
      <motion.div
        className="absolute top-20 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 left-1/3 w-56 h-56 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* ── Left: Text Content ── */}
          <motion.div
            className="lg:col-span-7 flex flex-col items-start text-left gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.span
              variants={slideLeft}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30"
            >
              ⚡ Leading Property Marketplace in KP
            </motion.span>

            {/* Headline */}
            <motion.h1
              variants={slideLeft}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-white"
            >
              Discover Luxury <br />
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                Living Spaces
              </span>{" "}
              <br />
              in Peshawar
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={slideLeft}
              className="text-base sm:text-lg text-zinc-300 max-w-xl leading-relaxed"
            >
              Find, buy, and rent premier residential estates, commercial units, and investment land files in DHA Peshawar, Hayatabad, and other high-yield societies.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={slideLeft} className="flex flex-wrap gap-4 mt-2">
              <motion.div whileHover={hoverScale} whileTap={tapScale}>
                <Link
                  href="/properties"
                  className="px-6 py-3.5 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-300 flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30"
                >
                  <span>Browse Listings</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={hoverScale} whileTap={tapScale}>
                <Link
                  href="/properties/add"
                  className="px-6 py-3.5 rounded-xl font-bold bg-white/10 hover:bg-white/15 border border-white/20 transition-all duration-300 flex items-center gap-1 text-white"
                >
                  List Your Property
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={slideLeft} className="flex flex-wrap gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-zinc-300">
                🏠 Real Listings Only
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-zinc-300">
                📍 Peshawar & KP
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-zinc-300">
                ✅ Verified Uploads
              </span>
            </motion.div>
          </motion.div>

          {/* ── Right: Search Card ── */}
          <motion.div
            className="lg:col-span-5 w-full"
            variants={slideRight}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="w-full bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60"
              whileHover={{ borderColor: "rgba(16,185,129,0.25)", boxShadow: "0 25px 60px rgba(0,0,0,0.7)" }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-extrabold mb-5 text-white tracking-tight">
                Search Properties
              </h2>

              {/* Tab Selector */}
              <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-6">
                {(["SALE", "RENT"] as const).map((type) => (
                  <motion.button
                    key={type}
                    onClick={() => setListingType(type)}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${
                      listingType === type
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    whileTap={{ scale: 0.96 }}
                  >
                    {type === "SALE" ? "Buy" : "Rent"}
                  </motion.button>
                ))}
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Location / Area
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:bg-zinc-900 transition-colors"
                  >
                    <option value="" className="bg-zinc-900 text-white">All Locations</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc} className="bg-zinc-900 text-white">{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Property Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                    <Home className="h-3.5 w-3.5 text-primary" /> Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:bg-zinc-900 transition-colors"
                  >
                    <option value="" className="bg-zinc-900 text-white">All Types</option>
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value} className="bg-zinc-900 text-white">{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-primary" /> Budget Range
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:bg-zinc-900 transition-colors"
                  >
                    <option value="" className="bg-zinc-900 text-white">Any Budget</option>
                    <option value="low" className="bg-zinc-900 text-white">Under 1 Crore</option>
                    <option value="medium" className="bg-zinc-900 text-white">1 - 5 Crore</option>
                    <option value="high" className="bg-zinc-900 text-white">5 Crore +</option>
                  </select>
                </div>

                {/* Search Button */}
                <motion.div whileHover={hoverScale} whileTap={tapScale}>
                  <Link
                    href={`/properties?type=${listingType}&location=${encodeURIComponent(location)}&propertyType=${propertyType}&price=${priceRange}`}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 mt-2"
                  >
                    <Search className="h-4 w-4" />
                    <span>Search Properties</span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
