"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import PropertySearchFilters, {
  SearchFilters,
} from "./PropertySearchFilters";
import PropertySearchResults from "./PropertySearchResults";
import { Property } from "./PropertyCard";

interface SearchData {
  properties: Property[];
  totalCount: number;
  totalPages: number;
  page: number;
}

interface PropertiesClientProps {
  initial: SearchData;
}

/** Parse URL search params into filter object */
function paramsToFilters(sp: URLSearchParams): SearchFilters {
  return {
    query:        sp.get("query")        || "",
    city:         sp.get("city")         || "",
    area:         sp.get("area")         || "",
    minPrice:     sp.get("minPrice")     || "",
    maxPrice:     sp.get("maxPrice")     || "",
    minMarla:     sp.get("minMarla")     || "",
    maxMarla:     sp.get("maxMarla")     || "",
    propertyType: sp.get("propertyType") || "",
    subcategory:  sp.get("subcategory")  || "",
    listingType:  sp.get("listingType")  || "",
    bedrooms:     sp.get("bedrooms")     || "",
    bathrooms:    sp.get("bathrooms")    || "",
    sortBy:       sp.get("sortBy")       || "newest",
  };
}

/** Convert filter object → URLSearchParams string */
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
  const [currentPage, setCurrentPage] = useState(() => parseInt(searchParams.get("page") || "1"));
  const [data, setData]               = useState<SearchData>(initial);
  const [isLoading, setIsLoading]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch results from the API
  const fetchResults = useCallback(async (f: SearchFilters, page: number) => {
    setIsLoading(true);
    try {
      const qs  = filtersToQuery(f, page);
      const res = await fetch(`/api/properties/search?${qs}`);
      if (!res.ok) throw new Error("Search failed");
      const json: SearchData = await res.json();
      setData(json);
      // Sync URL without full navigation
      router.replace(`${pathname}?${qs}`, { scroll: false });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  // Debounce filter changes by 350ms
  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(newFilters, 1);
    }, 350);
  }, [fetchResults]);

  // Immediate page change (no debounce needed)
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchResults(filters, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters, fetchResults]);

  // Cleanup debounce on unmount
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

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

        {/* Mobile filter toggle */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-accent transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filters
          {Object.entries(filters).some(([k, v]) => k !== "sortBy" && v !== "") && (
            <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8 items-start">
        {/* ───── Sidebar (Desktop) ───── */}
        <aside className="hidden lg:block w-72 flex-shrink-0 bg-card border border-border rounded-2xl p-6 sticky top-24">
          <PropertySearchFilters
            filters={filters}
            onChange={handleFiltersChange}
            totalCount={data.totalCount}
            isLoading={isLoading}
          />
        </aside>

        {/* ───── Mobile Drawer ───── */}
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer panel */}
            <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-full bg-background border-r border-border overflow-y-auto p-5 flex flex-col gap-5 lg:hidden animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between sticky top-0 bg-background pb-4 border-b border-border">
                <span className="font-bold text-foreground">Search Filters</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl hover:bg-accent transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <PropertySearchFilters
                filters={filters}
                onChange={(f) => { handleFiltersChange(f); setMobileOpen(false); }}
                totalCount={data.totalCount}
                isLoading={isLoading}
              />
            </div>
          </>
        )}

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
    </div>
  );
}
