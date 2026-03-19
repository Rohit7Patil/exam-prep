"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

export default function BlogShareButton({ title, url }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url || window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url || window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Error copying to clipboard:", err);
      }
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="ml-auto inline-flex items-center gap-1.5 hover:text-primary transition-colors text-muted-foreground font-medium"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
