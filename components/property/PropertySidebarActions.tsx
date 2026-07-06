"use client";

import { useState } from "react";
import { Phone, MessageCircle, Share2, Check } from "lucide-react";

interface PropertySidebarActionsProps {
  ownerPhone: string | null;
  propertyTitle: string;
}

export default function PropertySidebarActions({
  ownerPhone,
  propertyTitle,
}: PropertySidebarActionsProps) {
  const [showPhone, setShowPhone] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle,
          text: `Check out this listing on Peshawar Property Hub: ${propertyTitle}`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard error:", err);
      }
    }
  };

  // Build clean Pakistani phone number format for WhatsApp link
  // e.g. 0300-1234567 -> 923001234567
  const getWhatsAppLink = () => {
    if (!ownerPhone) return "";
    const cleanNumber = ownerPhone.replace(/[^0-9]/g, "");
    // If it starts with 0, replace with country code 92
    const formatted = cleanNumber.startsWith("0") 
      ? "92" + cleanNumber.substring(1) 
      : cleanNumber.startsWith("92") 
      ? cleanNumber 
      : "92" + cleanNumber;
      
    const message = encodeURIComponent(
      `Assalam-o-Alaikum, I am interested in your property listing: "${propertyTitle}" on Peshawar Property Hub. Is it still available?`
    );
    return `https://wa.me/${formatted}?text=${message}`;
  };

  const whatsAppLink = getWhatsAppLink();

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Contact Seller Button */}
      {ownerPhone ? (
        <button
          onClick={() => setShowPhone(!showPhone)}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
        >
          <Phone className="h-4.5 w-4.5" />
          <span>{showPhone ? ownerPhone : "Contact Seller"}</span>
        </button>
      ) : (
        <button
          disabled
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-muted text-muted-foreground font-bold cursor-not-allowed"
        >
          <Phone className="h-4.5 w-4.5" />
          <span>No Contact Provided</span>
        </button>
      )}

      {/* WhatsApp Button */}
      {ownerPhone ? (
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20 hover:border-emerald-600 transition-all duration-300"
        >
          <MessageCircle className="h-4.5 w-4.5" />
          <span>Chat on WhatsApp</span>
        </a>
      ) : null}

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-all duration-300"
      >
        {copied ? (
          <>
            <Check className="h-4.5 w-4.5 text-primary" />
            <span className="text-primary font-semibold">Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="h-4.5 w-4.5" />
            <span>Share Listing</span>
          </>
        )}
      </button>

      {/* Small Legal text */}
      <p className="text-[10px] text-muted-foreground text-center mt-2 leading-relaxed">
        Verify land credentials and location independently. Do not send advanced tokens/cash deposits before viewing.
      </p>
    </div>
  );
}
