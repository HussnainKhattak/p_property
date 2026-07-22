"use client";

import { useCallback } from "react";
import {
  Search, X, SlidersHorizontal, Home, Building2, Warehouse, Briefcase, LayoutGrid,
} from "lucide-react";

export interface SearchFilters {
  query:        string;
  city:         string;
  area:         string;
  minPrice:     string;
  maxPrice:     string;
  minMarla:     string;
  maxMarla:     string;
  propertyType: string;
  subcategory:  string;
  listingType:  string;
  bedrooms:     string;
  bathrooms:    string;
  sortBy:       string;
}

export const DEFAULT_FILTERS: SearchFilters = {
  query: "", city: "", area: "", minPrice: "", maxPrice: "",
  minMarla: "", maxMarla: "", propertyType: "", subcategory: "", listingType: "",
  bedrooms: "", bathrooms: "", sortBy: "newest",
};

const AREAS = [
  "DHA Peshawar", "Hayatabad", "Regi Model Town", "Warsak Road",
  "University Town", "Dalazak Road", "Ring Road",
];

const PROPERTY_TYPES = [
  { value: "",            label: "All",        Icon: LayoutGrid  },
  { value: "APARTMENT",   label: "Apartment",  Icon: Building2   },
  { value: "HOUSE",       label: "House",      Icon: Home        },
  { value: "SHOP",        label: "Shop",       Icon: Warehouse   },
  { value: "PLOT",        label: "Plot",       Icon: LayoutGrid  },
];

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First"    },
  { value: "oldest",     label: "Oldest First"    },
  { value: "price_asc",  label: "Lowest Price"    },
  { value: "price_desc", label: "Highest Price"   },
];

interface PropertySearchFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  totalCount: number;
  isLoading: boolean;
}

export default function PropertySearchFilters({
  filters, onChange, totalCount, isLoading,
}: PropertySearchFiltersProps) {

  const set = useCallback(
    (key: keyof SearchFilters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onChange({ ...filters, [key]: e.target.value });
    },
    [filters, onChange]
  );

  const handlePropertyTypeChange = useCallback(
    (value: string) => {
      onChange({ ...filters, propertyType: value, subcategory: "" });
    },
    [filters, onChange]
  );

  const setDirect = useCallback(
    (key: keyof SearchFilters, value: string) => {
      onChange({ ...filters, [key]: value });
    },
    [filters, onChange]
  );

  const reset = () => onChange(DEFAULT_FILTERS);
  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => k !== "sortBy" && v !== ""
  );

  return (
    <aside className="flex flex-col gap-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
          <span className="font-bold text-sm text-foreground">Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Clear All
          </button>
        )}
      </div>

      {/* Keyword Search */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Search Title / Area
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={filters.query}
            onChange={set("query")}
            placeholder="e.g. House in Hayatabad..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
          {filters.query && (
            <button
              onClick={() => setDirect("query", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Listing Type toggle */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Listing Type
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-accent/50">
          {[["", "All"], ["SALE", "For Sale"], ["RENT", "For Rent"]].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setDirect("listingType", v)}
              className={`h-8 rounded-lg text-xs font-bold transition-all duration-200 ${
                filters.listingType === v
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Category
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {PROPERTY_TYPES.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => handlePropertyTypeChange(value)}
              className={`flex flex-col items-center justify-center gap-1 h-16 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                filters.propertyType === value
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      {filters.propertyType && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Subcategory
          </label>
          <select
            value={filters.subcategory}
            onChange={set("subcategory")}
            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-semibold"
          >
            <option value="">All Subcategories</option>
            {filters.propertyType === "PLOT" ? (
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
      )}

      {/* Area */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Area / Locality
        </label>
        <select
          value={filters.area}
          onChange={set("area")}
          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        >
          <option value="">All Areas</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Price Range (PKR)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={set("minPrice")}
            placeholder="Min price"
            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
          <input
            type="number"
            value={filters.maxPrice}
            onChange={set("maxPrice")}
            placeholder="Max price"
            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Marla Range */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Area Size (Marla)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="any"
            value={filters.minMarla}
            onChange={set("minMarla")}
            placeholder="Min"
            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
          <input
            type="number"
            step="any"
            value={filters.maxMarla}
            onChange={set("maxMarla")}
            placeholder="Max"
            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Min Bedrooms
        </label>
        <div className="flex gap-1.5">
          {["", "1", "2", "3", "4", "5+"].map((v) => (
            <button
              key={v}
              onClick={() => setDirect("bedrooms", v === "5+" ? "5" : v)}
              className={`flex-1 h-9 rounded-xl border text-xs font-bold transition-all duration-200 ${
                filters.bedrooms === (v === "5+" ? "5" : v)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {v || "Any"}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Min Bathrooms
        </label>
        <div className="flex gap-1.5">
          {["", "1", "2", "3", "4+"].map((v) => (
            <button
              key={v}
              onClick={() => setDirect("bathrooms", v === "4+" ? "4" : v)}
              className={`flex-1 h-9 rounded-xl border text-xs font-bold transition-all duration-200 ${
                filters.bathrooms === (v === "4+" ? "4" : v)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {v || "Any"}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={set("sortBy")}
          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <div className={`text-center py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
        isLoading ? "text-muted-foreground" : "text-primary bg-primary/10"
      }`}>
        {isLoading ? "Searching…" : `${totalCount.toLocaleString()} properties found`}
      </div>
    </aside>
  );
}
