"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import ThreadRow from "@/components/forum/ThreadRow";
import TagSidebar from "@/components/forum/TagSidebar";
import ForumSearch from "@/components/forum/ForumSearch";
import CreateThreadDialog from "@/components/forum/CreateThreadDialog";
import InfiniteScroll from "@/components/forum/InfiniteScroll";
import { BackToTop, ScrollIndicator } from "@/components/forum/ScrollFeatures";

export default function ForumPageClient({
  initialThreads,
  tags,
  activeTag: initialActiveTag,
  initialSearch,
}) {
  const [activeTag, setActiveTag] = useState(initialActiveTag);
  const [query, setQuery] = useState(initialSearch);
  const [threads, setThreads] = useState(initialThreads);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialThreads.length >= 20);
  const [loading, setLoading] = useState(false);

  // Fetch threads helper
  const fetchThreads = useCallback(async (pageNum, currentTag, currentQuery, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 20,
      });
      if (currentTag) params.append("tag", currentTag);
      if (currentQuery) params.append("search", currentQuery);

      const res = await fetch(`/api/threads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const newThreads = data.threads.map(t => ({
          ...t,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          tags: t.tags.map(tt => tt.slug) // Map tags to match initialThreads shape
        }));
        
        setThreads(prev => append ? [...prev, ...newThreads] : newThreads);
        setHasMore(newThreads.length === 20);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle filter changes
  useEffect(() => {
    // Skip initial fetch since we have initialThreads
    if (activeTag === initialActiveTag && query === initialSearch) return;

    const timer = setTimeout(() => {
      fetchThreads(1, activeTag, query);
    }, 400); // Debounce search

    return () => clearTimeout(timer);
  }, [activeTag, query, fetchThreads, initialActiveTag, initialSearch]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchThreads(page + 1, activeTag, query, true);
    }
  };

  const filteredThreads = useMemo(() => {
    return initialThreads.filter((thread) => {
      // tag filter (client-side for instant UX)
      if (activeTag && !thread.tags.includes(activeTag)) {
        return false;
      }

      // search filter
      if (!query) return true;

      const q = query.toLowerCase();

      return (
        thread.title.toLowerCase().includes(q) ||
        thread.content.toLowerCase().includes(q) ||
        thread.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [activeTag, query, initialThreads]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header row */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Forum</h1>
          <p className="text-muted-foreground">
            All discussions across ExamPrep India
          </p>
        </div>

        {/* Create Thread */}
        <CreateThreadDialog tags={tags} />
      </div>

      {/* Search bar */}
      <div className="mb-6 flex justify-center px-1">
        <ForumSearch value={query} onChange={setQuery} />
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-6">
        <TagSidebar tags={tags} activeTag={activeTag} onSelect={setActiveTag} />

        <div className="flex-1">
          <div className="space-y-4">
            {threads.length > 0 ? (
              threads.map((thread) => (
                <ThreadRow key={thread.id} thread={thread} />
              ))
            ) : (
              !loading && <p className="text-sm text-muted-foreground">No threads found.</p>
            )}
          </div>

          {/* Infinite Scroll trigger */}
          <InfiniteScroll 
            onLoadMore={loadMore} 
            hasMore={hasMore} 
            isLoading={loading} 
          />
        </div>
      </div>

      <BackToTop />
      <ScrollIndicator hasMore={hasMore} />
    </div>
  );
}
