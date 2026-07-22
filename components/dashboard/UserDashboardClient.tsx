"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, Building2, Heart, History, Plus, Edit2, 
  Camera, Save, Loader2, Sparkles, Image as ImageIcon, Video, Link as LinkIcon,
  BarChart3, Eye, TrendingUp, Award, Calendar, MapPin
} from "lucide-react";
import { formatPKR } from "@/lib/utils";
import DashboardActions from "./DashboardActions";
import { uploadDirectToCloudinary } from "@/lib/cloudinary-client";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  profileImage: string | null;
  role: string;
  createdAt: string;
  _count: {
    properties: number;
    bookings: number;
  };
}

interface Property {
  id: string;
  title: string;
  price: number;
  area: string;
  city: string;
  propertyType: string;
  listingType: string;
  status: string;
  marla: number;
  imageUrls: string[];
  views?: number;
  favoritesCount?: number;
  createdAt: string;
}

export default function UserDashboardClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "properties" | "saved" | "recent" | "profile" | "media">("overview");

  // State managers
  const [user, setUser] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Property[]>([]);
  
  // Forms & Loading
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", profileImage: "" });
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Media Library state
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  // Fetch Dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch Profile
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();
      if (profileData.user) {
        setUser(profileData.user);
        setProfileForm({
          name: profileData.user.name || "",
          phone: profileData.user.phone || "",
          profileImage: profileData.user.profileImage || "",
        });
      }

      // Fetch User's Listings
      const propertiesRes = await fetch("/api/properties");
      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        if (profileData.user?.id) {
          const userListings = propertiesData.filter((p: any) => p.ownerId === profileData.user.id);
          setProperties(userListings);
        }
      }

      // Fetch Saved Properties
      const savedRes = await fetch("/api/saved-properties");
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedProperties(savedData);
      }

      // Fetch Recently Viewed properties from LocalStorage
      const localRecentIds = JSON.parse(localStorage.getItem("recently_viewed_properties") || "[]");
      if (localRecentIds.length > 0) {
        const recentRes = await fetch(`/api/properties/search?limit=10`);
        if (recentRes.ok) {
          const recentData = await recentRes.json();
          const filtered = recentData.properties.filter((p: Property) => localRecentIds.includes(p.id));
          setRecentlyViewed(filtered);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update Profile Information
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone || null,
          profileImage: profileForm.profileImage || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => prev ? { ...prev, ...data.user } : prev);
        setProfileMessage({ type: "success", text: "Profile details updated successfully!" });
      } else {
        setProfileMessage({ type: "error", text: data.error || "Update failed." });
      }
    } catch {
      setProfileMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSavingProfile(false);
    }
  };

  // Upload Custom Media
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);

    try {
      const url = await uploadDirectToCloudinary(file);
      setUploadedUrls((prev) => [url, ...prev]);
      if (activeTab === "profile") {
        setProfileForm((prev) => ({ ...prev, profileImage: url }));
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error uploading file.");
    } finally {
      setUploadingMedia(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard! You can paste this in your property cover image or video URL fields.");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard index...</p>
      </div>
    );
  }

  const activeProperties = properties.filter((p) => p.status === "AVAILABLE");

  // Aggregate Analytics Calculations
  const totalPropertyViews = properties.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalPropertySaves = properties.reduce((acc, p) => acc + (p.favoritesCount || 0), 0);

  const mostViewedProperty = properties.length > 0
    ? [...properties].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
    : null;

  const mostSavedProperty = properties.length > 0
    ? [...properties].sort((a, b) => (b.favoritesCount || 0) - (a.favoritesCount || 0))[0]
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-8 text-left">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Personal Dashboard
          </span>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            My Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, <span className="font-semibold text-foreground">{user?.name || "Member"}</span>
          </p>
        </div>

        <Link
          href="/properties/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          Add Property Listing
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 flex flex-col gap-2 p-4 bg-card border border-border rounded-2xl">
          {[
            { id: "overview", label: "Dashboard Overview", icon: Building2 },
            { id: "analytics", label: "Property Analytics", icon: BarChart3 },
            { id: "properties", label: "My Listings", icon: Building2 },
            { id: "saved", label: "Saved Properties", icon: Heart },
            { id: "recent", label: "Recently Viewed", icon: History },
            { id: "profile", label: "Profile Settings", icon: User },
            { id: "media", label: "Upload & Media Manager", icon: ImageIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-left ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Content Panel */}
        <main className="lg:col-span-9 flex flex-col gap-6">
          
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              
              {/* Statistic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm text-left">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{properties.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Properties</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm text-left">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{totalPropertyViews}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Views</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm text-left">
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{totalPropertySaves}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Saves</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm text-left">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{savedProperties.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Bookmarks</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-card border border-border rounded-2xl p-6 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-1">Property Performance Analytics</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    Track live views and bookmark saves on your property listings in real-time.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className="px-4 py-2.5 rounded-xl bg-accent hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <BarChart3 className="h-4 w-4" /> View Full Analytics
                </button>
              </div>
            </div>
          )}

          {/* TAB: PROPERTY ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4 shadow-sm text-left">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-foreground">{properties.length}</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Properties</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4 shadow-sm text-left">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-foreground">{totalPropertyViews}</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Property Views</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4 shadow-sm text-left">
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-foreground">{totalPropertySaves}</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Property Saves</p>
                  </div>
                </div>
              </div>

              {/* Spotlight Cards: Most Viewed & Most Saved */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Most Viewed */}
                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 text-left shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <TrendingUp className="h-3.5 w-3.5" /> Most Viewed Property
                    </span>
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <Eye className="h-4 w-4" /> {mostViewedProperty?.views || 0} Views
                    </span>
                  </div>

                  {mostViewedProperty ? (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-accent/30 border border-border">
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {mostViewedProperty.imageUrls?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={mostViewedProperty.imageUrls[0]} alt={mostViewedProperty.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col text-left truncate">
                        <h4 className="font-bold text-sm text-foreground truncate">{mostViewedProperty.title}</h4>
                        <p className="text-xs text-muted-foreground">{mostViewedProperty.area}, {mostViewedProperty.city}</p>
                        <p className="text-xs font-bold text-primary mt-0.5">{formatPKR(mostViewedProperty.price)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-4">No property data available.</p>
                  )}
                </div>

                {/* Most Saved */}
                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 text-left shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      <Award className="h-3.5 w-3.5" /> Most Saved Property
                    </span>
                    <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                      <Heart className="h-4 w-4" /> {mostSavedProperty?.favoritesCount || 0} Saves
                    </span>
                  </div>

                  {mostSavedProperty ? (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-accent/30 border border-border">
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {mostSavedProperty.imageUrls?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={mostSavedProperty.imageUrls[0]} alt={mostSavedProperty.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col text-left truncate">
                        <h4 className="font-bold text-sm text-foreground truncate">{mostSavedProperty.title}</h4>
                        <p className="text-xs text-muted-foreground">{mostSavedProperty.area}, {mostSavedProperty.city}</p>
                        <p className="text-xs font-bold text-primary mt-0.5">{formatPKR(mostSavedProperty.price)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-4">No property data available.</p>
                  )}
                </div>
              </div>

              {/* Detailed Property Analytics Breakdown Table */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground">Property Analytics Breakdown</h3>
                  <span className="text-xs text-muted-foreground">{properties.length} listings</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-accent/40 text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border">
                      <tr>
                        <th className="px-6 py-4">Property</th>
                        <th className="px-6 py-4">City / Area</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Upload Date</th>
                        <th className="px-6 py-4 text-center">👁 Views</th>
                        <th className="px-6 py-4 text-center">❤️ Saved</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {properties.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                            No property listings found.
                          </td>
                        </tr>
                      ) : (
                        properties.map((p) => {
                          const uploadDate = new Date(p.createdAt).toLocaleDateString("en-PK", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          });

                          return (
                            <tr key={p.id} className="hover:bg-accent/10 transition-colors">
                              <td className="px-6 py-4 font-bold text-foreground">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                    {p.imageUrls?.[0] ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={p.imageUrls[0]} alt={p.title} className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <span className="truncate max-w-[200px]">{p.title}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">{p.area}, {p.city}</td>
                              <td className="px-6 py-4 font-bold text-primary">{formatPKR(p.price)}</td>
                              <td className="px-6 py-4 text-muted-foreground text-xs">{uploadDate}</td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                  <Eye className="h-3.5 w-3.5" />
                                  {p.views ?? 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                  <Heart className="h-3.5 w-3.5" />
                                  {p.favoritesCount ?? 0}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: PROPERTIES */}
          {activeTab === "properties" && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-300">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-lg text-foreground">My Listings</h2>
                <span className="text-xs text-muted-foreground">{properties.length} total</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-accent/40 text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Area Location</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4 text-center">Analytics</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {properties.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          You haven&apos;t listed any properties yet. Click &quot;Add Property&quot; to begin!
                        </td>
                      </tr>
                    ) : (
                      properties.map((p) => (
                        <tr key={p.id} className="hover:bg-accent/10 transition-colors">
                          <td className="px-6 py-4 font-bold text-foreground">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                {p.imageUrls?.[0] ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={p.imageUrls[0]} alt={p.title} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <span className="truncate max-w-[200px]">{p.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{p.area}, {p.city}</td>
                          <td className="px-6 py-4 font-bold text-primary">{formatPKR(p.price)}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-xs font-bold">
                              <span className="inline-flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                                <Eye className="h-3 w-3" /> {p.views ?? 0}
                              </span>
                              <span className="inline-flex items-center gap-1 text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                                <Heart className="h-3 w-3" /> {p.favoritesCount ?? 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                              p.status === "AVAILABLE" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/properties/edit/${p.id}`}
                                className="p-2 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Link>
                              <DashboardActions propertyId={p.id} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SAVED PROPERTIES */}
          {activeTab === "saved" && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-300">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-lg text-foreground">Saved Bookmarks</h2>
                <span className="text-xs text-muted-foreground">{savedProperties.length} bookmarks</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-accent/40 text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Area Location</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4 text-right">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {savedProperties.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                          No saved bookmarks found. Heart listings around the search page to add them here!
                        </td>
                      </tr>
                    ) : (
                      savedProperties.map((p) => (
                        <tr key={p.id} className="hover:bg-accent/10 transition-colors">
                          <td className="px-6 py-4 font-bold text-foreground">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                {p.imageUrls?.[0] ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={p.imageUrls[0]} alt={p.title} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <span className="truncate max-w-[200px]">{p.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{p.area}, {p.city}</td>
                          <td className="px-6 py-4 font-bold text-primary">{formatPKR(p.price)}</td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/properties/${p.id}`}
                              className="inline-flex text-xs font-semibold px-3 py-1.5 bg-accent hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: RECENTLY VIEWED */}
          {activeTab === "recent" && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-300">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-lg text-foreground">Recently Viewed</h2>
                <button
                  onClick={() => { localStorage.removeItem("recently_viewed_properties"); setRecentlyViewed([]); }}
                  className="text-xs text-red-500 hover:underline font-bold"
                >
                  Clear History
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-accent/40 text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Area Location</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4 text-right">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentlyViewed.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                          No recently viewed items recorded.
                        </td>
                      </tr>
                    ) : (
                      recentlyViewed.map((p) => (
                        <tr key={p.id} className="hover:bg-accent/10 transition-colors">
                          <td className="px-6 py-4 font-bold text-foreground">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                {p.imageUrls?.[0] ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={p.imageUrls[0]} alt={p.title} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <span className="truncate max-w-[200px]">{p.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{p.area}, {p.city}</td>
                          <td className="px-6 py-4 font-bold text-primary">{formatPKR(p.price)}</td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/properties/${p.id}`}
                              className="inline-flex text-xs font-semibold px-3 py-1.5 bg-accent hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
              
              {/* Photo Upload Side Panel */}
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
                <div className="relative">
                  {profileForm.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profileForm.profileImage} alt="Profile" className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20" />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white text-3xl font-black">
                      {(profileForm.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 p-2 rounded-full bg-card border border-border cursor-pointer hover:bg-accent transition-colors shadow-sm">
                    <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" disabled={uploadingMedia} />
                    {uploadingMedia ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5 text-muted-foreground" />}
                  </label>
                </div>

                <div className="text-left w-full border-t border-border/60 pt-4 mt-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Authorization System</p>
                  <p className="text-sm font-bold text-foreground mt-1">{user?.role || "USER"}</p>
                </div>
              </div>

              {/* Input Form Panel */}
              <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6 text-left">
                <h3 className="font-bold text-base text-foreground mb-4">Account Settings</h3>

                {profileMessage && (
                  <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-center mb-4 ${
                    profileMessage.type === "success" ? "bg-primary/10 text-primary border border-primary/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}>
                    {profileMessage.text}
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      className="h-11 px-4 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      className="h-11 px-4 border border-border rounded-xl bg-muted text-sm text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      className="h-11 px-4 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="h-11 bg-primary text-primary-foreground font-bold hover:bg-primary/95 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: MEDIA MANAGER */}
          {activeTab === "media" && (
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-left animate-in fade-in duration-300">
              <div className="border-b border-border pb-4 mb-6">
                <h3 className="font-bold text-lg text-foreground">Media Upload Center</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Upload photos or video clips directly and copy URLs</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Media Type selectors */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setMediaType("image")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      mediaType === "image" ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-accent/80"
                    }`}
                  >
                    Image Upload
                  </button>
                  <button
                    onClick={() => setMediaType("video")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      mediaType === "video" ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-accent/80"
                    }`}
                  >
                    Video Upload
                  </button>
                </div>

                {/* File input label */}
                <label className="flex-1 max-w-sm h-11 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-accent/50 cursor-pointer text-xs font-bold transition-all">
                  <input
                    type="file"
                    accept={mediaType === "image" ? "image/*" : "video/*"}
                    onChange={handleMediaUpload}
                    className="hidden"
                    disabled={uploadingMedia}
                  />
                  {uploadingMedia ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      {mediaType === "image" ? <ImageIcon className="h-4 w-4 text-primary" /> : <Video className="h-4 w-4 text-primary" />}
                      <span>Choose {mediaType === "image" ? "Image" : "Video"} File</span>
                    </>
                  )}
                </label>
              </div>

              {/* Uploaded media link list */}
              {uploadedUrls.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Uploaded Links</h4>
                  <div className="flex flex-col gap-2">
                    {uploadedUrls.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-accent/20">
                        {mediaType === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt="Uploaded item" className="h-10 w-10 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-lg flex-shrink-0">
                            <Video className="h-4 w-4" />
                          </div>
                        )}
                        <span className="text-xs text-foreground font-semibold truncate flex-1">{url}</span>
                        <button
                          onClick={() => copyToClipboard(url)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] hover:bg-primary/95 flex items-center gap-1.5 transition-colors"
                        >
                          <LinkIcon className="h-3.5 w-3.5" /> Copy URL
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
