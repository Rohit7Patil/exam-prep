"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function LikeButton({ storyId, initialLiked, initialCount }) {
  const { isSignedIn } = useUser();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  async function toggleLike() {
    if (!isSignedIn) return;

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? c - 1 : c + 1));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    try {
      const res = await fetch(`/api/stories/${storyId}/like`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.likesCount);
      } else {
        // Revert
        setLiked(wasLiked);
        setCount((c) => (wasLiked ? c + 1 : c - 1));
      }
    } catch {
      setLiked(wasLiked);
      setCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  }

  return (
    <button
      onClick={toggleLike}
      disabled={!isSignedIn}
      className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
        liked
          ? "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20"
          : "bg-muted/50 text-muted-foreground border border-border/40 hover:bg-muted hover:text-foreground"
      } ${!isSignedIn ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={!isSignedIn ? "Sign in to like" : liked ? "Unlike" : "Like"}
    >
      <Heart
        className={`h-4 w-4 transition-all duration-300 ${
          liked ? "fill-red-500 text-red-500" : ""
        } ${animating ? "scale-125" : "scale-100"}`}
      />
      <span>{count}</span>
    </button>
  );
}
