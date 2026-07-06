"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

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

  // If initialSaved is updated by parent
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
    setIsToggling(true);

    try {
      const res = await fetch("/api/saved-properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
      }
    } catch (err) {
      console.error("Error saving listing:", err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
        saved 
          ? "bg-red-500 text-white hover:bg-red-600 scale-105 shadow-md shadow-red-500/20" 
          : "bg-black/40 text-white hover:text-red-500 hover:bg-black/60"
      }`}
      aria-label="Save Property"
    >
      <Heart className={`h-4.5 w-4.5 transition-transform duration-300 ${saved ? "fill-current scale-110" : ""}`} />
    </button>
  );
}
