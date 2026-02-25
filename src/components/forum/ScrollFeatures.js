"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ChevronDown } from "lucide-react";

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/80 text-foreground shadow-lg backdrop-blur-sm transition hover:bg-muted active:scale-95"
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

export function ScrollIndicator({ hasMore }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isNearBottom = 
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200;
      setShow(!isNearBottom && hasMore);
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-bounce">
      <div className="flex items-center gap-1 rounded-full border border-border/40 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
        <span>More below</span>
        <ChevronDown className="h-3 w-3" />
      </div>
    </div>
  );
}
