import Link from "next/link";
import { Pin, Tag, Eye, MessageSquare } from "lucide-react";

export default function ThreadRow({ thread }) {
  return (
    <Link
      href={`/forum/${thread.id}`}
      className="block rounded-lg border bg-card p-4 transition hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {thread.pinned && <Pin className="h-4 w-4 text-primary" />}
            <h3 className="font-semibold leading-snug">{thread.title}</h3>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {thread.excerpt}
          </p>

          <div className="flex flex-wrap gap-2">
            {thread.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {thread.repliesCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {thread.viewsCount}
          </span>
          <span>{thread.lastActive}</span>
        </div>
      </div>
    </Link>
  );
}
