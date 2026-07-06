"use client";

import { motion } from "framer-motion";

// ─── Property Card Skeleton ────────────────────────────────────────
export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-md animate-pulse">
      {/* Image placeholder */}
      <div className="h-56 w-full bg-muted" />
      <div className="p-5 flex flex-col gap-4">
        {/* Price */}
        <div className="h-5 w-28 rounded-full bg-muted" />
        {/* Title */}
        <div className="h-4 w-4/5 rounded-full bg-muted" />
        {/* Location */}
        <div className="h-3.5 w-3/5 rounded-full bg-muted" />
        {/* Specs row */}
        <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-border/60">
          <div className="h-3 rounded-full bg-muted" />
          <div className="h-3 rounded-full bg-muted" />
          <div className="h-3 rounded-full bg-muted" />
        </div>
        {/* Footer row */}
        <div className="flex justify-between items-center">
          <div className="h-7 w-7 rounded-full bg-muted" />
          <div className="h-8 w-24 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

// ─── Grid of Property Card Skeletons ──────────────────────────────
export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Text Line Skeleton ────────────────────────────────────────────
export function TextSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-muted ${className}`} />;
}

// ─── Stat Card Skeleton ────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 animate-pulse flex flex-col gap-3">
      <div className="h-4 w-24 rounded-full bg-muted" />
      <div className="h-8 w-16 rounded-full bg-muted" />
      <div className="h-3 w-32 rounded-full bg-muted" />
    </div>
  );
}

// ─── Profile Skeleton ─────────────────────────────────────────────
export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4 animate-pulse">
      <div className="h-14 w-14 rounded-full bg-muted" />
      <div className="flex flex-col gap-2">
        <div className="h-4 w-32 rounded-full bg-muted" />
        <div className="h-3 w-24 rounded-full bg-muted" />
      </div>
    </div>
  );
}

// ─── Shimmer Pulse Skeleton ───────────────────────────────────────
// A generic shimmer block you can size with className
export function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-muted ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// ─── Page Loader (full-page spinner) ─────────────────────────────
export function PageLoader() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}
