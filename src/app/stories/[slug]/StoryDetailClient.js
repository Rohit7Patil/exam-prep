"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Calendar,
  User,
  Clock,
  MessageCircle,
} from "lucide-react";
import LikeButton from "@/components/stories/LikeButton";
import ShareButton from "@/components/stories/ShareButton";
import StoryComments from "@/components/stories/StoryComments";
import StoryCard from "@/components/stories/StoryCard";

function estimateReadingTime(content) {
  const words = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
}

export default function StoryDetailClient({ story, hasLiked, relatedStories }) {
  const categoryColor = story.category?.color || "#6366f1";
  const readingTime = estimateReadingTime(story.content);

  return (
    <main className="min-h-screen bg-background">
      {/* Top gradient */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}88, transparent)`,
        }}
      />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* Back nav */}
        <Link
          href="/stories"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stories
        </Link>

        {/* Category badge */}
        {story.category && (
          <div className="mb-4">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
              style={{
                backgroundColor: `${categoryColor}18`,
                color: categoryColor,
                border: `1px solid ${categoryColor}30`,
              }}
            >
              <span>{story.category.emoji}</span>
              {story.category.label}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-5">
          {story.title}
        </h1>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/30">
          <div className="flex items-center gap-2.5">
            {story.author?.avatarUrl ? (
              <img
                src={story.author.avatarUrl}
                alt={story.author.username || "User"}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-border/40"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground text-sm">
                {story.author?.username || "Anonymous"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(story.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readingTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {story.viewsCount} views
            </span>
          </div>
        </div>

        {/* Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none mb-10 leading-relaxed text-foreground/90">
          {story.content.split("\n").map((paragraph, i) =>
            paragraph.trim() ? (
              <p key={i}>{paragraph}</p>
            ) : (
              <br key={i} />
            )
          )}
        </article>

        {/* Action bar */}
        <div className="flex items-center gap-3 flex-wrap py-6 border-y border-border/30 mb-10">
          <LikeButton
            storyId={story.id}
            initialLiked={hasLiked}
            initialCount={story.likesCount}
          />

          <a
            href="#comments-section"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-muted/50 text-muted-foreground border border-border/40 hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            <MessageCircle className="h-4 w-4" />
            {story.commentsCount} Comments
          </a>

          <div className="ml-auto">
            <ShareButton title={story.title} slug={story.slug} />
          </div>
        </div>

        {/* Comments */}
        <StoryComments storyId={story.id} />

        {/* Related stories */}
        {relatedStories.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border/30">
            <h3 className="text-lg font-bold mb-6">More Stories Like This</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {relatedStories.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
