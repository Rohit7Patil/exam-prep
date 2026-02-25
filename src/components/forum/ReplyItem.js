"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { MessageSquare, Pin, User } from "lucide-react";
import { useState } from "react";
import ReadMore from "../common/ReadMore";
import VoteButtons from "./VoteButtons";

export default function ReplyItem({ reply, depth = 0, userVotes = {} }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [children, setChildren] = useState(reply.replies || []);
  const opacity = Math.max(1 - depth * 0.05, 0.85);

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

  // Format time
  const timeDisplay = reply.createdAt
    ? new Date(reply.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div
      className={`rounded-md border border-border/40 p-3 sm:p-4 transition border-l-2 ${
        reply.pinned ? "border-l-primary bg-primary/5" : "border-l-muted/60"
      }`}
      style={{
        marginLeft: depth * 16,
        opacity,
      }}
    >
      {/* PINNED LABEL */}
      {reply.pinned && (
        <div className="mb-2 flex items-center gap-1 text-xs font-medium text-primary">
          <Pin className="h-3 w-3" />
          Pinned reply
        </div>
      )}

      <div className="flex gap-3 sm:gap-4">
        {/* Votes */}
        <VoteButtons
          targetType="reply"
          targetId={reply.id}
          votes={reply.votesCount ?? 0}
          initialUserVote={userVote}
        />

        <div className="flex-1">
          {/* Author */}
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50 border border-border/20">
              <User className="h-4 w-4" />
            </div>

            <span className="font-medium text-foreground">
              {reply.author?.username || "Anonymous"}
            </span>

            <span>• {timeDisplay}</span>
          </div>

          {/* Content */}
          <ReadMore text={reply.content} maxChars={300} />

          {/* Actions */}
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <SignedIn>
              <button
                onClick={() => setShowReplyBox((v) => !v)}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <MessageSquare className="h-4 w-4" />
                Reply
              </button>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center gap-1 hover:text-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Reply
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Reply box */}
          {showReplyBox && (
            <div className="mt-3 space-y-2">
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

          {/* Nested replies */}
          {children?.length > 0 && (
            <div className="mt-4 space-y-3">
              {children.map((child) => (
                <ReplyItem
                  key={child.id}
                  reply={child}
                  depth={depth + 1}
                  userVotes={userVotes}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
