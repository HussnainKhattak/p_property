"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AvatarZoomProps {
  /** Image URL — if falsy, renders the fallback letter only (no zoom) */
  src?: string | null;
  alt: string;
  /** Thumbnail diameter in px */
  size: number;
  /** Enlarged diameter in px (default 180) */
  zoomedSize?: number;
  /** Single letter shown when no image */
  fallback?: string;
  /** Extra Tailwind classes applied to the thumbnail wrapper */
  className?: string;
}

/**
 * AvatarZoom — Instagram/TikTok-style profile picture zoom.
 *
 * Click/tap the thumbnail to expand it in place as a fixed overlay.
 * Click again, tap the backdrop, or press Escape to shrink it back.
 *
 * Uses getBoundingClientRect() + position:fixed so it escapes
 * overflow:hidden parent containers without any clipping.
 *
 * Hydration note: AnimatePresence children must NOT be wrapped in
 * a Fragment when using Framer Motion 12 + React 19 — each motion.*
 * element must have its key directly on it. We split the two overlays
 * into separate AnimatePresence instances to avoid the key-on-fragment
 * SSR mismatch.
 */
export default function AvatarZoom({
  src,
  alt,
  size,
  zoomedSize = 180,
  fallback = "?",
  className = "",
}: AvatarZoomProps) {
  const [zoomed, setZoomed] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const thumbRef = useRef<HTMLButtonElement>(null);

  const open = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!src) return;
    if (thumbRef.current) setRect(thumbRef.current.getBoundingClientRect());
    setZoomed(true);
  };

  const close = useCallback(() => setZoomed(false), []);

  // Close on Escape
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed, close]);

  // Recompute position on scroll/resize while open
  useEffect(() => {
    if (!zoomed) return;
    const update = () => {
      if (thumbRef.current) setRect(thumbRef.current.getBoundingClientRect());
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [zoomed]);

  const cx = rect ? rect.left + rect.width / 2 : 0;
  const cy = rect ? rect.top + rect.height / 2 : 0;
  const initialScale = size / zoomedSize;
  const isOpen = zoomed && !!src && !!rect;

  const thumbnailClass = [
    "rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center",
    "bg-accent font-bold select-none",
    src ? "cursor-zoom-in hover:ring-2 hover:ring-primary/40 transition-shadow duration-200" : "cursor-default",
    className,
  ].filter(Boolean).join(" ");

  return (
    <>
      {/* ── Thumbnail ── */}
      <button
        ref={thumbRef}
        type="button"
        onClick={open}
        aria-label={src ? `View ${alt} profile picture` : alt}
        className={thumbnailClass}
        style={{ width: size, height: size, fontSize: Math.max(8, size * 0.4) }}
        disabled={!src}
        tabIndex={src ? 0 : -1}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span className="leading-none text-foreground">{fallback}</span>
        )}
      </button>

      {/*
        ── Overlays ──
        IMPORTANT: Framer Motion 12 + React 19 requires that the element
        with the `key` prop is the direct child of AnimatePresence — NOT
        a Fragment. Split backdrop and zoomed image into two separate
        AnimatePresence instances to avoid SSR/hydration key mismatches.
      */}

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="avatar-backdrop"
            className="fixed inset-0 z-[998] bg-black/50"
            style={{ backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={close}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Zoomed circular image */}
      <AnimatePresence>
        {isOpen && (
          <motion.button
            key="avatar-zoomed"
            type="button"
            aria-label="Close profile picture"
            className="fixed z-[999] rounded-full overflow-hidden cursor-zoom-out focus:outline-none"
            style={{
              width: zoomedSize,
              height: zoomedSize,
              top: cy - zoomedSize / 2,
              left: cx - zoomedSize / 2,
              boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 0 0 3px rgba(255,255,255,0.15)",
            }}
            initial={{ scale: initialScale, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: initialScale, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 30,
              opacity: { duration: 0.15 },
            }}
            onClick={close}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src!}
              alt={alt}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
