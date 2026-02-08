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
    <Link
      href={`/forum/${category}/${slug}`}
      className="block rounded-md border p-3 sm:p-4 transition hover:bg-muted/50"
    >
      <h2 className="mb-1 text-base sm:text-lg font-semibold leading-snug">
        {title}
      </h2>

      <p className="flex flex-wrap gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
        <span>By {author}</span>
        <span>• {replies} replies</span>
        <span className="hidden sm:inline">• Last active {lastActive}</span>
      </p>
    </Link>
  );
}
