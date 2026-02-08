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
      className="block rounded-md border p-4 hover:bg-muted/50 transition"
    >
      <h2 className="font-semibold text-lg mb-1">{title}</h2>

      <p className="text-sm text-muted-foreground">
        By {author} · {replies} replies · Last active {lastActive}
      </p>
    </Link>
  );
}
