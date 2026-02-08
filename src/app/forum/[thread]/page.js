"use client";

import ReadMore from "@/components/common/ReadMore";
import ReplyList from "@/components/forum/ReplyList";
import VoteButtons from "@/components/forum/VoteButtons";
import { THREADS } from "@/data/threads";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Eye, MessageSquare, Pin, Tag } from "lucide-react";
import { notFound } from "next/navigation";
import { use, useState } from "react";

export default function ThreadPage({ params }) {
  const { thread } = use(params);
  const threadData = THREADS.find((t) => t.id === thread);
  if (!threadData) notFound();

  const [sort, setSort] = useState("top");

  const sortedReplies = [...(threadData.replies || [])].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (sort === "new") return b.createdAt - a.createdAt;
    return (b.votes ?? 0) - (a.votes ?? 0);
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-4 grid grid-cols-[auto_1fr] gap-3 sm:gap-6">
        {/* Votes */}
        <div className="flex justify-center pt-1">
          <VoteButtons votes={threadData.votes ?? 0} />
        </div>

        <div>
          <div className="flex items-start gap-2">
            {threadData.pinned && (
              <Pin className="mt-1 h-4 w-4 shrink-0 text-primary" />
            )}
            <h1 className="text-xl font-bold leading-snug sm:text-2xl">
              {threadData.title}
            </h1>
          </div>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1.5">
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
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
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
      <article className="prose prose-sm sm:prose-base prose-neutral dark:prose-invert max-w-none border-b pb-5">
        <ReadMore text={threadData.content} maxChars={600} />
      </article>

      {/* Replies */}
      <section className="mt-6 sm:mt-8">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold sm:text-lg">Replies</h2>

          <div className="flex gap-1 rounded-md border p-1 text-xs sm:text-sm">
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

        {/* Reply composer */}
        <div className="mb-6 rounded-lg border bg-card p-3 sm:p-4">
          <SignedIn>
            <textarea
              className="w-full rounded-md border bg-background p-3 text-sm"
              rows={4}
              placeholder="Write your reply..."
            />
            <div className="mt-2 flex justify-end">
              <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:w-auto">
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

        {/* Replies list */}
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
