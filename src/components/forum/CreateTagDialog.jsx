"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateTagDialog({ open, onClose, onCreate }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  function validate(tag) {
    if (tag.length < 2 || tag.length > 20) return "Tag must be 2–20 characters";

    if (!/^[a-z0-9-]+$/.test(tag))
      return "Only lowercase letters, numbers and hyphens allowed";

    return null;
  }

  async function handleCreate() {
    const trimmed = value.trim();

    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: trimmed,
          label: trimmed.replace(/-/g, " "),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create tag");
        return;
      }

      const tag = await res.json();
      onCreate(tag);

      setValue("");
      setError("");
      onClose();
    } catch (err) {
      setError("Failed to create tag");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-lg border border-border/40 bg-background p-6 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Create new tag</h3>

        <Input
          placeholder="e.g. answer-writing"
          value={value}
          onChange={(e) => {
            setValue(e.target.value.toLowerCase());
            setError("");
          }}
        />

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create tag</Button>
        </div>
      </div>
    </div>
  );
}
