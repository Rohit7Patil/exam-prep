"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ChevronDown, ChevronUp, MessageSquare, Pin, User } from "lucide-react";
import { useState } from "react";
import ReadMore from "../common/ReadMore";
import VoteButtons from "./VoteButtons";

export default function ReplyItem({ reply, depth = 0, userVotes = {} }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sort children by votes descending (most upvoted first)
  const sortedInitialChildren = [...(reply.replies || [])].sort(
    (a, b) => (b.votesCount ?? 0) - (a.votesCount ?? 0)
  );
  const [children, setChildren] = useState(sortedInitialChildren);

  // Start showing 1 (top-voted reply), collapsed = false means we show replies
  const [visibleCount, setVisibleCount] = useState(1);
  const [collapsed, setCollapsed] = useState(false);

  const userVote = userVotes[`reply_${reply.id}`] || 0;

  async function handlePostReply() {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/replies/${reply.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText }),
      });
      if (res.ok) {
        const newReply = await res.json();
        setChildren((prev) => [
          ...prev,
          { ...newReply, replies: [], votesCount: 0 },
        ]);
        setReplyText("");
        setShowReplyBox(false);
      }
    } catch (err) {
      console.error("Failed to post reply:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const timeDisplay = reply.createdAt
    ? new Date(reply.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const visibleChildren = children.slice(0, visibleCount);
  const remainingCount = children.length - visibleCount;
  const hasChildren = children.length > 0;
  const isExpanded = !collapsed && visibleCount > 0;

  return (
    <div>
      {/* --- This reply --- */}
      <div className="flex gap-2.5">
        {/* Votes */}
        <VoteButtons
          targetType="reply"
          targetId={reply.id}
          votes={reply.votesCount ?? 0}
          initialUserVote={userVote}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Pinned label */}
          {reply.pinned && (
            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-primary">
              <Pin className="h-3 w-3" />
              Pinned reply
            </div>
          )}

          {/* Author line */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground text-sm">
              {reply.author?.username || "Anonymous"}
            </span>
            <span>• {timeDisplay}</span>
          </div>

          {/* Body */}
          <div className="mt-0.5">
            <ReadMore text={reply.content} maxChars={300} />
          </div>

          {/* Actions */}
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <SignedIn>
              <button
                onClick={() => setShowReplyBox((v) => !v)}
                className="flex items-center gap-1 hover:text-foreground transition"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Reply
              </button>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center gap-1 hover:text-foreground transition">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Reply
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Inline reply box */}
          {showReplyBox && (
            <div className="mt-2 space-y-2">
              <textarea
                className="w-full rounded-md border border-border/50 bg-background p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                rows={3}
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handlePostReply}
                  disabled={submitting || !replyText.trim()}
                  className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post reply"}
                </button>
                <button
                  onClick={() => setShowReplyBox(false)}
                  className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* --- YouTube-style reply controls (only at top level) --- */}
          {depth === 0 && hasChildren && collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition"
            >
              <ChevronDown className="h-4 w-4" />
              {children.length} {children.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </div>

      {/* --- Children: rendered outside flex, with thread line --- */}
      {hasChildren && (
        <div className={`ml-5 mt-1.5 border-l-2 border-border/30 pl-4 ${depth === 0 && collapsed ? "hidden" : ""}`}>
          <div className="space-y-3">
            {(depth === 0 ? visibleChildren : children).map((child) => (
              <ReplyItem
                key={child.id}
                reply={child}
                depth={depth + 1}
                userVotes={userVotes}
              />
            ))}
          </div>

          {/* Single toggle button: show more OR hide (only at depth 0) */}
          {depth === 0 && (
            remainingCount > 0 ? (
              <button
                onClick={() => setVisibleCount((v) => v + 5)}
                className="mt-2.5 flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition"
              >
                <ChevronDown className="h-4 w-4" />
                Show {Math.min(5, remainingCount)} more{" "}
                {remainingCount === 1 ? "reply" : "replies"}
              </button>
            ) : (
              <button
                onClick={() => {
                  setCollapsed(true);
                }}
                className="mt-2.5 flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition"
              >
                <ChevronUp className="h-4 w-4" />
                Hide replies
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
