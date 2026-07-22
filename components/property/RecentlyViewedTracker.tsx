"use client";

import { useEffect } from "react";

interface RecentlyViewedTrackerProps {
  propertyId: string;
}

export default function RecentlyViewedTracker({ propertyId }: RecentlyViewedTrackerProps) {
  useEffect(() => {
    // 1. Record local recent view history
    try {
      const storageKey = "recently_viewed_properties";
      const existing: string[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
      
      const updated = [propertyId, ...existing.filter((id) => id !== propertyId)].slice(0, 10);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to track recently viewed property in storage:", err);
    }

    // 2. Trigger anti-inflation backend view counter API
    try {
      fetch(`/api/properties/${propertyId}/view`, {
        method: "POST",
      }).catch((e) => console.error("Error triggering view API:", e));
    } catch (err) {
      console.error("View API call error:", err);
    }
  }, [propertyId]);

  return null; // Renderless side-effect tracker
}
