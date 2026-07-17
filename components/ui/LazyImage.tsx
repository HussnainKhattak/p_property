"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon } from "lucide-react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  priority?: boolean;
}

/**
 * LazyImage - Animated image component with:
 * - Fade-in on load
 * - Blur placeholder during loading
 * - Error fallback
 * - Native lazy loading
 */
export default function LazyImage({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  priority = false,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Set loaded if the image was already cached and completed loading before React hydrated/mounted
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-muted ${wrapperClassName}`}>
      {/* Shimmer placeholder while loading */}
      <AnimatePresence>
        {!loaded && !errored && (
          <motion.div
            key="shimmer"
            className="absolute inset-0 bg-muted"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -skew-x-12"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error fallback */}
      {errored ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageIcon className="h-8 w-8 opacity-40" />
          <span className="text-xs opacity-60">Image unavailable</span>
        </div>
      ) : (
        <motion.img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`${className} transition-opacity duration-300`}
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setErrored(true);
            setLoaded(true);
          }}
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      )}
    </div>
  );
}
