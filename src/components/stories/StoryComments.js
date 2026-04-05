"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageCircle, User, Send } from "lucide-react";

export default function StoryComments({ storyId }) {
  const { isSignedIn } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/stories/${storyId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storyId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/stories/${storyId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setContent("");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="comments-section">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5 text-primary" />
        Comments ({comments.length})
      </h3>

      {/* Comment composer */}
      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden focus-within:border-primary/40 transition-colors">
            <Textarea
              placeholder="Share your thoughts or ask a question..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="border-0 focus-visible:ring-0 resize-none text-sm"
            />
            <div className="flex justify-end px-3 pb-3">
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || submitting}
                className="gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                {submitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-xl border border-border/40 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          Sign in to join the conversation
        </div>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-muted/30 h-24 animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-border/30 bg-card/50 p-4 transition-colors hover:border-border/60"
            >
              <div className="flex items-center gap-2.5 mb-3">
                {comment.author?.avatarUrl ? (
                  <img
                    src={comment.author.avatarUrl}
                    alt={comment.author.username || "User"}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-border/40"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {comment.author?.username || "Anonymous"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
