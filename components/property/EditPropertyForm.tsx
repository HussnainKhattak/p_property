"use client";

import { useState } from "react";
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
  Save 
} from "lucide-react";

interface EditPropertyFormProps {
  property: {
    id: string;
    title: string;
    description: string;
    price: number;
    marla: number;
    city: string;
    area: string;
    address: string;
    propertyType: string;
    listingType: string;
    bedrooms: number;
    bathrooms: number;
    imageUrls: string[];
    videoUrl: string | null;
  };
}

export default function EditPropertyForm({ property }: EditPropertyFormProps) {
  const router = useRouter();
  
  const [form, setForm] = useState({
    title: property.title,
    description: property.description,
    price: property.price.toString(),
    marla: property.marla.toString(),
    city: property.city,
    area: property.area,
    address: property.address,
    propertyType: property.propertyType,
    listingType: property.listingType,
    bedrooms: property.bedrooms.toString(),
    bathrooms: property.bathrooms.toString(),
    videoUrl: property.videoUrl || "",
  });

  const [imageUrls, setImageUrls] = useState<string[]>(property.imageUrls || []);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "image" | "videoUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "image") setUploadingImage(true);
    if (field === "videoUrl") setUploadingVideo(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "File upload failed");
      }

      if (field === "image") {
        setImageUrls((prev) => [...prev, data.url]);
      } else {
        setForm((p) => ({ ...p, videoUrl: data.url }));
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Something went wrong during file upload");
    } finally {
      setUploadingImage(false);
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    if (parseFloat(form.price) <= 0) {
      setError("Price must be a positive number");
      setIsSubmitting(false);
      return;
    }
    if (parseFloat(form.marla) <= 0) {
      setError("Marla size must be a positive number");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrls,
          price: parseFloat(form.price),
          marla: parseFloat(form.marla),
          bedrooms: parseInt(form.bedrooms) || 0,
          bathrooms: parseInt(form.bathrooms) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update listing");
        return;
      }

      setSuccess("Listing updated successfully!");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch {
      setError("Network error. Please try again.");
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
    <div className="flex flex-col gap-6">
      {/* Alert Banner */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 font-medium text-center animate-in fade-in duration-300">
          {error}
        </div>
      )}

      {success && (
        <div className="px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary font-medium text-center animate-in fade-in duration-300">
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
                <option value="COMMERCIAL">Commercial Plaza</option>
                <option value="OFFICE">Corporate Office</option>
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

        {/* Section 4: Media details */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="font-bold text-lg text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" /> Media & Attachments
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Property Images
              </label>
              
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center h-28 w-28 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-accent/40 cursor-pointer transition-all duration-300 relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "image")}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : imageUrls[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrls[0]}
                      alt="Uploaded preview"
                      className="h-full w-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center p-2 text-muted-foreground group-hover:text-primary">
                      <ImageIcon className="h-6 w-6 mb-1" />
                      <span className="text-[10px] font-medium leading-none">Upload Image</span>
                    </div>
                  )}
                </label>
                
                <div className="flex-1 flex flex-col gap-1 text-left">
                  <p className="text-xs font-bold text-foreground">Cloudinary Uploader</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Upload new images. Click to upload multiple. Max size: 10MB per image.
                  </p>
                  {imageUrls.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                        ✓ {imageUrls.length} Image{imageUrls.length > 1 ? "s" : ""} Uploaded
                      </span>
                      <button
                        type="button"
                        onClick={() => setImageUrls([])}
                        className="text-[10px] text-red-500 hover:underline font-bold text-left self-start"
                      >
                        Reset Images
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Upload */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Property Walkthrough Video
              </label>

              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center h-28 w-28 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-accent/40 cursor-pointer transition-all duration-300 relative group">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, "videoUrl")}
                    className="hidden"
                    disabled={uploadingVideo}
                  />
                  {uploadingVideo ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : form.videoUrl ? (
                    <div className="h-full w-full rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Video className="h-8 w-8" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center p-2 text-muted-foreground group-hover:text-primary">
                      <Video className="h-6 w-6 mb-1" />
                      <span className="text-[10px] font-medium leading-none">Upload Video</span>
                    </div>
                  )}
                </label>

                <div className="flex-1 flex flex-col gap-1 text-left">
                  <p className="text-xs font-bold text-foreground">Video Walkthrough</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Attach an optional video tour showing room layout. Max size: 10MB.
                  </p>
                  {form.videoUrl && (
                    <span className="text-[10px] text-primary font-semibold flex items-center gap-1 mt-1">
                      ✓ Video Linked Successfully
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Listings */}
        <button
          type="submit"
          disabled={isSubmitting || uploadingImage || uploadingVideo}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4.5 w-4.5" />
          )}
          {isSubmitting ? "Updating listing…" : "Save Listing Details"}
        </button>
      </form>
    </div>
  );
}
