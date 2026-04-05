"use client";

import Link from "next/link";
import { Heart, MessageCircle, Eye, Clock, User } from "lucide-react";

function estimateReadingTime(content) {
  const words = content?.split(/\s+/).length || 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export default function StoryCard({ story }) {
  const categoryColor = story.category?.color || "#6366f1";

  return (
    <Link
      href={`/stories/${story.slug}`}
      id={`story-card-${story.id}`}
      className="group relative flex flex-col bg-card border border-border/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 min-h-[160px]"
    >
      {/* Gradient accent top */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}88)`,
        }}
      />

      <div className="p-6 sm:p-7 flex-1 flex flex-col min-w-0">
        {/* Category badge + reading time */}
        <div className="flex items-start justify-between gap-2 mb-3">
          {story.category ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium max-w-full min-w-0"
              style={{
                backgroundColor: `${categoryColor}18`,
                color: categoryColor,
                border: `1px solid ${categoryColor}30`,
              }}
            >
              <span className="shrink-0">{story.category.emoji}</span>
              <span className="truncate">{story.category.label}</span>
            </span>
          ) : (
             <div />
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 whitespace-nowrap mt-0.5">
            <Clock className="h-3 w-3" />
            {estimateReadingTime(story.content)}
          </span>
        </div>

        {/* Title */}
        <div className="flex-1">
          <h3 className="text-lg font-bold leading-snug mb-4 group-hover:text-primary transition-colors line-clamp-3">
            {story.title}
          </h3>
        </div>

        {/* Author + stats footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {story.author?.avatarUrl ? (
              <img
                src={story.author.avatarUrl}
                alt={story.author.username || "User"}
                className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-border/40"
              />
            ) : (
              <div className="h-6 w-6 shrink-0 rounded-full bg-muted flex items-center justify-center">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            <span className="text-xs font-medium text-muted-foreground truncate">
              {story.author?.username || "Anonymous"}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-muted-foreground shrink-0">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {story.likesCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {story.commentsCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {story.viewsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Featured badge */}
      {story.featured && (
        <div className="absolute top-3 right-3 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Featured
        </div>
      )}
    </Link>
  );
}
