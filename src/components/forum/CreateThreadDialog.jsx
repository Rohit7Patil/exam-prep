"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TAGS as INITIAL_TAGS } from "@/data/tags";
import CreateTagDialog from "./CreateTagDialog";

export default function CreateThreadDialog() {
  const [open, setOpen] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);

  const [tags, setTags] = useState(INITIAL_TAGS);
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
      <Button onClick={() => setOpen(true)}>+ Create Thread</Button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg">
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
                    + Create tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`rounded-md border px-2 py-1 text-sm transition ${
                        selectedTags.includes(tag.id)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {tag.label}
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
                disabled={selectedTags.length === 0}
                onClick={() => {
                  console.log({
                    title,
                    content,
                    tags: selectedTags,
                  });
                  setOpen(false);
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
