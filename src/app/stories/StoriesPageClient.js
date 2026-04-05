"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import StoryCard from "@/components/stories/StoryCard";
import CategoryFilter from "@/components/stories/CategoryFilter";
import CreateStoryDialog from "@/components/stories/CreateStoryDialog";
import { Search, TrendingUp, Clock, Sparkles, BookHeart } from "lucide-react";

export default function StoriesPageClient({
  initialStories,
  categories,
  activeCategory: initialActiveCategory,
  initialSearch,
  initialSort,
}) {
  const [stories, setStories] = useState(initialStories);
  const [activeCategory, setActiveCategory] = useState(initialActiveCategory);
  const [query, setQuery] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialStories.length >= 12);
  const [loading, setLoading] = useState(false);

  const fetchStories = useCallback(
    async (pageNum, cat, search, sortBy, append = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pageNum,
          limit: 12,
          sort: sortBy,
        });
        if (cat) params.append("category", cat);
        if (search) params.append("search", search);

        const res = await fetch(`/api/stories?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setStories((prev) =>
            append ? [...prev, ...data.stories] : data.stories
          );
          setHasMore(data.stories.length === 12);
          setPage(pageNum);
        }
      } catch (err) {
        console.error("Failed to fetch stories:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const isFirstRender = useRef(true);

  // Handle filter changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchStories(1, activeCategory, query, sort);
    }, 400);

    return () => clearTimeout(timer);
  }, [
    activeCategory,
    query,
    sort,
    fetchStories,
    initialActiveCategory,
    initialSearch,
    initialSort,
  ]);

  function loadMore() {
    if (!loading && hasMore) {
      fetchStories(page + 1, activeCategory, query, sort, true);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero section */}
      <div className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6">
            <BookHeart className="h-4 w-4" />
            Community Stories
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
            Aspirants Stories
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
            Real stories from real aspirants. Learn from their journeys,
            strategies that worked, and challenges they overcame on the path to success.
          </p>

          <CreateStoryDialog />
        </div>
      </div>

      {/* Filters bar */}
      <div className="sticky top-14 sm:top-16 z-30 border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-4 py-3 space-y-3">
          {/* Category pills */}
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          {/* Sort + Search row */}
          <div className="flex items-center justify-between gap-3">
            {/* Sort toggle */}
            <div className="flex rounded-lg border border-border/40 overflow-hidden text-sm">
              <button
                onClick={() => setSort("latest")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-all ${
                  sort === "latest"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                Latest
              </button>
              <button
                onClick={() => setSort("popular")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-all ${
                  sort === "popular"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Popular
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search stories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8 w-44 sm:w-56 rounded-lg border border-border/40 bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stories grid */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {stories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="rounded-full border border-border/40 bg-muted/30 px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    "Load More Stories"
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 bg-muted/50 rounded-2xl flex items-center justify-center mb-5 rotate-3">
              <Sparkles className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-bold mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {query || activeCategory
                ? "No stories match your filters. Try adjusting your search or category."
                : "Be the first to share your exam preparation journey and inspire others!"}
            </p>
            {!query && !activeCategory && <CreateStoryDialog />}
          </div>
        )}
      </div>
    </main>
  );
}
