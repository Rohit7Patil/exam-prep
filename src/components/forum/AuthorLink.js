"use client";

import Link from "next/link";

const SCORE_COLORS = [
  { min: 800, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  { min: 600, color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/30" },
  { min: 300, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/30" },
  { min: 0,   color: "text-blue-500",  bg: "bg-blue-500/10",  border: "border-blue-500/30"  },
];

function getScoreStyle(score) {
  return SCORE_COLORS.find((c) => score >= c.min) || SCORE_COLORS[3];
}

export default function AuthorLink({ author, size = "sm" }) {
  if (!author?.id) {
    return (
      <span className="font-medium text-foreground">
        {author?.username || "Anonymous"}
      </span>
    );
  }

  const score = Math.round(author.stats?.clarityScore || 0);
  const style = getScoreStyle(score);
  const hasScore = score > 0;

  return (
    <Link
      href={`/profile/${author.id}`}
      className="inline-flex items-center gap-1.5 group"
      onClick={(e) => e.stopPropagation()}
    >
      {author.avatarUrl ? (
        <img
          src={author.avatarUrl}
          alt={author.username}
          className={`rounded-full object-cover shrink-0 ${
            size === "sm" ? "h-5 w-5" : "h-6 w-6"
          }`}
        />
      ) : (
        <span
          className={`flex items-center justify-center rounded-full bg-primary/20 text-primary font-semibold shrink-0 ${
            size === "sm" ? "h-5 w-5 text-[10px]" : "h-6 w-6 text-xs"
          }`}
        >
          {(author.username || "A")[0].toUpperCase()}
        </span>
      )}

      <span
        className={`font-medium text-foreground group-hover:text-primary transition ${
          size === "sm" ? "text-sm" : "text-base"
        }`}
      >
        {author.username || "Anonymous"}
      </span>

      {hasScore && (
        <span
          className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0 text-[10px] font-semibold leading-5 ${style.color} ${style.bg} ${style.border}`}
          title={`ClarityScore™: ${score}`}
        >
          ⚡{score}
        </span>
      )}
    </Link>
  );
}
