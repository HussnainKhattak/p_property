"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropertySearchFilters, {
  SearchFilters,
  DEFAULT_FILTERS,
} from "./PropertySearchFilters";
import PropertySearchResults from "./PropertySearchResults";
import { Property } from "./PropertyCard";
import { normalizePropertyType } from "@/lib/utils";

interface SearchData {
  properties: Property[];
  totalCount: number;
  totalPages: number;
  page: number;
}

interface PropertiesClientProps {
  initial: SearchData;
}

function paramsToFilters(sp: URLSearchParams): SearchFilters {
  const rawPropType = sp.get("propertyType") || "";
  const propType = normalizePropertyType(rawPropType) || rawPropType;
  return {
    query:        sp.get("query")        || "",
    city:         sp.get("city")         || "",
    area:         sp.get("area")         || "",
    minPrice:     sp.get("minPrice")     || "",
    maxPrice:     sp.get("maxPrice")     || "",
    minMarla:     sp.get("minMarla")     || "",
    maxMarla:     sp.get("maxMarla")     || "",
    propertyType: propType,
    subcategory:  sp.get("subcategory")  || "",
    listingType:  sp.get("listingType")  || "",
    bedrooms:     sp.get("bedrooms")     || "",
    bathrooms:    sp.get("bathrooms")    || "",
    sortBy:       sp.get("sortBy")       || "newest",
  };
}

function filtersToQuery(filters: SearchFilters, page: number): string {
  const p = new URLSearchParams();
  (Object.entries(filters) as [keyof SearchFilters, string][]).forEach(
    ([k, v]) => { if (v) p.set(k, v); }
  );
  if (page > 1) p.set("page", String(page));
  return p.toString();
}

export default function PropertiesClient({ initial }: PropertiesClientProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters]         = useState<SearchFilters>(() => paramsToFilters(searchParams));
  // Pending filters — only applied when user taps "Apply Filters" on mobile
  const [pendingFilters, setPendingFilters] = useState<SearchFilters>(() => paramsToFilters(searchParams));
  const [currentPage, setCurrentPage] = useState(() => parseInt(searchParams.get("page") || "1"));
  const [data, setData]               = useState<SearchData>(initial);
  const [isLoading, setIsLoading]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(async (f: SearchFilters, page: number) => {
    setIsLoading(true);
    try {
      const qs  = filtersToQuery(f, page);
      const res = await fetch(`/api/properties/search?${qs}`);
      if (!res.ok) throw new Error("Search failed");
      const json: SearchData = await res.json();
      setData(json);
      router.replace(`${pathname}?${qs}`, { scroll: false });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  // Desktop: debounce live filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(newFilters, 1);
    }, 350);
  }, [fetchResults]);

  // Mobile: apply pending filters and close drawer
  const applyMobileFilters = useCallback(() => {
    setFilters(pendingFilters);
    setCurrentPage(1);
    fetchResults(pendingFilters, 1);
    setMobileOpen(false);
  }, [pendingFilters, fetchResults]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchResults(filters, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters, fetchResults]);

  // Close drawer on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  // Sync pending filters with active filters when drawer opens
  useEffect(() => {
    if (mobileOpen) setPendingFilters(filters);
  }, [mobileOpen, filters]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== "sortBy" && v !== ""
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Browse Properties
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search across DHA, Hayatabad, Regi Model Town and all of Peshawar
          </p>
        </div>

        {/* ── Mobile filter trigger button (hidden on lg+) ── */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-accent transition-colors self-start sm:self-auto"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="h-5 min-w-[20px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8 items-start">
        {/* ───── Desktop Sidebar (unchanged) ───── */}
        <aside className="hidden lg:block w-72 flex-shrink-0 bg-card border border-border rounded-2xl p-6 sticky top-24">
          <PropertySearchFilters
            filters={filters}
            onChange={handleFiltersChange}
            totalCount={data.totalCount}
            isLoading={isLoading}
          />
        </aside>

        {/* ───── Results ───── */}
        <div className="flex-1 min-w-0">
          <PropertySearchResults
            properties={data.properties}
            totalCount={data.totalCount}
            totalPages={data.totalPages}
            page={currentPage}
            isLoading={isLoading}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          Mobile Bottom Drawer (hidden on lg+)
          Backdrop + sheet rendered via AnimatePresence so
          they animate in/out smoothly.
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* ── Backdrop ── */}
            <motion.div
              key="filter-backdrop"
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />

            {/* ── Bottom Sheet ── */}
            <motion.div
              key="filter-drawer"
              className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col bg-background rounded-t-2xl border-t border-border shadow-2xl lg:hidden"
              style={{ maxHeight: "82vh" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              {/* Sticky header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">Search Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary/15 text-primary text-[10px] font-black flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl hover:bg-accent transition-colors"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable filter content */}
              <div className="overflow-y-auto flex-1 px-5 py-4">
                <PropertySearchFilters
                  filters={pendingFilters}
                  onChange={setPendingFilters}
                  totalCount={data.totalCount}
                  isLoading={isLoading}
                />
              </div>

              {/* Sticky footer — Apply button */}
              <div className="flex gap-3 px-5 py-4 border-t border-border flex-shrink-0 bg-background">
                <button
                  onClick={() => {
                    setPendingFilters(DEFAULT_FILTERS);
                  }}
                  className="flex-1 h-11 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:bg-accent transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={applyMobileFilters}
                  className="flex-[2] h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  {isLoading ? "Searching…" : `Show ${data.totalCount.toLocaleString()} Properties`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
