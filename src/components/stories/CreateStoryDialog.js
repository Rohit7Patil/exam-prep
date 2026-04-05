"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SignedOut, SignedIn, SignInButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { PenLine, X } from "lucide-react";

export default function CreateStoryDialog({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (open && categories.length === 0) {
      fetch("/api/story-categories")
        .then((r) => r.json())
        .then((d) => setCategories(d.categories || []))
        .catch(() => {});
    }
  }, [open, categories.length]);

  function reset() {
    setTitle("");
    setContent("");
    setCategoryId("");
    setOpen(false);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      alert("Please provide a title for your story.");
      return;
    }
    if (content.trim().length < 50) {
      alert("Your story is too short. Please provide at least 50 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          categoryId: categoryId || undefined,
        }),
      });
      if (res.ok) {
        reset();
        if (onCreated) onCreated();
        else window.location.reload();
      } else {
        const err = await res.json();
        alert(err.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Failed to create story:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button className="gap-2">
            <PenLine className="h-4 w-4" />
            Share Your Story
          </Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <PenLine className="h-4 w-4" />
          Share Your Story
        </Button>
      </SignedIn>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full h-full sm:h-auto sm:max-h-[85vh] max-w-2xl flex flex-col rounded-none sm:rounded-2xl border border-border/40 bg-background shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/20 shrink-0">
              <div>
                <h2 className="text-xl font-bold">Share Your Story</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Inspire others with your exam preparation journey
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 hover:bg-muted/60 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Title
                </label>
                <Input
                  placeholder="e.g., How I cracked UPSC in my first attempt"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base"
                />
              </div>

              {/* Category selector */}
              {categories.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setCategoryId(categoryId === cat.id ? "" : cat.id)
                        }
                        className={`rounded-full border px-3 py-1 text-sm transition-all flex items-center gap-1.5 ${
                          categoryId === cat.id
                            ? "text-white border-transparent shadow-md"
                            : "border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                        style={
                          categoryId === cat.id
                            ? {
                                backgroundColor: cat.color,
                                boxShadow: `0 4px 14px ${cat.color}40`,
                              }
                            : {}
                        }
                      >
                        <span>{cat.emoji}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Your Story
                </label>
                <Textarea
                  rows={8}
                  placeholder="Share your journey... What strategies worked? What challenges did you face? What advice would you give to others?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="text-sm leading-relaxed resize-none h-[200px] sm:h-auto"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Minimum 50 characters · {content.length} characters
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-border/20 shrink-0 bg-muted/10 flex justify-end gap-3">
              <Button variant="outline" onClick={reset}>
                Cancel
              </Button>
              <Button
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Publishing..." : "Publish Story"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
