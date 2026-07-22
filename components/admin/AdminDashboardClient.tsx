"use client";

import { useState, useEffect } from "react";
import { 
  Users, Building2, Eye, Trash2, CheckCircle2, XCircle, Search, 
  ShieldAlert, RefreshCw, Layers, Sparkles, ShieldCheck,
  TrendingUp, Activity, ShieldAlert as AlertIcon,
  CheckCircle, AlertTriangle, X, SlidersHorizontal, Loader2
} from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: "USER" | "AGENT" | "ADMIN";
  profileImage: string | null;
  image: string | null;
  createdAt: string;
  _count: {
    properties: number;
  };
}

interface Property {
  id: string;
  title: string;
  price: number;
  area: string;
  city: string;
  isApproved: boolean;
  propertyType: string;
  listingType: string;
  createdAt: string;
  owner: {
    name: string | null;
    email: string | null;
  };
}

interface Stats {
  totalUsers: number;
  totalProperties: number;
  recentProperties: Property[];
}

interface Toast {
  message: string;
  type: "success" | "error" | "info";
  id: string;
}

interface Category {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
}

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "users" | "categories">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Search and Loading states
  const [userQuery, setUserQuery] = useState("");
  const [propertyQuery, setPropertyQuery] = useState("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Edit category states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  // Custom inline modals and toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    danger?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch Stats (Overview)
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        showToast("Failed to fetch dashboard stats", "error");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      showToast("Error connecting to server for stats", "error");
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Users
  const fetchUsers = async (query = "") => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/admin/users?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        showToast("Failed to load users. Please try again.", "error");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      showToast("Connection error fetching users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Properties (All properties for moderation list)
  const fetchProperties = async (query = "") => {
    setLoadingProperties(true);
    try {
      const res = await fetch(`/api/properties/search?limit=100&query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties);
      } else {
        showToast("Failed to fetch listings catalog", "error");
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      showToast("Connection error fetching properties", "error");
    } finally {
      setLoadingProperties(false);
    }
  };

  // Fetch Categories list
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        showToast("Failed to fetch category definitions", "error");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      showToast("Connection error fetching categories", "error");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditTitle(cat.title);
    setEditDescription(cat.description);
    setEditImage(cat.image);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSavingCategory(true);
    try {
      const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          image: editImage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCategories((prev) => prev.map((c) => (c.id === data.id ? data : c)));
        showToast("Category settings updated successfully", "success");
        setEditingCategory(null);
      } else {
        const errData = await res.json();
        showToast(errData.error || "Failed to update category details", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Connection error updating category", "error");
    } finally {
      setSavingCategory(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchProperties();
    fetchCategories();
  }, []);

  // Handle User Search Input
  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(userQuery);
  };

  // Handle Property Search Input
  const handlePropertySearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties(propertyQuery);
  };

  // Approve / Reject Property
  const handleToggleApproval = async (propertyId: string, currentApproval: boolean) => {
    setActioningId(propertyId);
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentApproval }),
      });
      if (res.ok) {
        // Update local state arrays
        const updatedProps = properties.map((p) => 
          p.id === propertyId ? { ...p, isApproved: !currentApproval } : p
        );
        setProperties(updatedProps);
        
        if (stats) {
          const updatedRecents = stats.recentProperties.map((p) => 
            p.id === propertyId ? { ...p, isApproved: !currentApproval } : p
          );
          setStats({ ...stats, recentProperties: updatedRecents });
        }
        showToast(`Listing ${!currentApproval ? 'approved' : 'rejected'} successfully`, "success");
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating property status", "error");
    } finally {
      setActioningId(null);
    }
  };

  // Delete Property listing
  const handleDeleteProperty = (propertyId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Listing",
      message: "Are you sure you want to permanently delete this listing? This action is irreversible.",
      danger: true,
      onConfirm: async () => {
        setActioningId(propertyId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/admin/properties/${propertyId}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setProperties(properties.filter((p) => p.id !== propertyId));
            if (stats) {
              setStats({
                ...stats,
                totalProperties: stats.totalProperties - 1,
                recentProperties: stats.recentProperties.filter((p) => p.id !== propertyId),
              });
            }
            showToast("Property listing deleted successfully", "success");
          } else {
            showToast("Failed to delete property", "error");
          }
        } catch (err) {
          console.error(err);
          showToast("Error deleting property", "error");
        } finally {
          setActioningId(null);
        }
      }
    });
  };

  // Update User Role
  const handleUpdateRole = async (userId: string, newRole: "USER" | "AGENT" | "ADMIN") => {
    setActioningId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        showToast(`User role updated to ${newRole}`, "success");
      } else {
        showToast(data.error || "Failed to update role", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating user role", "error");
    } finally {
      setActioningId(null);
    }
  };

  // Delete User
  const handleDeleteUser = (userId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete User Account",
      message: "Are you sure you want to permanently delete this user account? This will delete all their property listings, reviews, and bookings.",
      danger: true,
      onConfirm: async () => {
        setActioningId(userId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/admin/users/${userId}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (res.ok) {
            setUsers(users.filter((u) => u.id !== userId));
            if (stats) {
              setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
            }
            showToast("User account deleted successfully", "success");
          } else {
            showToast(data.error || "Failed to delete user", "error");
          }
        } catch (err) {
          console.error(err);
          showToast("Error deleting user account", "error");
        } finally {
          setActioningId(null);
        }
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Toast Alerts Portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl shadow-xl flex items-center justify-between border ${
                toast.type === "success" 
                  ? "bg-green-500/10 border-green-500/20 text-green-400" 
                  : toast.type === "error"
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-400"
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === "success" && <CheckCircle className="h-5 w-5" />}
                {toast.type === "error" && <AlertTriangle className="h-5 w-5" />}
                <p className="text-sm font-semibold">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-muted-foreground hover:text-foreground ml-4"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-card border border-border p-6 rounded-2xl max-w-md w-full relative z-10 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${confirmModal.danger ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                  <AlertIcon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{confirmModal.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-md ${
                    confirmModal.danger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border pb-8 mb-8 text-left">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
            <ShieldAlert className="h-3.5 w-3.5" />
            Core Platform Administration
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Control Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Overview statistics, catalog moderation, user roles, and full administrative overrides.
          </p>
        </div>
        
        <button 
          onClick={() => { fetchStats(); fetchUsers(); fetchProperties(); fetchCategories(); showToast("Dashboard data reloaded"); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/80 text-foreground font-semibold border border-border rounded-xl text-xs transition-all self-start sm:self-center hover-lift shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload Catalog
        </button>
      </div>

      {/* Modern Tabs Menu */}
      <div className="flex border-b border-border gap-0 mb-8 overflow-x-auto pb-px">
        {[
          { id: "overview",    label: "Overview",    icon: Layers          },
          { id: "properties", label: "Properties",   icon: Building2       },
          { id: "users",      label: "Users",        icon: Users            },
          { id: "categories", label: "Categories",   icon: SlidersHorizontal },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as "overview" | "properties" | "users" | "categories");
                if (tab.id === "categories") fetchCategories();
                if (tab.id === "properties") fetchProperties();
                if (tab.id === "users") fetchUsers();
              }}
              className={`flex items-center gap-1.5 px-4 py-3 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      <div>
        
        {/* ──────── TAB: OVERVIEW ──────── */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Total Users */}
              <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-md relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
                <div className="text-left relative z-10">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" /> Active Users
                  </p>
                  <h3 className="text-4xl font-extrabold text-foreground mt-2">
                    {loadingStats ? (
                      <span className="inline-block w-16 h-8 bg-accent animate-pulse rounded-lg" />
                    ) : (
                      stats?.totalUsers ?? 0
                    )}
                  </h3>
                </div>
                <div className="p-4 bg-primary/10 rounded-2xl text-primary relative z-10 transition-transform duration-300 group-hover:scale-110">
                  <Users className="h-7 w-7" />
                </div>
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/5 rounded-full translate-x-12 translate-y-12 blur-2xl" />
              </div>

              {/* Total Properties */}
              <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-md relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
                <div className="text-left relative z-10">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-primary" /> Properties Listed
                  </p>
                  <h3 className="text-4xl font-extrabold text-foreground mt-2">
                    {loadingStats ? (
                      <span className="inline-block w-16 h-8 bg-accent animate-pulse rounded-lg" />
                    ) : (
                      stats?.totalProperties ?? 0
                    )}
                  </h3>
                </div>
                <div className="p-4 bg-primary/10 rounded-2xl text-primary relative z-10 transition-transform duration-300 group-hover:scale-110">
                  <Building2 className="h-7 w-7" />
                </div>
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/5 rounded-full translate-x-12 translate-y-12 blur-2xl" />
              </div>

              {/* System Credentials Card */}
              <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-md relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
                <div className="text-left relative z-10">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Administrative Role</p>
                  <h3 className="text-xl font-extrabold text-primary mt-3 flex items-center gap-2">
                    <ShieldCheck className="h-5.5 w-5.5" /> Super Administrator
                  </h3>
                </div>
                <div className="p-4 bg-green-500/10 rounded-2xl text-green-500 relative z-10 transition-transform duration-300 group-hover:scale-110">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-green-500/5 rounded-full translate-x-12 translate-y-12 blur-2xl" />
              </div>
            </div>

            {/* Recent Uploads Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
              <div className="px-6 py-5 border-b border-border text-left flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-lg text-foreground">Recent Submissions</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Quick moderate panel for properties uploaded recently</p>
                </div>
                <span className="px-3 py-1 bg-accent border border-border rounded-lg text-xs font-semibold text-muted-foreground">
                  Newest Listings
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-accent/30 text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4">Property info</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Price tag</th>
                      <th className="px-6 py-4">Moderation</th>
                      <th className="px-6 py-4 text-right">Overrides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingStats ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-8 bg-accent rounded w-3/4" /></td>
                          <td className="px-6 py-4"><div className="h-4 bg-accent rounded w-1/2" /></td>
                          <td className="px-6 py-4"><div className="h-5 bg-accent rounded w-1/3" /></td>
                          <td className="px-6 py-4"><div className="h-6 bg-accent rounded w-1/4" /></td>
                          <td className="px-6 py-4"><div className="h-8 bg-accent rounded w-12 ml-auto" /></td>
                        </tr>
                      ))
                    ) : stats?.recentProperties.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                          No recent uploads found.
                        </td>
                      </tr>
                    ) : (
                      stats?.recentProperties.map((p) => (
                        <tr key={p.id} className="hover:bg-accent/20 transition-colors">
                          <td className="px-6 py-4 font-bold text-foreground">
                            <div className="flex flex-col text-left">
                              <span className="hover:text-primary transition-colors cursor-pointer">{p.title}</span>
                              <span className="text-[10px] text-muted-foreground font-normal mt-0.5">
                                Agent: {p.owner.name || "Unknown"} ({p.owner.email})
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{p.area}, {p.city}</td>
                          <td className="px-6 py-4 text-primary font-bold">{formatPKR(p.price)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              p.isApproved ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            }`}>
                              {p.isApproved ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {p.isApproved ? "Approved" : "Rejected"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleApproval(p.id, p.isApproved)}
                                disabled={actioningId === p.id}
                                className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all shadow-sm ${
                                  p.isApproved
                                    ? "border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
                                    : "border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white"
                                }`}
                              >
                                {p.isApproved ? "Reject" : "Approve"}
                              </button>
                              <button
                                onClick={() => handleDeleteProperty(p.id)}
                                disabled={actioningId === p.id}
                                className="p-2 rounded-lg border border-border hover:border-red-500 hover:text-red-500 text-muted-foreground transition-all duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ──────── TAB: PROPERTIES ──────── */}
        {activeTab === "properties" && (
          <div className="flex flex-col gap-6">
            {/* Search filter bar */}
            <form onSubmit={handlePropertySearch} className="flex gap-2 max-w-3xl w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search listings by title, description or area..."
                  value={propertyQuery}
                  onChange={(e) => setPropertyQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <button type="submit" className="h-11 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/95 rounded-xl text-xs transition-all shadow-md">
                Search
              </button>
            </form>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-accent/30 text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Area</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingProperties ? (
                      [...Array(4)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 bg-accent rounded w-3/4" /></td>
                          <td className="px-6 py-4"><div className="h-4 bg-accent rounded w-1/2" /></td>
                          <td className="px-6 py-4"><div className="h-4 bg-accent rounded w-1/3" /></td>
                          <td className="px-6 py-4"><div className="h-4 bg-accent rounded w-1/4" /></td>
                          <td className="px-6 py-4"><div className="h-4 bg-accent rounded w-1/5" /></td>
                          <td className="px-6 py-4"><div className="h-8 bg-accent rounded w-20 ml-auto" /></td>
                        </tr>
                      ))
                    ) : properties.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                          No listings found matching your search.
                        </td>
                      </tr>
                    ) : (
                      properties.map((p) => (
                        <tr key={p.id} className="hover:bg-accent/20 transition-colors">
                          <td className="px-6 py-4 font-bold text-foreground max-w-xs truncate">{p.title}</td>
                          <td className="px-6 py-4 text-muted-foreground">{p.area}, {p.city}</td>
                          <td className="px-6 py-4 font-bold text-primary">{formatPKR(p.price)}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent text-foreground border border-border uppercase">
                              {p.propertyType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              p.isApproved ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            }`}>
                              {p.isApproved ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {p.isApproved ? "Approved" : "Rejected"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleApproval(p.id, p.isApproved)}
                                disabled={actioningId === p.id}
                                className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all shadow-sm ${
                                  p.isApproved
                                    ? "border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
                                    : "border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white"
                                }`}
                              >
                                {p.isApproved ? "Reject" : "Approve"}
                              </button>
                              <a
                                href={`/properties/${p.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => handleDeleteProperty(p.id)}
                                disabled={actioningId === p.id}
                                className="p-2 rounded-lg border border-border hover:border-red-500 hover:text-red-500 text-muted-foreground transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ──────── TAB: USERS ──────── */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-6">
            {/* Search filter bar */}
            <form onSubmit={handleUserSearch} className="flex gap-2 max-w-3xl w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search users by name, email or phone number..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <button type="submit" className="h-11 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/95 rounded-xl text-xs transition-all shadow-md">
                Search
              </button>
            </form>

            {/* Grid display for user cards rather than complex table for better visual styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingUsers ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-md animate-pulse flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-accent" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-4 bg-accent rounded w-2/3" />
                        <div className="h-3 bg-accent rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-4 bg-accent rounded w-3/4" />
                    <div className="h-10 bg-accent rounded w-full mt-2" />
                  </div>
                ))
              ) : users.length === 0 ? (
                <div className="col-span-full bg-card border border-border p-10 rounded-2xl text-center text-muted-foreground">
                  No users found matching your query.
                </div>
              ) : (
                users.map((u) => (
                  <div key={u.id} className="bg-card border border-border p-6 rounded-2xl shadow-md flex flex-col justify-between hover:border-primary/20 transition-all duration-300">
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center font-extrabold text-sm overflow-hidden flex-shrink-0 border-2 border-border shadow-inner">
                            {u.profileImage || u.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.profileImage || u.image || ""} alt={u.name || "User"} className="h-full w-full object-cover" />
                            ) : (
                              u.name?.[0]?.toUpperCase() || "U"
                            )}
                          </div>
                          <div className="flex flex-col text-left">
                            <h5 className="font-extrabold text-foreground leading-snug">{u.name || "Anonymous User"}</h5>
                            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">{u.id}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                          u.role === 'ADMIN' 
                            ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                            : u.role === 'AGENT'
                            ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-accent border-border text-muted-foreground'
                        }`}>
                          {u.role}
                        </span>
                      </div>

                      {/* Contact details */}
                      <div className="flex flex-col text-left gap-1 border-t border-border pt-4 mt-2 mb-6">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-semibold">Email:</span>
                          <span className="text-foreground font-medium truncate max-w-[180px]">{u.email}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-semibold">Phone:</span>
                          <span className="text-foreground font-medium">{u.phone || "None added"}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-semibold">Properties:</span>
                          <span className="text-primary font-extrabold">{u._count.properties} Listing(s)</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions and role switcher */}
                    <div className="flex gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value as "USER" | "AGENT" | "ADMIN")}
                        className="text-xs font-semibold px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none flex-grow"
                      >
                        <option value="USER">USER ROLE</option>
                        <option value="AGENT">AGENT ROLE</option>
                        <option value="ADMIN">ADMIN ROLE</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={actioningId === u.id}
                        className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all shadow-sm"
                        title="Delete User permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ──────── TAB: CATEGORIES ──────── */}
        {activeTab === "categories" && (
          <div className="bg-card border border-border rounded-2xl shadow-md p-6 sm:p-8 flex flex-col gap-6 text-left animate-in fade-in duration-300">
            <div>
              <h3 className="font-extrabold text-xl text-foreground">Category Directory Settings</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Customize titles, description subtexts, and background cover images for the 4 permanent system-defined categories.
              </p>
            </div>

            <div className="h-px bg-border/60 w-full" />

            {loadingCategories ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-accent/50">
                  <SlidersHorizontal className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground">No categories found</p>
                  <p className="text-sm text-muted-foreground mt-1">Categories may not be seeded yet. Run <code className="bg-accent px-1.5 py-0.5 rounded text-xs">npx tsx prisma/seed.ts</code> and click Reload.</p>
                </div>
                <button
                  onClick={fetchCategories}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow transition-all"
                >
                  <RefreshCw className="h-4 w-4" /> Retry Loading
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat) => (
                  <div key={cat.id} className="border border-border rounded-2xl overflow-hidden shadow bg-card flex flex-col group hover:border-primary/20 transition-all duration-300">
                    <div className="h-40 bg-zinc-800 relative bg-cover bg-center" style={{ backgroundImage: `url('${cat.image}')` }}>
                      <div className="absolute inset-0 bg-black/60" />
                      <div className="absolute inset-0 p-5 flex flex-col justify-end text-white text-left">
                        <span className="text-[10px] uppercase font-black tracking-widest text-primary-foreground bg-primary px-2.5 py-0.5 rounded-lg w-fit mb-1">
                          {cat.name}
                        </span>
                        <h4 className="font-extrabold text-lg sm:text-xl truncate text-white">{cat.title}</h4>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between text-left gap-4">
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {cat.description}
                      </p>
                      <button
                        onClick={() => handleEditCategory(cat)}
                        className="w-full py-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold text-xs rounded-xl border border-primary/20 transition-all duration-300 shadow-sm"
                      >
                        Edit Category Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inline edit overlay modal */}
            {editingCategory && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
                >
                  <form onSubmit={handleSaveCategory}>
                    <div className="p-6 sm:p-8 flex flex-col gap-5 text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-extrabold text-foreground">
                          Modify {editingCategory.name.charAt(0) + editingCategory.name.slice(1).toLowerCase()} Category
                        </h3>
                        <button 
                          type="button" 
                          onClick={() => setEditingCategory(null)}
                          className="p-1.5 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="h-px bg-border/60 w-full" />

                      {/* Title */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Hero Callout Title
                        </label>
                        <input
                          type="text"
                          required
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                        />
                      </div>

                      {/* Description */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Search Description
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                        />
                      </div>

                      {/* Cover Image URL */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Cover Image URL
                        </label>
                        <input
                          type="text"
                          required
                          value={editImage}
                          onChange={(e) => setEditImage(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="bg-accent/40 border-t border-border px-6 py-4 flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="h-10 px-4 rounded-xl border border-border hover:bg-accent text-sm font-semibold text-foreground transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingCategory}
                        className="h-10 px-5 bg-primary text-primary-foreground font-bold hover:bg-primary/95 rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5"
                      >
                        {savingCategory ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          "Save Settings"
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
