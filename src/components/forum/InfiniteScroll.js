"use client";

import { useEffect, useRef } from "react";

export default function InfiniteScroll({ 
  onLoadMore, 
  hasMore, 
  isLoading, 
  className = "" 
}) {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div ref={observerTarget} className={`py-8 text-center ${className}`}>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading more...</span>
        </div>
      ) : hasMore ? (
        <div className="h-4 w-4" /> // Invisible trigger
      ) : null}
    </div>
  );
}
