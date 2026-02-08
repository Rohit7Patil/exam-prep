"use client";

import VoteButtons from "./VoteButtons";
import { MessageSquare, User, Pin } from "lucide-react";
import { useState } from "react";
import ReadMore from "../common/ReadMore";

export default function ReplyItem({ reply, depth = 0 }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const opacity = Math.max(1 - depth * 0.05, 0.85);

  return (
    <div
      className={`rounded-md border p-4 border-l-2 ${
        reply.pinned ? "border-primary bg-primary/5" : "border-l-muted"
      }`}
      style={{ marginLeft: depth * 24, opacity }}
    >
      {/* 🔹 PINNED LABEL */}
      {reply.pinned && (
        <div className="mb-2 flex items-center gap-1 text-xs font-medium text-primary">
          <Pin className="h-3 w-3" />
          Pinned reply
        </div>
      )}

      <div className="flex gap-4">
        {/* Votes */}
        <VoteButtons votes={reply.votes ?? 0} />

        <div className="flex-1">
          {/* Author */}
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4" />
            </div>

            <span className="font-medium text-foreground">
              {reply.author?.name}
            </span>

            <span>• {reply.createdAt}</span>
          </div>

          {/* Content */}
          <ReadMore text={reply.content} maxChars={300} />

          {/* Actions */}
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <button
              onClick={() => setShowReplyBox((v) => !v)}
              className="flex items-center gap-1 hover:text-foreground"
            >
              <MessageSquare className="h-4 w-4" />
              Reply
            </button>
          </div>

          {/* Reply box */}
          {showReplyBox && (
            <div className="mt-3 space-y-2">
              <textarea
                className="w-full rounded-md border bg-background p-2 text-sm"
                rows={3}
                placeholder="Write a reply..."
              />
              <div className="flex gap-2">
                <button className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground">
                  Post reply
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
          {reply.replies?.length > 0 && (
            <div className="mt-4 space-y-3">
              {reply.replies.map((child) => (
                <ReplyItem key={child.id} reply={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
