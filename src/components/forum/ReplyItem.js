"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ChevronDown, ChevronUp, MessageSquare, Pin } from "lucide-react";
import { useState } from "react";
import ReadMore from "../common/ReadMore";
import VoteButtons from "./VoteButtons";
import AuthorLink from "./AuthorLink";
import VerifyButton, { VerificationBadge } from "./VerifyButton";

const TYPE_BADGE = {
  ANSWER: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
  DISCUSSION: "bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/30",
};

export default function ReplyItem({
  reply,
  depth = 0,
  userVotes = {},
  currentUserId,
  isAdmin,
  threadAuthorId,
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sortedInitialChildren = [...(reply.replies || [])].sort(
    (a, b) => (b.votesCount ?? 0) - (a.votesCount ?? 0)
  );
  const [children, setChildren] = useState(sortedInitialChildren);
  const [visibleCount, setVisibleCount] = useState(1);
  const [collapsed, setCollapsed] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(
    reply.verificationStatus || "PENDING"
  );

  const userVote = userVotes[`reply_${reply.id}`] || 0;
  const isAnswer = reply.replyType === "ANSWER";
  const canVerify =
    isAnswer &&
    (isAdmin || threadAuthorId === currentUserId) &&
    reply.authorId !== currentUserId;

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

          {/* Type badge + Verification badge */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {reply.replyType && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  TYPE_BADGE[reply.replyType] || TYPE_BADGE.DISCUSSION
                }`}
              >
                {reply.replyType === "ANSWER" ? "✅ Answer" : "💬 Discussion"}
              </span>
            )}
            {isAnswer && (
              <VerificationBadge status={verificationStatus} />
            )}
          </div>

          {/* Author line */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AuthorLink author={reply.author} size="sm" />
            <span>• {timeDisplay}</span>
          </div>

          {/* Body */}
          <div className="mt-0.5">
            <ReadMore text={reply.content} maxChars={300} />
          </div>

          {/* Actions */}
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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

            {/* Verify controls for admins / thread authors */}
            {canVerify && (
              <VerifyButton
                replyId={reply.id}
                currentStatus={verificationStatus}
                onVerified={(s) => setVerificationStatus(s)}
              />
            )}
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

          {/* YouTube-style collapse/expand (depth 0 only) */}
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

      {/* Children */}
      {hasChildren && (
        <div
          className={`ml-5 mt-1.5 border-l-2 border-border/30 pl-4 ${
            depth === 0 && collapsed ? "hidden" : ""
          }`}
        >
          <div className="space-y-3">
            {(depth === 0 ? visibleChildren : children).map((child) => (
              <ReplyItem
                key={child.id}
                reply={child}
                depth={depth + 1}
                userVotes={userVotes}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                threadAuthorId={threadAuthorId}
              />
            ))}
          </div>

          {depth === 0 &&
            (remainingCount > 0 ? (
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
                onClick={() => setCollapsed(true)}
                className="mt-2.5 flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition"
              >
                <ChevronUp className="h-4 w-4" />
                Hide replies
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
