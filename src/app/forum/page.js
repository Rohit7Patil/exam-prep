"use client";

import { useMemo, useState } from "react";
import { THREADS } from "@/data/threads";
import ThreadRow from "@/components/forum/ThreadRow";
import TagSidebar from "@/components/forum/TagSidebar";
import ForumSearch from "@/components/forum/ForumSearch";
import CreateThreadDialog from "@/components/forum/CreateThreadDialog";

export default function ForumPage() {
  const [activeTag, setActiveTag] = useState(null);
  const [query, setQuery] = useState("");

  const filteredThreads = useMemo(() => {
    return THREADS.filter((thread) => {
      // tag filter
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
  }, [activeTag, query]);

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
        <CreateThreadDialog />
      </div>

      {/* Search bar */}
      <div className="mb-6 flex justify-center px-1">
        <ForumSearch value={query} onChange={setQuery} />
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-6">
        <TagSidebar activeTag={activeTag} onSelect={setActiveTag} />

        <div className="flex-1 space-y-4">
          {filteredThreads.length > 0 ? (
            filteredThreads.map((thread) => (
              <ThreadRow key={thread.id} thread={thread} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No threads found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
