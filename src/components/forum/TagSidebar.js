"use client";

import { TAGS } from "@/data/tags";
import { Tag } from "lucide-react";

export default function TagSidebar({ activeTag, onSelect }) {
  return (
    <aside className="w-60 shrink-0 border-r pr-4">
      <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
        Tags
      </h3>

      <ul className="space-y-1">
        {TAGS.map((tag) => (
          <li key={tag.id}>
            <button
              onClick={() => onSelect(tag.id)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition
                ${
                  activeTag === tag.id
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
            >
              <Tag className="h-4 w-4 shrink-0" />
              <span className="truncate">{tag.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
