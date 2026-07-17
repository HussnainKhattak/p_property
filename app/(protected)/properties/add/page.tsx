"use client";

import { useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  DollarSign, 
  Loader2, 
  Image as ImageIcon, 
  Video, 
  Trash2,
  PlusCircle,
  Upload,
  Film
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadDirectToCloudinary } from "@/lib/cloudinary-client";

export default function AddPropertyPage() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    marla: "",
    city: "Peshawar",
    area: "",
    address: "",
    propertyType: "HOUSE",
    listingType: "SALE",
    bedrooms: "0",
    bathrooms: "0",
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Loading states
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  // Upload File handler
  const uploadFile = async (file: File): Promise<string> => {
    return await uploadDirectToCloudinary(file);
  };

  // Handle Images selection & upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processImages(Array.from(files));
  };

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
        const url = await uploadFile(file);
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

  // Handle Video selection & upload
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processVideo(files[0]);
  };

  const processVideo = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      showError("Only video files are allowed");
      return;
    }
    setUploadingVideo(true);
    setError("");
    try {
      const url = await uploadFile(file);
      setVideoUrl(url);
    } catch (err: any) {
      showError(err.message || "Failed to upload video");
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  // Drag & Drop Handlers
  const [dragActiveImg, setDragActiveImg] = useState(false);
  const [dragActiveVid, setDragActiveVid] = useState(false);

  const handleDrag = (e: DragEvent, type: "image" | "video") => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (type === "image") setDragActiveImg(true);
      if (type === "video") setDragActiveVid(true);
    } else if (e.type === "dragleave") {
      if (type === "image") setDragActiveImg(false);
      if (type === "video") setDragActiveVid(false);
    }
  };

  const handleDrop = async (e: DragEvent, type: "image" | "video") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "image") {
      setDragActiveImg(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await processImages(Array.from(e.dataTransfer.files));
      }
    } else {
      setDragActiveVid(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await processVideo(e.dataTransfer.files[0]);
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeVideo = () => {
    setVideoUrl(null);
  };

  const showError = (msg: string) => {
    setError(msg);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

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
      showError("Marla size must be a positive number.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrls,
          videoUrl: videoUrl || null,
          price: parseFloat(form.price),
          marla: parseFloat(form.marla),
          bedrooms: parseInt(form.bedrooms) || 0,
          bathrooms: parseInt(form.bathrooms) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || "Failed to create property listing.");
        return;
      }

      setSuccess("Listing created successfully! Taking you to the homepage...");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch {
      showError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const locations = [
    "DHA Peshawar",
    "Hayatabad",
    "Regi Model Town",
    "Warsak Road",
    "University Town",
    "Dalazak Road",
    "Ring Road",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Title */}
      <div className="flex flex-col gap-2 mb-10 text-left">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          List a New Property
        </h1>
        <p className="text-muted-foreground text-sm">
          Submit your property to Peshawar's trusted marketplace. Add photos and an optional walkthrough video.
        </p>
      </div>

      {/* Status Alerts */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 font-medium text-center mb-8 animate-in fade-in duration-300">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-500 font-medium text-center mb-8 animate-in fade-in duration-300">
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {/* Section 1: Basic details */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="font-bold text-lg text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Basic Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Listing Title */}
            <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
              <label htmlFor="title" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Listing Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. 1 Kanal Luxury House for Sale in DHA Sector A"
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>

            {/* Description */}
            <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
              <label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Property Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="Detail key architectural layouts, society facilities, nearby locations, security infrastructure..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Price */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="price" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Price (PKR)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="price"
                  name="price"
                  type="number"
                  required
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. 65000000"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Listing Type */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="listingType" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Listing Type
              </label>
              <select
                id="listingType"
                name="listingType"
                value={form.listingType}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              >
                <option value="SALE">For Sale</option>
                <option value="RENT">For Rent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Location details */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
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
                Area Sector
              </label>
              <select
                id="area"
                name="area"
                required
                value={form.area}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              >
                <option value="">Select Locality</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="col-span-1 sm:col-span-3 flex flex-col gap-1.5">
              <label htmlFor="address" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Street Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. Sector G, Phase 6"
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Specifications */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="font-bold text-lg text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <Maximize2 className="h-5 w-5 text-primary" /> Property Specifications
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Property Type */}
            <div className="flex flex-col gap-1.5 col-span-2">
              <label htmlFor="propertyType" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Property Type
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              >
                <option value="HOUSE">House</option>
                <option value="APARTMENT">Apartment</option>
                <option value="PLOT">Plot</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="OFFICE">Office</option>
              </select>
            </div>

            {/* Marla Size */}
            <div className="flex flex-col gap-1.5 col-span-2">
              <label htmlFor="marla" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Area Size (Marla)
              </label>
              <input
                id="marla"
                name="marla"
                type="number"
                step="any"
                required
                value={form.marla}
                onChange={handleChange}
                placeholder="e.g. 10 or 20 (for 1 Kanal)"
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>

            {/* Bedrooms */}
            {form.propertyType !== "PLOT" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bedrooms" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5" /> Bedrooms
                  </label>
                  <input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    value={form.bedrooms}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>

                {/* Bathrooms */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bathrooms" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" /> Bathrooms
                  </label>
                  <input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    value={form.bathrooms}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 4: Image Upload Section (REQUIRED) */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="font-bold text-lg text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" /> Property Images (Required)
          </h3>

          {/* Drag & Drop Box */}
          <div
            onDragEnter={(e) => handleDrag(e, "image")}
            onDragOver={(e) => handleDrag(e, "image")}
            onDragLeave={(e) => handleDrag(e, "image")}
            onDrop={(e) => handleDrop(e, "image")}
            onClick={() => imageInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm font-semibold text-muted-foreground">Uploading images...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-bold text-foreground">Drag & drop files or click to upload</span>
                <span className="text-xs text-muted-foreground">Upload images of your property (Max 10MB each)</span>
              </div>
            )}
          </div>

          {/* Image Previews */}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              <AnimatePresence>
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Section 5: Video Upload Section (OPTIONAL) */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="font-bold text-lg text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" /> Property Walkthrough Video (Optional)
          </h3>

          {/* Video Drag & Drop Box */}
          {!videoUrl && (
            <div
              onDragEnter={(e) => handleDrag(e, "video")}
              onDragOver={(e) => handleDrag(e, "video")}
              onDragLeave={(e) => handleDrag(e, "video")}
              onDrop={(e) => handleDrop(e, "video")}
              onClick={() => videoInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm font-semibold text-muted-foreground">Uploading video...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Video className="h-10 w-10 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">Drag & drop walkthrough or click to upload</span>
                  <span className="text-xs text-muted-foreground">Attach a short video tour (Max 10MB)</span>
                </div>
              )}
            </div>
          )}

          {/* Video Preview */}
          {videoUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative rounded-2xl overflow-hidden border border-border bg-black aspect-video shadow-md mt-2 max-w-lg w-full mx-auto"
            >
              <video src={videoUrl} controls className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-red-600 text-white transition-colors"
                title="Remove video"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Submit Listings */}
        <button
          type="submit"
          disabled={isSubmitting || uploadingImages || uploadingVideo}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="h-4.5 w-4.5" />
          )}
          {isSubmitting ? "Publishing listing…" : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
