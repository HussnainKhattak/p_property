"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PhoneCall, Building2, ChevronRight } from "lucide-react";
import { slideLeft, slideRight, hoverScale, tapScale } from "@/lib/animations";

export default function ContactCTA() {
  return (
    <section className="py-20 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent via-card to-accent border border-border p-8 sm:p-12 md:p-16 shadow-lg"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ borderColor: "rgba(16,185,129,0.3)" }}
        >
          {/* Decorative Grid Overlay */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Animated orb */}
          <motion.div
            className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Text */}
            <motion.div
              className="lg:col-span-8 flex flex-col items-start text-left gap-4"
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                💬 Need Consultation?
              </span>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl leading-tight">
                Ready to Find Your Next Space or Sell an Estate?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                Connect with Peshawar Property Hub advisors today. Whether you need an estimate on a plot in Regi Model Town or want to schedule a visit in DHA Peshawar, we are here to assist.
              </p>
            </motion.div>

            {/* Buttons */}
            <motion.div
              className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto lg:w-full lg:items-stretch"
              variants={slideRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div whileHover={hoverScale} whileTap={tapScale}>
                <Link
                  href="/properties/add"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-300 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/25 text-center"
                >
                  <Building2 className="h-4 w-4" />
                  <span>List Your Property</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <motion.div whileHover={hoverScale} whileTap={tapScale}>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold border border-border bg-card hover:bg-accent text-foreground transition-all duration-300 text-center"
                >
                  <PhoneCall className="h-4 w-4 text-primary" />
                  <span>Talk to an Expert</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
