"use client";

import ReadMore from "@/components/common/ReadMore";
import ReplyList from "@/components/forum/ReplyList";
import VoteButtons from "@/components/forum/VoteButtons";
import ReplyTypeSelector from "@/components/forum/ReplyTypeSelector";
import AuthorLink from "@/components/forum/AuthorLink";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Eye, MessageSquare, Pin, Tag } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import InfiniteScroll from "@/components/forum/InfiniteScroll";
import { BackToTop, ScrollIndicator } from "@/components/forum/ScrollFeatures";
import Link from "next/link";

export default function ThreadPageClient({
  thread,
  userVotes = {},
  currentUserId,
  isAdmin,
}) {
  const isAuthor = currentUserId && thread.author?.id === currentUserId;
  const [sort, setSort] = useState("top");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'ANSWER' | 'DISCUSSION'
  const [replyText, setReplyText] = useState("");
  const [replyType, setReplyType] = useState("DISCUSSION");
  const [submitting, setSubmitting] = useState(false);
  const [replies, setReplies] = useState(thread.replies || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState((thread.replies || []).length >= 10);
  const [loading, setLoading] = useState(false);
  const [pinned, setPinned] = useState(thread.pinned || false);
  const [pinning, setPinning] = useState(false);

  const fetchReplies = useCallback(
    async (pageNum, currentSort, append = false) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/threads/${thread.id}/replies?page=${pageNum}&limit=10&sort=${currentSort}`,
        );
        if (res.ok) {
          const data = await res.json();
          const sortByVotes = (arr) =>
            [...(arr || [])].sort(
              (a, b) => (b.votesCount ?? 0) - (a.votesCount ?? 0),
            );
          const newReplies = data.replies.map((r) => ({
            ...r,
            replies: sortByVotes(r.children).map((c) => ({
              ...c,
              replies: sortByVotes(c.children),
            })),
          }));
          setReplies((prev) =>
            append ? [...prev, ...newReplies] : newReplies,
          );
          setHasMore(newReplies.length === 10);
          setPage(pageNum);
        }
      } catch (err) {
        console.error("Failed to fetch replies:", err);
      } finally {
        setLoading(false);
      }
    },
    [thread.id],
  );

  useEffect(() => {
    if (page === 1 && sort === "top") return;
    fetchReplies(1, sort);
  }, [sort, fetchReplies]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchReplies(page + 1, sort, true);
    }
  };

  async function handleTogglePin() {
    setPinning(true);
    const prev = pinned;
    setPinned(!prev);
    try {
      const res = await fetch(`/api/threads/${thread.id}/pin`, {
        method: "PATCH",
      });
      if (!res.ok) {
        setPinned(prev);
      } else {
        const data = await res.json();
        setPinned(data.pinned);
      }
    } catch {
      setPinned(prev);
    } finally {
      setPinning(false);
    }
  }

  const sortedReplies = [...replies].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (sort === "new") return new Date(b.createdAt) - new Date(a.createdAt);
    return (b.votesCount ?? 0) - (a.votesCount ?? 0);
  });

  async function handlePostReply() {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/threads/${thread.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText, replyType }),
      });
      if (res.ok) {
        const newReply = await res.json();
        setReplies((prev) => [
          ...prev,
          { ...newReply, replies: [], votesCount: 0 },
        ]);
        setReplyText("");
        setReplyType("DISCUSSION");
      }
    } catch (err) {
      console.error("Failed to post reply:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const threadUserVote = userVotes[`thread_${thread.id}`] || 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-4 grid grid-cols-[auto_1fr] gap-3 sm:gap-6">
        {/* Votes */}
        <div className="flex justify-center pt-1">
          <VoteButtons
            targetType="thread"
            targetId={thread.id}
            votes={thread.votesCount ?? 0}
            initialUserVote={threadUserVote}
            disabled={isAuthor}
          />
        </div>

        <div>
          <div className="flex items-start gap-2">
            {pinned && <Pin className="mt-1 h-4 w-4 shrink-0 text-primary" />}
            <h1 className="text-xl font-bold leading-snug sm:text-2xl">
              {thread.title}
            </h1>
            {isAdmin && (
              <button
                onClick={handleTogglePin}
                disabled={pinning}
                className={`ml-2 mt-1 shrink-0 rounded-md px-2 py-0.5 text-xs font-medium transition ${
                  pinned
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                } disabled:opacity-50`}
                title={pinned ? "Unpin thread" : "Pin thread"}
              >
                <Pin className="inline h-3 w-3 mr-1" />
                {pinned ? "Unpin" : "Pin"}
              </button>
            )}
          </div>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {thread.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-muted/50 border border-border/30 px-2 py-0.5 text-xs text-muted-foreground"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Meta */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              by <AuthorLink author={thread.author} size="sm" />
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {thread.repliesCount} replies
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {thread.viewsCount} views
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="prose prose-sm sm:prose-base prose-neutral dark:prose-invert max-w-none border-b border-border/40 pb-5">
        <ReadMore text={thread.content} maxChars={600} />
      </article>

      {/* Replies */}
      <section className="mt-6 sm:mt-8">
        {/* Header row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold sm:text-lg">Replies</h2>

          <div className="flex gap-2 flex-wrap">
            {/* Type filter */}
            <div className="flex gap-0.5 rounded-lg border border-border/40 p-0.5 text-xs">
              {[
                { key: "all", label: "All", count: sortedReplies.length },
                {
                  key: "ANSWER",
                  label: "✅ Answers",
                  count: sortedReplies.filter((r) => r.replyType === "ANSWER")
                    .length,
                },
                {
                  key: "DISCUSSION",
                  label: "💬 Discussions",
                  count: sortedReplies.filter(
                    (r) => r.replyType === "DISCUSSION" || !r.replyType,
                  ).length,
                },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(key)}
                  className={`rounded-md px-2.5 py-1 font-medium transition flex items-center gap-1 ${
                    typeFilter === key
                      ? key === "ANSWER"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : key === "DISCUSSION"
                          ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                          : "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                  <span
                    className={`rounded-full px-1.5 py-0 leading-4 text-[10px] font-bold ${
                      typeFilter === key ? "bg-current/10" : "bg-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sort toggle */}
            <div className="flex gap-1 rounded-md border border-border/40 p-1 text-xs sm:text-sm">
              <button
                onClick={() => setSort("top")}
                className={`rounded px-3 py-1 transition ${
                  sort === "top"
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Top
              </button>
              <button
                onClick={() => setSort("new")}
                className={`rounded px-3 py-1 transition ${
                  sort === "new"
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                New
              </button>
            </div>
          </div>
        </div>

        {/* Reply composer */}
        {isAuthor ? (
          <div className="mb-6 rounded-lg border border-border/40 bg-card p-3 sm:p-4">
            <p className="text-sm text-muted-foreground text-center py-2">
              You cannot reply to your own thread.
            </p>
          </div>
        ) : (
          <div className="mb-6 rounded-lg border border-border/40 bg-card p-3 sm:p-4">
            <SignedIn>
              <ReplyTypeSelector value={replyType} onChange={setReplyType} />
              <textarea
                className="w-full rounded-md border border-border/50 bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                rows={4}
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handlePostReply}
                  disabled={submitting || !replyText.trim()}
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:w-auto disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full rounded-md border border-border/50 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 transition">
                  Sign in to reply
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        )}

        {/* Replies list */}
        {(() => {
          const filtered =
            typeFilter === "all"
              ? sortedReplies
              : typeFilter === "DISCUSSION"
                ? sortedReplies.filter(
                    (r) => r.replyType === "DISCUSSION" || !r.replyType,
                  )
                : sortedReplies.filter((r) => r.replyType === typeFilter);

          if (filtered.length === 0 && !loading) {
            return (
              <div className="rounded-xl border border-border/30 bg-muted/20 py-10 text-center">
                <p className="text-2xl mb-2">
                  {typeFilter === "ANSWER"
                    ? "✅"
                    : typeFilter === "DISCUSSION"
                      ? "💬"
                      : "💭"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {typeFilter === "all"
                    ? "No replies yet. Be the first to reply."
                    : typeFilter === "ANSWER"
                      ? "No answers yet — post the first verified answer!"
                      : "No discussions yet."}
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              <ReplyList
                replies={filtered}
                userVotes={userVotes}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                threadAuthorId={thread.author?.id}
              />
              {typeFilter === "all" && (
                <InfiniteScroll
                  onLoadMore={loadMore}
                  hasMore={hasMore}
                  isLoading={loading}
                />
              )}
            </div>
          );
        })()}
      </section>

      <BackToTop />
      <ScrollIndicator hasMore={hasMore} />
    </div>
  );
}
