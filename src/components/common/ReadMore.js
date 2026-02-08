"use client";

import { useState } from "react";

export default function ReadMore({ text, maxChars = 300 }) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= maxChars) {
    return <p className="whitespace-pre-line">{text}</p>;
  }

  return (
    <div>
      <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
        {expanded ? text : text.slice(0, maxChars) + "..."}
      </p>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-sm font-medium text-primary hover:underline"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
