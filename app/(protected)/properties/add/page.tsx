"use client";

import { useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Home,
  Store,
  LayoutGrid,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  DollarSign,
  Loader2,
  Image as ImageIcon,
  Trash2,
  PlusCircle,
  Upload,
  Film,
  ArrowLeft,
  CheckCircle2,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadDirectToCloudinary } from "@/lib/cloudinary-client";

// ─── Types ────────────────────────────────────────────────────────────────────
type PropertyType = "APARTMENT" | "HOUSE" | "SHOP" | "PLOT";

interface TypeCard {
  type: PropertyType;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  accent: string;
  borderAccent: string;
  badge: string;
}

// ─── Property type cards config ────────────────────────────────────────────────
const TYPE_CARDS: TypeCard[] = [
  {
    type: "APARTMENT",
    label: "Apartment",
    subtitle: "List apartments for rent or sale.",
    icon: <Building2 className="h-8 w-8" />,
    gradient: "from-violet-500/20 via-violet-400/10 to-transparent",
    accent: "text-violet-500",
    borderAccent: "border-violet-500/40 hover:border-violet-500",
    badge: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  },
  {
    type: "HOUSE",
    label: "House",
    subtitle: "List homes and villas.",
    icon: <Home className="h-8 w-8" />,
    gradient: "from-emerald-500/20 via-emerald-400/10 to-transparent",
    accent: "text-emerald-500",
    borderAccent: "border-emerald-500/40 hover:border-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  {
    type: "SHOP",
    label: "Shop",
    subtitle: "List commercial shops and stores.",
    icon: <Store className="h-8 w-8" />,
    gradient: "from-amber-500/20 via-amber-400/10 to-transparent",
    accent: "text-amber-500",
    borderAccent: "border-amber-500/40 hover:border-amber-500",
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  {
    type: "PLOT",
    label: "Plot",
    subtitle: "List residential and commercial plots.",
    icon: <LayoutGrid className="h-8 w-8" />,
    gradient: "from-sky-500/20 via-sky-400/10 to-transparent",
    accent: "text-sky-500",
    borderAccent: "border-sky-500/40 hover:border-sky-500",
    badge: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  },
];

const LOCATIONS = [
  "DHA Peshawar",
  "Hayatabad",
  "Regi Model Town",
  "Warsak Road",
  "University Town",
  "Dalazak Road",
  "Ring Road",
  "Charsadda Road",
  "Peshawar Cantt",
  "Saddar Bazar",
  "Gulberg",
  "G.T. Road",
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AddPropertyPage() {
  const router = useRouter();

  // Step 1: select type, Step 2: fill form
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    marla: "",
    city: "Peshawar",
    area: "",
    address: "",
    apartmentName: "",
    subcategory: "SALE",
    listingType: "SALE",
    bedrooms: "1",
    bathrooms: "1",
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Loading states
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActiveImg, setDragActiveImg] = useState(false);
  const [dragActiveVid, setDragActiveVid] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const showError = (msg: string) => {
    setError(msg);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  };

  // ─── Image Upload ─────────────────────────────────────────────────────────────
  const processImages = async (files: File[]) => {
    setUploadingImages(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          showError("Only image files are allowed");
          continue;
        }
        const url = await uploadDirectToCloudinary(file);
        urls.push(url);
      }
      setImageUrls((prev) => [...prev, ...urls]);
    } catch (err: any) {
      showError(err.message || "Failed to upload one or more images");
    } finally {
      setUploadingImages(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processImages(Array.from(files));
  };

  const removeImage = (idx: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  // ─── Video Upload ─────────────────────────────────────────────────────────────
  const processVideo = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      showError("Only video files are allowed");
      return;
    }
    setUploadingVideo(true);
    setError("");
    try {
      const url = await uploadDirectToCloudinary(file);
      setVideoUrl(url);
    } catch (err: any) {
      showError(err.message || "Failed to upload video");
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processVideo(files[0]);
  };

  // ─── Drag & Drop ──────────────────────────────────────────────────────────────
  const handleDrag = (e: DragEvent, type: "image" | "video") => {
    e.preventDefault();
    e.stopPropagation();
    const active = e.type === "dragenter" || e.type === "dragover";
    if (type === "image") setDragActiveImg(active);
    else setDragActiveVid(active);
  };

  const handleDrop = async (e: DragEvent, type: "image" | "video") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "image") {
      setDragActiveImg(false);
      if (e.dataTransfer.files?.length) await processImages(Array.from(e.dataTransfer.files));
    } else {
      setDragActiveVid(false);
      if (e.dataTransfer.files?.length) await processVideo(e.dataTransfer.files[0]);
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    // Validation
    if (imageUrls.length === 0) {
      showError("At least one property image is required.");
      setIsSubmitting(false);
      return;
    }
    if (parseFloat(form.price) <= 0) {
      showError("Price must be a positive number.");
      setIsSubmitting(false);
      return;
    }
    if (parseFloat(form.marla) <= 0) {
      showError("Area size must be a positive number.");
      setIsSubmitting(false);
      return;
    }
    if (selectedType === "APARTMENT" && !form.apartmentName.trim()) {
      showError("Apartment name is required.");
      setIsSubmitting(false);
      return;
    }
    if (["APARTMENT", "HOUSE"].includes(selectedType)) {
      if (parseInt(form.bedrooms) < 1) {
        showError("Number of bedrooms is required.");
        setIsSubmitting(false);
        return;
      }
      if (parseInt(form.bathrooms) < 1) {
        showError("Number of bathrooms is required.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // For plots: listingType is always SALE; subcategory is RESIDENTIAL or COMMERCIAL
      // For house/apartment/shop: subcategory field holds SALE/RENT which becomes listingType
      const finalListingType =
        selectedType === "PLOT"
          ? "SALE"
          : form.subcategory === "RENT"
          ? "RENT"
          : "SALE";

      // subcategory stored in DB:
      // Plots   → "RESIDENTIAL" or "COMMERCIAL"
      // Others  → "SALE" or "RENT" (mirrors listingType for filtering/display)
      const finalSubcategory = form.subcategory || selectedType;

      const payload: Record<string, unknown> = {
        title:        form.title,
        description:  form.description,
        price:        parseFloat(form.price),
        marla:        parseFloat(form.marla),
        city:         form.city,
        area:         form.area,
        address:      form.address,
        propertyType: selectedType,
        subcategory:  finalSubcategory,
        listingType:  finalListingType,
        bedrooms:     ["APARTMENT", "HOUSE"].includes(selectedType) ? parseInt(form.bedrooms) || 1 : 0,
        bathrooms:    ["APARTMENT", "HOUSE"].includes(selectedType) ? parseInt(form.bathrooms) || 1 : 0,
        imageUrls,
        videoUrl:     videoUrl || null,
      };

      // Only include apartmentName for APARTMENT type
      if (selectedType === "APARTMENT" && form.apartmentName.trim()) {
        payload.apartmentName = form.apartmentName.trim();
      }

      console.log("[AddProperty] Submitting payload:", payload);

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("[AddProperty] Server response:", res.status, data);

      if (!res.ok) {
        // Show the actual error from the server (validation issue, DB error, etc.)
        showError(data.error || `Server error (${res.status}). Please try again.`);
        return;
      }

      setSuccess("Listing published successfully! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error("[AddProperty] Network/unexpected error:", err);
      showError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCard = TYPE_CARDS.find((c) => c.type === selectedType);
  const needsBedBath = selectedType === "APARTMENT" || selectedType === "HOUSE";
  const needsApartmentName = selectedType === "APARTMENT";
  const isPlot = selectedType === "PLOT";

  // ─── Step 1: Type Selection ────────────────────────────────────────────────────
  if (!selectedType) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 mb-4">
              <PlusCircle className="h-3.5 w-3.5" /> New Listing
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
              What are you listing?
            </h1>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Select the property category that best describes your listing. You'll then fill in
              the specific details.
            </p>
          </motion.div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TYPE_CARDS.map((card, i) => (
              <motion.button
                key={card.type}
                onClick={() => {
                  setSelectedType(card.type);
                  // Set sensible subcategory defaults by type
                  setForm((p) => ({
                    ...p,
                    subcategory: card.type === "PLOT" ? "RESIDENTIAL" : "SALE",
                  }));
                }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.09, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className={`relative group flex flex-col items-start text-left gap-5 p-7 rounded-2xl border-2 bg-card shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer ${card.borderAccent}`}
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                {/* Decorative circle */}
                <div
                  className={`absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none ${card.accent.replace("text-", "bg-")}`}
                />

                <div className="relative z-10 flex items-start justify-between w-full">
                  {/* Icon box */}
                  <div
                    className={`p-3.5 rounded-xl border ${card.badge} ${card.accent} transition-transform duration-200 group-hover:scale-110`}
                  >
                    {card.icon}
                  </div>

                  {/* Arrow */}
                  <span className={`text-2xl font-black opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 ${card.accent}`}>
                    →
                  </span>
                </div>

                <div className="relative z-10">
                  <h2 className="text-xl font-black text-foreground mb-1">{card.label}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.subtitle}</p>
                </div>

                {/* Bottom badge */}
                <span className={`relative z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${card.badge}`}>
                  {card.icon && <span className="h-3 w-3">{card.icon}</span>}
                  List {card.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Info note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-start gap-3 p-4 rounded-xl bg-muted/60 border border-border text-sm text-muted-foreground"
          >
            <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span>
              All listings are reviewed before going live. Make sure your listing follows our
              community guidelines. Images are required for all property types.
            </span>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Step 2: Property Form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Back + Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 mb-10"
        >
          <button
            onClick={() => {
              setSelectedType(null);
              setError("");
              setSuccess("");
              setImageUrls([]);
              setVideoUrl(null);
            }}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" /> Back to property type selection
          </button>

          <div className="flex items-center gap-3">
            {selectedCard && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${selectedCard.badge}`}>
                {selectedCard.icon && <span className="h-3.5 w-3.5">{selectedCard.icon}</span>}
                {selectedCard.label}
              </span>
            )}
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                List a {selectedCard?.label}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Fill in the details below to publish your listing on Peshawar Property Hub.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Status Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 font-medium text-center mb-8"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-500 font-medium text-center mb-8 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* ── Section 1: Basic Information ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
          >
            <h3 className="font-bold text-lg text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                <label htmlFor="title" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Listing Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={form.title}
                  onChange={handleChange}
                  placeholder={
                    selectedType === "APARTMENT"
                      ? "e.g. 2-Bed Luxury Apartment for Rent in Hayatabad"
                      : selectedType === "HOUSE"
                      ? "e.g. 1 Kanal House for Sale in DHA Phase 4"
                      : selectedType === "SHOP"
                      ? "e.g. Ground Floor Shop for Sale in Saddar Bazar"
                      : "e.g. 5 Marla Residential Plot in Ring Road"
                  }
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>

              {/* Description */}
              <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                <label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe key features, nearby landmarks, amenities, condition..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Price */}
              <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                <label htmlFor="price" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Price (PKR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="price"
                    name="price"
                    type="number"
                    required
                    min="1"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 65000000"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Apartment Name (APARTMENT only) */}
              {needsApartmentName && (
                <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="apartmentName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Apartment Name / Building <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="apartmentName"
                    name="apartmentName"
                    type="text"
                    required={needsApartmentName}
                    value={form.apartmentName}
                    onChange={handleChange}
                    placeholder="e.g. Gulshan Tower, Block B"
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Section 2: Location ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
          >
            <h3 className="font-bold text-lg text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Location Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="city" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  readOnly
                  value={form.city}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>

              {/* Area */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="area" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Area / Sector <span className="text-red-500">*</span>
                </label>
                <input
                  id="area"
                  name="area"
                  type="text"
                  list="area-suggestions"
                  required
                  minLength={3}
                  value={form.area}
                  onChange={handleChange}
                  placeholder={
                    selectedType === "SHOP"
                      ? "e.g. Saddar Bazar, Old Bara Road, Deans Plaza..."
                      : "e.g. Phase 3 Hayatabad, DHA Phase 1..."
                  }
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
                <datalist id="area-suggestions">
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>

              {/* Address */}
              <div className="col-span-1 sm:col-span-3 flex flex-col gap-1.5">
                <label htmlFor="address" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={form.address}
                  onChange={handleChange}
                  placeholder="e.g. House 47, Street 5, DHA Phase 2, Peshawar"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* ── Section 3: Specifications ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
          >
            <h3 className="font-bold text-lg text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <Maximize2 className="h-5 w-5 text-primary" /> Property Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Subcategory / Listing Type */}
              <div className="col-span-2 flex flex-col gap-1.5">
                <label htmlFor="subcategory" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isPlot ? "Plot Type" : "Listing Purpose"} <span className="text-red-500">*</span>
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                >
                  {isPlot ? (
                    <>
                      <option value="RESIDENTIAL">Residential Plot</option>
                      <option value="COMMERCIAL">Commercial Plot</option>
                    </>
                  ) : (
                    <>
                      <option value="SALE">For Sale</option>
                      <option value="RENT">For Rent</option>
                    </>
                  )}
                </select>
              </div>

              {/* Marla */}
              <div className="col-span-2 flex flex-col gap-1.5">
                <label htmlFor="marla" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Size (Marla) <span className="text-red-500">*</span>
                </label>
                <input
                  id="marla"
                  name="marla"
                  type="number"
                  step="any"
                  required
                  min="0.1"
                  value={form.marla}
                  onChange={handleChange}
                  placeholder="e.g. 10 or 20 (1 Kanal)"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>

              {/* Bedrooms & Bathrooms (APARTMENT / HOUSE only) */}
              {needsBedBath && (
                <>
                  <div className="col-span-1 flex flex-col gap-1.5">
                    <label htmlFor="bedrooms" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5" /> Bedrooms <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      min="1"
                      required
                      value={form.bedrooms}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="col-span-1 flex flex-col gap-1.5">
                    <label htmlFor="bathrooms" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" /> Bathrooms <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      min="1"
                      required
                      value={form.bathrooms}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* ── Section 4: Images ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
          >
            <h3 className="font-bold text-lg text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" /> Property Images{" "}
              <span className="text-red-500 text-sm font-normal">(Required — at least 1)</span>
            </h3>

            {/* Drop zone */}
            <div
              onDragEnter={(e) => handleDrag(e, "image")}
              onDragOver={(e) => handleDrag(e, "image")}
              onDragLeave={(e) => handleDrag(e, "image")}
              onDrop={(e) => handleDrop(e, "image")}
              onClick={() => imageInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                dragActiveImg
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/40"
              }`}
            >
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              {uploadingImages ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <span className="text-sm font-semibold text-muted-foreground">Uploading images...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">Drag & drop or click to upload</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WEBP — Max 10MB each · Multiple allowed</span>
                </div>
              )}
            </div>

            {/* Image previews */}
            <AnimatePresence>
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {imageUrls.map((url, idx) => (
                    <motion.div
                      key={url}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-border shadow-sm bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-primary text-primary-foreground">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {imageUrls.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {imageUrls.length} image{imageUrls.length > 1 ? "s" : ""} uploaded. First image is used as the cover photo.
              </p>
            )}
          </motion.div>

          {/* ── Section 5: Video (Optional) ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
          >
            <h3 className="font-bold text-lg text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" /> Walkthrough Video{" "}
              <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
            </h3>

            {!videoUrl ? (
              <div
                onDragEnter={(e) => handleDrag(e, "video")}
                onDragOver={(e) => handleDrag(e, "video")}
                onDragLeave={(e) => handleDrag(e, "video")}
                onDrop={(e) => handleDrop(e, "video")}
                onClick={() => videoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  dragActiveVid
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-accent/40"
                }`}
              >
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                {uploadingVideo ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <span className="text-sm font-semibold text-muted-foreground">Uploading video...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Film className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm font-bold text-foreground">Drag & drop or click to upload walkthrough</span>
                    <span className="text-xs text-muted-foreground">MP4, MOV, WEBM — Max 10MB</span>
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-2xl overflow-hidden border border-border bg-black aspect-video shadow-md max-w-lg w-full mx-auto"
              >
                <video src={videoUrl} controls className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setVideoUrl(null)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-red-600 text-white transition-colors"
                  title="Remove video"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* ── Submit ── */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            type="submit"
            disabled={isSubmitting || uploadingImages || uploadingVideo}
            className="w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/95 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <PlusCircle className="h-5 w-5" />
            )}
            {isSubmitting ? "Publishing listing…" : `Publish ${selectedCard?.label} Listing`}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
