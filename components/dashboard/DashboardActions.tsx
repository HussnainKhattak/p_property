"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { createPortal } from "react-dom";

interface DashboardActionsProps {
  propertyId: string;
  status: string;
  onStatusChange?: (propertyId: string, newStatus: string) => void;
  onDelete?: (propertyId: string) => void;
}

interface MenuCoords {
  top: number;
  right: number;
}

// ─── DEBUG LOGGER ──────────────────────────────────────────────────────────────
function dbg(step: string, data?: unknown) {
  console.log(`[DashboardActions] ${step}`, data ?? "");
}

export default function DashboardActions({
  propertyId,
  status,
  onStatusChange,
  onDelete,
}: DashboardActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<MenuCoords>({ top: 0, right: 0 });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Open menu: calculate fixed position from button rect so it escapes any overflow container
  const openMenu = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuCoords({
      top: rect.bottom + 6,                        // 6px gap below button
      right: window.innerWidth - rect.right,       // align right edge
    });
    setMenuOpen(true);
  }, []);

  // Close on outside click or scroll.
  // IMPORTANT: We check if the click target is OUTSIDE both the button and the
  // menu panel before closing. This prevents the document mousedown from firing
  // before the menu item's onClick handler runs (React 18 root-level event issue).
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideButton = buttonRef.current?.contains(target);
      const clickedInsideMenu   = menuRef.current?.contains(target);
      if (!clickedInsideButton && !clickedInsideMenu) {
        dbg("Menu closed (outside click)");
        setMenuOpen(false);
      }
    };
    const handleScroll = () => {
      dbg("Menu closed (scroll)");
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideMouseDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideMouseDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [menuOpen]);

  const handleStatusChange = async (newStatus: string) => {
    dbg("Button clicked: Mark as", newStatus);
    setIsUpdatingStatus(true);
    setMenuOpen(false);
    try {
      const url = `/api/properties/${propertyId}/status`;
      dbg("API called", url);
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      dbg("Response received", { status: res.status, ok: res.ok });

      if (res.ok) {
        const data = await res.json();
        dbg("DB updated — new status", data?.property?.status);
        onStatusChange?.(propertyId, newStatus);
        dbg("UI callback fired");
      } else {
        const data = await res.json();
        console.error("[DashboardActions] Status update failed:", data);
        alert(data.error || "Failed to update status.");
      }
    } catch (err) {
      console.error("[DashboardActions] Network error on status update:", err);
      alert("Network error. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    dbg("Button clicked: Delete confirmed for", propertyId);
    setIsDeleting(true);
    try {
      const url = `/api/properties/${propertyId}`;
      dbg("API called", url);
      const res = await fetch(url, {
        method: "DELETE",
      });
      dbg("Response received", { status: res.status, ok: res.ok });

      if (res.ok) {
        const data = await res.json();
        dbg("DB deleted — response", data);
        onDelete?.(propertyId);
        dbg("UI callback fired");
      } else {
        const data = await res.json();
        console.error("[DashboardActions] Delete failed:", data);
        alert(data.error || "Failed to delete property.");
      }
    } catch (err) {
      console.error("[DashboardActions] Network error on delete:", err);
      alert("Network error. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {/* 3-dot trigger button */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          menuOpen ? setMenuOpen(false) : openMenu();
        }}
        disabled={isUpdatingStatus}
        className="p-2 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-50"
        title="Property Actions"
        id={`property-actions-${propertyId}`}
      >
        {isUpdatingStatus ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreVertical className="h-4 w-4" />
        )}
      </button>

      {/* Floating dropdown — rendered into document.body portal so it escapes
          any overflow:hidden ancestor and sits above all other content.       */}
      {menuOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: menuCoords.top,
            right: menuCoords.right,
            zIndex: 9999,
          }}
          className={`
            w-52 bg-card border border-border rounded-xl
            shadow-2xl shadow-black/20 dark:shadow-black/50
            overflow-hidden
            origin-top
            animate-in fade-in zoom-in-95 slide-in-from-top-1
            duration-150
          `}
        >
          {/* Edit Property */}
          <button
            onClick={() => {
              dbg("Button clicked: Edit Property", propertyId);
              setMenuOpen(false);
              router.push(`/properties/edit/${propertyId}`);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors text-left"
          >
            <Edit2 className="h-4 w-4 text-primary flex-shrink-0" />
            Edit Property
          </button>

          <div className="h-px bg-border/60 mx-3" />

          {/* Mark as Available (shown when not already Available) */}
          {status !== "AVAILABLE" && (
            <button
              onClick={() => handleStatusChange("AVAILABLE")}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors text-left"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              Mark as Available
            </button>
          )}

          {/* Mark as Booked (shown when not already Booked) */}
          {status !== "BOOKED" && (
            <button
              onClick={() => handleStatusChange("BOOKED")}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors text-left"
            >
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              Mark as Booked
            </button>
          )}

          <div className="h-px bg-border/60 mx-3" />

          {/* Delete Property */}
          <button
            onClick={() => {
              dbg("Button clicked: Delete Property", propertyId);
              setMenuOpen(false);
              setShowConfirm(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors text-left"
          >
            <Trash2 className="h-4 w-4 flex-shrink-0" />
            Delete Property
          </button>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={() => setShowConfirm(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Delete Property?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              This will permanently remove the listing and all its associated data including bookings, reviews, and saved bookmarks. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
