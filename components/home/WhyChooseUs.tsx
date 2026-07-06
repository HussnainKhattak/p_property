"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Calendar, Image as ImageIcon, Users2 } from "lucide-react";
import { slideLeft, slideRight, staggerContainer, cardItem } from "@/lib/animations";

const features = [
  {
    title: "100% Legal Document Audit",
    description: "We verify land deeds, registry files, and society allocation letters before making any listing public, ensuring peace of mind.",
    icon: ShieldCheck,
  },
  {
    title: "Direct Schedule Site Visits",
    description: "Select date and time preferences directly from the listing interface to tour properties physically with local agency representation.",
    icon: Calendar,
  },
  {
    title: "High-Quality Media Uploads",
    description: "Explore layouts through high-resolution property photography and direct video walkthrough uploads powered securely by Cloudinary.",
    icon: ImageIcon,
  },
  {
    title: "Top Certified Local Agents",
    description: "Connect instantly with DHA and Hayatabad certified estate agents with deep local knowledge of market pricing trends.",
    icon: Users2,
  },
];

const stats = [
  { value: "10k+", label: "Satisfied Customers" },
  { value: "1.5k+", label: "Active Listings" },
  { value: "150+", label: "Verified Agents" },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-accent/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left: Text & Stats */}
          <motion.div
            className="lg:col-span-5 flex flex-col gap-6 text-left"
            variants={slideLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 w-fit">
              🛡️ Premium Standard
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Setting the Benchmark in Peshawar Real Estate
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We bridge the gap in traditional estate transactions by introducing digital validation, scheduled site visit tracking, and rich multimedia walkthroughs for properties.
            </p>

            {/* Animated counters */}
            <motion.div
              className="flex gap-6 mt-2 border-t border-border pt-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={cardItem}
                  className={i > 0 ? "border-l border-border pl-6" : ""}
                >
                  <motion.p
                    className="text-3xl font-extrabold text-primary"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5, type: "spring", stiffness: 150 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-wider">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Feature Cards */}
          <motion.div
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  variants={cardItem}
                  whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col bg-card border border-border rounded-2xl p-6 shadow-sm cursor-default"
                >
                  <motion.div
                    className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(16,185,129,0.2)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
