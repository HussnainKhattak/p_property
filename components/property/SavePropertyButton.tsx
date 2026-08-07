"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface SavePropertyButtonProps {
  propertyId: string;
  initialSaved?: boolean;
}

export default function SavePropertyButton({
  propertyId,
  initialSaved = false,
}: SavePropertyButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [isToggling, setIsToggling] = useState(false);
  // Controls the pop-scale burst animation key — increment to re-trigger
  const [animKey, setAnimKey] = useState(0);

  // Sync if parent passes updated initialSaved
  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    if (isToggling) return;

    // Optimistic update + trigger animation immediately for snappy feel
    const next = !saved;
    setSaved(next);
    setAnimKey((k) => k + 1);
    setIsToggling(true);

    try {
      const res = await fetch("/api/saved-properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      if (res.ok) {
        const data = await res.json();
        // Reconcile with server truth in case of race
        setSaved(data.saved);
      } else {
        // Revert on error
        setSaved(!next);
      }
    } catch (err) {
      console.error("Error saving listing:", err);
      setSaved(!next); // revert
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      aria-label={saved ? "Remove from saved" : "Save property"}
      whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`
        relative p-2 rounded-full backdrop-blur-sm border transition-colors duration-200
        ${saved
          ? "bg-red-500/90 border-red-400/60 shadow-lg shadow-red-500/30 hover:bg-red-600/90"
          : "bg-black/40 border-white/10 hover:bg-black/60"
        }
      `}
    >
      {/* Pop-burst ring that fires on each toggle */}
      <AnimatePresence>
        {saved && (
          <motion.span
            key={animKey}
            className="absolute inset-0 rounded-full bg-red-400/40 pointer-events-none"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Heart icon — filled red when saved, outline white when not */}
      <motion.div
        key={`heart-${saved}`}
        initial={{ scale: 0.6, rotate: saved ? -15 : 0 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
      >
        <Heart
          className={`h-[18px] w-[18px] transition-colors duration-150 ${
            saved ? "text-white" : "text-white/90"
          }`}
          fill={saved ? "currentColor" : "none"}
          strokeWidth={saved ? 0 : 2}
        />
      </motion.div>
    </motion.button>
  );
}
