"use client";

import { useState } from "react";

export default function ReplyComposer({ onSubmit }) {
  const [text, setText] = useState("");

  function handleSubmit() {
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  }

  return (
    <div className="mt-6 rounded-lg border bg-card p-4">
      <h3 className="mb-2 text-sm font-semibold">
        Add a reply
      </h3>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="w-full rounded-md border bg-background p-3"
        placeholder="Write your reply…"
      />

      <div className="mt-3 flex justify-end">
        <button
          onClick={handleSubmit}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Post reply
        </button>
      </div>
    </div>
  );
}
