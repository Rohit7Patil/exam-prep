"use client";

import { Tag } from "lucide-react";

export default function TagSidebar({ tags = [], activeTag, onSelect }) {
  return (
    <aside className="hidden lg:block w-60 shrink-0 border-r border-border/40 pr-4">
      <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
        Tags
      </h3>

      <ul className="space-y-1">
        {tags.map((tag) => (
          <li key={tag.slug}>
            <button
              onClick={() => onSelect(tag.slug)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition
                ${
                  activeTag === tag.slug
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
            >
              <Tag className="h-4 w-4 shrink-0" />
              <span className="truncate">{tag.slug}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
