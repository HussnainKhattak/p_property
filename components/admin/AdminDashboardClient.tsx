"use client";

import { useState, useEffect } from "react";
import { 
  Users, Building2, Eye, Trash2, CheckCircle2, XCircle, Search, 
  ShieldAlert, RefreshCw, Layers, Sparkles, ShieldCheck
} from "lucide-react";
import { formatPKR } from "@/components/property/PropertyCard";

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

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "users">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Search and Loading states
  const [userQuery, setUserQuery] = useState("");
  const [propertyQuery, setPropertyQuery] = useState("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Fetch Stats (Overview)
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
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
      }
    } catch (err) {
      console.error("Error fetching users:", err);
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
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoadingProperties(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchProperties();
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  // Delete Property listing
  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm("Are you sure you want to permanently delete this listing?")) return;
    setActioningId(propertyId);
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
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
      } else {
        alert(data.error || "Failed to update role");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account? This deletes all their listings too.")) return;
    setActioningId(userId);
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
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-8 text-left">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 mb-2">
            <ShieldAlert className="h-3.5 w-3.5" />
            Admin Operations Panel
          </span>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Control Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage system-wide properties, user authorizations, and platform statistics
          </p>
        </div>
        
        <button 
          onClick={() => { fetchStats(); fetchUsers(); fetchProperties(); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent text-foreground font-semibold hover:bg-accent/80 rounded-xl text-xs transition-colors self-start sm:self-center"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 mb-8 overflow-x-auto pb-px">
        {[
          { id: "overview", label: "Overview", icon: Layers },
          { id: "properties", label: "Properties", icon: Building2 },
          { id: "users", label: "Users", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "overview" | "properties" | "users")}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      <div>
        
        {/* ──────── TAB: OVERVIEW ──────── */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Users */}
              <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="text-left">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Users</p>
                  <h3 className="text-3xl font-black text-foreground mt-1">
                    {loadingStats ? "..." : stats?.totalUsers ?? 0}
                  </h3>
                </div>
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              {/* Total Properties */}
              <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="text-left">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Properties</p>
                  <h3 className="text-3xl font-black text-foreground mt-1">
                    {loadingStats ? "..." : stats?.totalProperties ?? 0}
                  </h3>
                </div>
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>

              {/* System Health */}
              <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="text-left">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">System Role</p>
                  <h3 className="text-xl font-bold text-primary mt-2 flex items-center gap-1.5">
                    <ShieldCheck className="h-5 w-5" /> Super Admin
                  </h3>
                </div>
                <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Recent Uploads Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-border/60 text-left">
                <h4 className="font-bold text-base text-foreground">Recent Listings</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Moderation list of properties recently uploaded</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-accent/40 text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Area</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Moderation</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingStats ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground animate-pulse">
                          Loading recent listings...
                        </td>
                      </tr>
                    ) : stats?.recentProperties.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          No recent uploads found.
                        </td>
                      </tr>
                    ) : (
                      stats?.recentProperties.map((p) => (
                        <tr key={p.id} className="hover:bg-accent/10 transition-colors">
                          <td className="px-6 py-4 font-bold text-foreground">
                            <div className="flex flex-col">
                              <span>{p.title}</span>
                              <span className="text-[10px] text-muted-foreground font-normal">Owner: {p.owner.name} ({p.owner.email})</span>
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
                                className={`p-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                                  p.isApproved
                                    ? "border-red-500/30 text-red-500 hover:bg-red-500/10"
                                    : "border-green-500/30 text-green-500 hover:bg-green-500/10"
                                }`}
                              >
                                {p.isApproved ? "Reject" : "Approve"}
                              </button>
                              <button
                                onClick={() => handleDeleteProperty(p.id)}
                                disabled={actioningId === p.id}
                                className="p-1.5 rounded-xl border border-border hover:border-red-500 hover:text-red-500 text-muted-foreground transition-all duration-200"
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
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Search filter bar */}
            <form onSubmit={handlePropertySearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search listings by title, description or area..."
                  value={propertyQuery}
                  onChange={(e) => setPropertyQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
              <button type="submit" className="h-11 px-5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 rounded-xl text-xs transition-all shadow-md">
                Search
              </button>
            </form>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-accent/40 text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Area</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Approval</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingProperties ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground animate-pulse">
                          Loading property directory...
                        </td>
                      </tr>
                    ) : properties.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          No listings found matching your search.
                        </td>
                      </tr>
                    ) : (
                      properties.map((p) => (
                        <tr key={p.id} className="hover:bg-accent/10 transition-colors">
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
                                className={`p-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                                  p.isApproved
                                    ? "border-red-500/30 text-red-500 hover:bg-red-500/10"
                                    : "border-green-500/30 text-green-500 hover:bg-green-500/10"
                                }`}
                              >
                                {p.isApproved ? "Reject" : "Approve"}
                              </button>
                              <a
                                href={`/properties/${p.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => handleDeleteProperty(p.id)}
                                disabled={actioningId === p.id}
                                className="p-2 rounded-xl border border-border hover:border-red-500 hover:text-red-500 text-muted-foreground transition-all"
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
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Search filter bar */}
            <form onSubmit={handleUserSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search users by name, email or phone number..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
              <button type="submit" className="h-11 px-5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 rounded-xl text-xs transition-all shadow-md">
                Search
              </button>
            </form>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-accent/40 text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Role System</th>
                      <th className="px-6 py-4">Listings</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground animate-pulse">
                          Loading users index...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          No users found matching your query.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-accent/10 transition-colors">
                          <td className="px-6 py-4 font-bold text-foreground">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0">
                                {u.profileImage || u.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={u.profileImage || u.image || ""} alt={u.name || "User"} className="h-full w-full object-cover" />
                                ) : (
                                  u.name?.[0]?.toUpperCase() || "U"
                                )}
                              </div>
                              <div className="flex flex-col text-left">
                                <span>{u.name || "Anonymous"}</span>
                                <span className="text-[10px] text-muted-foreground font-normal">ID: {u.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col text-left text-xs">
                              <span className="text-foreground font-semibold">{u.email}</span>
                              <span className="text-muted-foreground">{u.phone || "No phone added"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value as "USER" | "AGENT" | "ADMIN")}
                              className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none"
                            >
                              <option value="USER">USER</option>
                              <option value="AGENT">AGENT</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground font-bold">
                            {u._count.properties} Listing{u._count.properties !== 1 ? "s" : ""}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={actioningId === u.id}
                              className="p-2 rounded-xl border border-border hover:border-red-500 hover:text-red-500 text-muted-foreground transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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

      </div>
    </div>
  );
}
