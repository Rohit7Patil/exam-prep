"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { THREADS } from "@/data/threads";
import VoteButtons from "@/components/forum/VoteButtons";
import ReplyList from "@/components/forum/ReplyList";
import ReadMore from "@/components/common/ReadMore";
import { Eye, MessageSquare, Pin, Tag } from "lucide-react";

export default function ThreadPage({ params }) {
  // ✅ unwrap params correctly
  const { thread } = use(params);

  const threadData = THREADS.find((t) => t.id === thread);
  if (!threadData) notFound();

  const [sort, setSort] = useState("top");

  const sortedReplies = [...(threadData.replies || [])].sort((a, b) => {
    // pinned always first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    if (sort === "new") {
      return b.createdAt - a.createdAt;
    }
    return (b.votes ?? 0) - (a.votes ?? 0);
  });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-4 flex gap-4">
        <VoteButtons votes={threadData.votes ?? 0} />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            {threadData.pinned && <Pin className="h-4 w-4 text-primary" />}
            <h1 className="text-2xl font-bold">{threadData.title}</h1>
          </div>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-2">
            {threadData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Meta */}
          <div className="mt-3 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {threadData.repliesCount} replies
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {threadData.viewsCount} views
            </span>
            <span>Last active {threadData.lastActive}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-line border-b pb-6">
        <ReadMore text={threadData.content} maxChars={600} />
      </article>

      {/* Replies */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Replies</h2>

          {/* Sort */}
          <div className="flex gap-1 rounded-md border p-1 text-sm">
            <button
              onClick={() => setSort("top")}
              className={`rounded px-3 py-1 ${
                sort === "top"
                  ? "bg-muted font-medium"
                  : "text-muted-foreground"
              }`}
            >
              Top
            </button>
            <button
              onClick={() => setSort("new")}
              className={`rounded px-3 py-1 ${
                sort === "new"
                  ? "bg-muted font-medium"
                  : "text-muted-foreground"
              }`}
            >
              New
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-lg border p-4">
          <SignedIn>
            <textarea
              className="w-full rounded-md border bg-background p-3 text-sm"
              rows={4}
              placeholder="Write your reply..."
            />
            <div className="mt-2 flex justify-end">
              <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
                Post Reply
              </button>
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full rounded-md border px-4 py-3 text-sm text-muted-foreground hover:bg-muted">
                Sign in to reply
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        {sortedReplies.length > 0 ? (
          <ReplyList replies={sortedReplies} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No replies yet. Be the first to reply.
          </p>
        )}
      </section>
    </div>
  );
}
