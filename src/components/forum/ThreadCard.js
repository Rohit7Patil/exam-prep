import Link from "next/link";

export default function ThreadCard({
  category,
  slug,
  title,
  author,
  replies,
  lastActive,
}) {
  return (
    <Link href={`/forum/${category}/${slug}`} className="group block">
      <div
        className="
        rounded-xl border bg-card p-4 sm:p-5
        transition-all
        hover:border-primary/40
        hover:shadow-sm
      "
      >
        {/* Title */}
        <h3
          className="
          text-lg font-semibold leading-snug
          text-foreground
          group-hover:text-primary
          transition-colors
        "
        >
          {title}
        </h3>

        {/* Meta */}
        <div
          className="
          mt-2 flex flex-wrap items-center gap-x-4 gap-y-1
          text-sm text-muted-foreground
        "
        >
          <span>
            By <span className="font-medium text-foreground">{author}</span>
          </span>

          <span className="hidden sm:inline">•</span>

          <span>{replies} replies</span>

          <span className="hidden sm:inline">•</span>

          <span>Last active {lastActive}</span>
        </div>
      </div>
    </Link>
  );
}
