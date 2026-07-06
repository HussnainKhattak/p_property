"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Phone,
  Save,
  Loader2,
  Camera,
  Building2,
  Calendar,
  Shield,
  CheckCircle2,
} from "lucide-react";

interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  profileImage: string | null;
  role: string;
  createdAt: string;
  _count: { properties: number; bookings: number; reviews: number };
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", profileImage: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
          setForm({
            name: data.user.name || "",
            phone: data.user.phone || "",
            profileImage: data.user.profileImage || "",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          profileImage: form.profileImage || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Update failed." });
        return;
      }

      setProfile((prev) => prev ? { ...prev, ...data.user } : prev);
      await updateSession({ name: form.name });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const avatarText = (form.name || session?.user?.name || "U")[0].toUpperCase();
  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "long" })
    : "—";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-3xl font-black tracking-tight text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your personal information and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Avatar + Stats */}
        <div className="flex flex-col gap-6">
          {/* Avatar Card */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
            <div className="relative">
              {form.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.profileImage}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white text-3xl font-black ring-4 ring-primary/20">
                  {avatarText}
                </div>
              )}
              <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-card border border-border">
                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <h2 className="font-bold text-lg text-foreground">{form.name || "—"}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>

            {/* Role Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <Shield className="h-3 w-3" />
              {profile?.role}
            </span>

            {/* Join Date */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Member since {joinDate}
            </div>
          </div>

          {/* Stats Card */}
          {profile?._count && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Account Stats</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>Listed Properties</span>
                  </div>
                  <span className="font-bold text-foreground">{profile._count.properties}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Bookings Made</span>
                  </div>
                  <span className="font-bold text-foreground">{profile._count.bookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Reviews Written</span>
                  </div>
                  <span className="font-bold text-foreground">{profile._count.reviews}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right — Edit Form */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 sm:p-8">
          <h3 className="font-bold text-lg text-foreground mb-6">Edit Profile</h3>

          {/* Message */}
          {message && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium text-center mb-6 animate-in fade-in duration-300 ${
              message.type === "success"
                ? "bg-primary/10 border border-primary/20 text-primary"
                : "bg-red-500/10 border border-red-500/20 text-red-500"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Email Address <span className="font-normal normal-case">(cannot be changed)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={profile?.email || ""}
                  readOnly
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="0300-1234567"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Profile Image URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Profile Image URL
              </label>
              <div className="relative">
                <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  value={form.profileImage}
                  onChange={(e) => setForm((p) => ({ ...p, profileImage: e.target.value }))}
                  placeholder="https://cloudinary.com/your-image.jpg"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Save */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full h-12 mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
