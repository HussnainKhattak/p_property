"use client";

import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "./PropertyCard";
import { Property } from "./PropertyCard";

interface PropertySearchResultsProps {
  properties: Property[];
  totalCount: number;
  totalPages: number;
  page: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function PropertySearchResults({
  properties,
  totalCount,
  totalPages,
  page,
  isLoading,
  onPageChange,
}: PropertySearchResultsProps) {

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Searching properties…
        </p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-6">
        <div className="p-5 rounded-full bg-muted">
          <Building2 className="h-10 w-10 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-bold text-xl text-foreground">No Properties Found</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
            Try adjusting your search filters — widen the price range, change the area, or remove some criteria.
          </p>
        </div>
      </div>
    );
  }

  // Build visible page number list (e.g. [1,2,3,…,8,9,10])
  const pageNumbers: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== "…") {
      pageNumbers.push("…");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-bold text-foreground">{(page - 1) * 12 + 1}–{Math.min(page * 12, totalCount)}</span> of{" "}
          <span className="font-bold text-foreground">{totalCount.toLocaleString()}</span> properties
        </p>
        <span className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div
            key={property.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <PropertyCard property={property} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
          {/* Prev */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {pageNumbers.map((num, idx) =>
            num === "…" ? (
              <span key={`ellipsis-${idx}`} className="h-9 w-9 flex items-center justify-center text-muted-foreground text-sm">
                …
              </span>
            ) : (
              <button
                key={num}
                onClick={() => onPageChange(num)}
                className={`h-9 w-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 ${
                  page === num
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border border-border hover:bg-accent text-foreground"
                }`}
              >
                {num}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
