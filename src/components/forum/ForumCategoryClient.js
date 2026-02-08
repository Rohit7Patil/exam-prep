"use client";

import ThreadCard from "@/components/ThreadCard";
import CreateThreadDialog from "./CreateThreadDialog";

const THREADS = [
  {
    slug: "thread-1",
    title: "How to structure GS answer writing?",
    author: "Aspirant_2025",
    replies: 12,
    lastActive: "2 hours ago",
  },
  {
    slug: "thread-2",
    title: "Best optional subject for beginners?",
    author: "NewbieUPSC",
    replies: 8,
    lastActive: "5 hours ago",
  },
];

export default function ForumCategoryClient({ category, cat }) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            {cat.name} – {cat.description}
          </h1>
          <p className="text-muted-foreground">
            Threads and discussions related to {cat.name}.
          </p>
        </div>

        <CreateThreadDialog />
      </div>

      {/* Thread List */}
      <div className="space-y-4">
        {THREADS.map((thread) => (
          <ThreadCard key={thread.slug} category={category} {...thread} />
        ))}
      </div>
    </div>
  );
}
