"use client";

import ReadMore from "@/components/common/ReadMore";
import ReplyList from "@/components/forum/ReplyList";
import VoteButtons from "@/components/forum/VoteButtons";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Eye, MessageSquare, Pin, Tag } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import InfiniteScroll from "@/components/forum/InfiniteScroll";
import { BackToTop, ScrollIndicator } from "@/components/forum/ScrollFeatures";

export default function ThreadPageClient({ thread, userVotes = {}, currentUserId, isAdmin }) {
  const isAuthor = currentUserId && thread.author?.id === currentUserId;
  const [sort, setSort] = useState("top");
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replies, setReplies] = useState(thread.replies || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState((thread.replies || []).length >= 10);
  const [loading, setLoading] = useState(false);
  const [pinned, setPinned] = useState(thread.pinned || false);
  const [pinning, setPinning] = useState(false);

  const fetchReplies = useCallback(async (pageNum, currentSort, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/threads/${thread.id}/replies?page=${pageNum}&limit=10&sort=${currentSort}`);
      if (res.ok) {
        const data = await res.json();
        const sortByVotes = (arr) => [...(arr || [])].sort((a, b) => (b.votesCount ?? 0) - (a.votesCount ?? 0));
        const newReplies = data.replies.map(r => ({
          ...r,
          replies: sortByVotes(r.children).map(c => ({
            ...c,
            replies: sortByVotes(c.children)
          }))
        }));
        setReplies(prev => append ? [...prev, ...newReplies] : newReplies);
        setHasMore(newReplies.length === 10);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("Failed to fetch replies:", err);
    } finally {
      setLoading(false);
    }
  }, [thread.id]);

  // Handle sort changes
  useEffect(() => {
    // Skip initial fetch since we have initial replies
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
    if (sort === "new")
      return new Date(b.createdAt) - new Date(a.createdAt);
    return (b.votesCount ?? 0) - (a.votesCount ?? 0);
  });

  async function handlePostReply() {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/threads/${thread.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText }),
      });
      if (res.ok) {
        const newReply = await res.json();
        setReplies((prev) => [
          ...prev,
          { ...newReply, replies: [], votesCount: 0 },
        ]);
        setReplyText("");
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
            {pinned && (
              <Pin className="mt-1 h-4 w-4 shrink-0 text-primary" />
            )}
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
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
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
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold sm:text-lg">Replies</h2>

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
        {sortedReplies.length > 0 ? (
          <div className="space-y-4">
            <ReplyList replies={sortedReplies} userVotes={userVotes} />
            <InfiniteScroll 
              onLoadMore={loadMore} 
              hasMore={hasMore} 
              isLoading={loading} 
            />
          </div>
        ) : (
          !loading && (
            <p className="text-sm text-muted-foreground">
              No replies yet. Be the first to reply.
            </p>
          )
        )}
      </section>

      <BackToTop />
      <ScrollIndicator hasMore={hasMore} />
    </div>
  );
}
