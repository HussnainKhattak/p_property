"use client";

import { useEffect } from "react";

interface RecentlyViewedTrackerProps {
  propertyId: string;
}

export default function RecentlyViewedTracker({ propertyId }: RecentlyViewedTrackerProps) {
  useEffect(() => {
    try {
      const storageKey = "recently_viewed_properties";
      const existing: string[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
      
      // Remove duplicate if it already exists to move it to the front
      const updated = [propertyId, ...existing.filter((id) => id !== propertyId)].slice(0, 10);
      
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to track recently viewed property:", err);
    }
  }, [propertyId]);

  return null; // Side-effect only component
}
