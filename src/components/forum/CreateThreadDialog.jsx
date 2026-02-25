"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SignedOut, SignedIn, SignInButton } from "@clerk/nextjs";
import { useState } from "react";
import CreateTagDialog from "./CreateTagDialog";

export default function CreateThreadDialog({ tags: initialTags = [] }) {
  const [open, setOpen] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [tags, setTags] = useState(initialTags);
  const [selectedTags, setSelectedTags] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function toggleTag(id) {
    setSelectedTags((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : prev.length < 5
          ? [...prev, id]
          : prev,
    );
  }

  function handleCreateTag(tag) {
    setTags((prev) => [...prev, tag]);
    setSelectedTags((prev) => [...prev, tag.id]); // auto-select
  }

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button className="w-full sm:w-auto">Create Thread</Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">Create Thread</Button>
      </SignedIn>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-border/40 bg-background p-4 sm:p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Create new thread</h2>

            <div className="space-y-4">
              <Input
                placeholder="Thread title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Textarea
                rows={5}
                placeholder="Describe your question or discussion..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Tags (min 1, max 5)</p>

                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => setShowCreateTag(true)}
                  >
                    Create tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`rounded-md border border-border/40 px-2 py-1 text-sm transition ${
                        selectedTags.includes(tag.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tag.slug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={selectedTags.length === 0 || submitting}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    const res = await fetch("/api/threads", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title,
                        content,
                        tagIds: selectedTags,
                      }),
                    });
                    if (res.ok) {
                      setOpen(false);
                      setTitle("");
                      setContent("");
                      setSelectedTags([]);
                      window.location.reload();
                    }
                  } catch (err) {
                    console.error("Failed to create thread:", err);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                Post Thread
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Tag Modal */}
      <CreateTagDialog
        open={showCreateTag}
        onClose={() => setShowCreateTag(false)}
        onCreate={handleCreateTag}
      />
    </>
  );
}
