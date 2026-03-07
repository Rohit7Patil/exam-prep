import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Trophy, Zap, CheckCircle, ThumbsUp, BookOpen } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/clarityScore";

const TIER_CONFIG = [
  {
    min: 800,
    label: "Gold Scholar",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    medal: "🥇",
  },
  {
    min: 600,
    label: "Silver Analyst",
    color: "text-slate-400",
    bg: "bg-slate-400/10 border-slate-400/30",
    medal: "🥈",
  },
  {
    min: 300,
    label: "Bronze Starter",
    color: "text-amber-600",
    bg: "bg-amber-600/10 border-amber-600/30",
    medal: "🥉",
  },
  {
    min: 0,
    label: "Rising",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/30",
    medal: "⭐",
  },
];

function getTier(score) {
  return TIER_CONFIG.find((t) => score >= t.min) || TIER_CONFIG[3];
}

export default async function LeaderboardPage() {
  const topUsers = await prisma.userStats.findMany({
    orderBy: { clarityScore: "desc" },
    take: 25,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          achievements: {
            orderBy: { earnedAt: "asc" },
            take: 3,
            select: { slug: true },
          },
        },
      },
    },
  });

  const rows = topUsers.map((s, i) => ({
    rank: i + 1,
    userId: s.userId,
    username: s.user.username || "Anonymous",
    avatarUrl: s.user.avatarUrl,
    clarityScore: Math.round(s.clarityScore),
    totalAnswers: s.totalAnswers,
    verifiedCorrect: s.verifiedCorrect,
    totalUpvotes: s.totalUpvotes,
    answerStreak: s.answerStreak,
    topAchievements: s.user.achievements.map((a) => {
      const meta = ACHIEVEMENTS.find((m) => m.slug === a.slug);
      return {
        slug: a.slug,
        emoji: meta?.emoji || "🎖️",
        label: meta?.label || a.slug,
      };
    }),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-semibold text-primary mb-3">
          <Trophy className="h-4 w-4" />
          ClarityScore™ Leaderboard
        </div>
        <h1 className="text-3xl font-black text-foreground">Top Scholars</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          Ranked by ClarityScore™ — our proprietary metric measuring answer
          accuracy, peer signals, and consistency.
        </p>
      </div>

      {/* Top 3 podium */}
      {rows.length >= 3 && (
        <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-6 items-end">
          {[rows[1], rows[0], rows[2]].map((u, i) => {
            const tier = getTier(u.clarityScore);
            const podiumHeight = i === 1 ? "pt-0" : "pt-6";
            return (
              <Link
                key={u.userId}
                href={`/profile/${u.userId}`}
                className={`${podiumHeight} flex flex-col items-center gap-2 rounded-2xl border ${tier.bg} p-4 hover:scale-105 transition-transform`}
              >
                <span className="text-2xl">{tier.medal}</span>
                {u.avatarUrl ? (
                  <img
                    src={u.avatarUrl}
                    alt={u.username}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center text-xl font-black ${tier.color} bg-current/10`}
                  >
                    {u.username[0].toUpperCase()}
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground truncate max-w-[90px]">
                    {u.username}
                  </p>
                  <p className={`text-lg font-black ${tier.color}`}>
                    ⚡{u.clarityScore}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="rounded-xl border border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-12">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                  <Zap className="inline h-3.5 w-3.5 mr-0.5" />
                  Score
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                  <CheckCircle className="inline h-3.5 w-3.5 mr-0.5 text-emerald-500" />
                  Correct
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  <BookOpen className="inline h-3.5 w-3.5 mr-0.5" />
                  Answers
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  <ThumbsUp className="inline h-3.5 w-3.5 mr-0.5" />
                  Upvotes
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                  Achievements
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const tier = getTier(u.clarityScore);
                return (
                  <tr
                    key={u.userId}
                    className="border-b border-border/20 hover:bg-muted/20 transition-colors last:border-0"
                  >
                    {/* Rank */}
                    <td className="px-4 py-3">
                      <span
                        className={`font-black text-base ${u.rank <= 3 ? tier.color : "text-muted-foreground"}`}
                      >
                        {u.rank <= 3 ? tier.medal : `#${u.rank}`}
                      </span>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/profile/${u.userId}`}
                        className="flex items-center gap-2.5 group"
                      >
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.username}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${tier.color} bg-current/10 shrink-0`}
                          >
                            {u.username[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition">
                            {u.username}
                          </p>
                          <p
                            className={`text-xs font-medium sm:hidden ${tier.color}`}
                          >
                            ⚡{u.clarityScore}
                          </p>
                        </div>
                      </Link>
                    </td>

                    {/* ClarityScore */}
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`font-black text-base ${tier.color}`}>
                        ⚡{u.clarityScore}
                      </span>
                    </td>

                    {/* Correct */}
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className="text-emerald-500 font-bold">
                        {u.verifiedCorrect}
                      </span>
                    </td>

                    {/* Answers */}
                    <td className="px-4 py-3 text-center hidden md:table-cell text-muted-foreground">
                      {u.totalAnswers}
                    </td>

                    {/* Upvotes */}
                    <td className="px-4 py-3 text-center hidden md:table-cell text-muted-foreground">
                      {u.totalUpvotes}
                    </td>

                    {/* Achievements */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex gap-1">
                        {u.topAchievements.map((a) => (
                          <span
                            key={a.slug}
                            title={a.label}
                            className="text-base"
                          >
                            {a.emoji}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No users on the leaderboard yet. Start answering questions
                    to earn your ClarityScore™!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ClarityScore™ explainer */}
      <div className="mt-6 rounded-xl border border-border/30 bg-muted/20 p-4">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            About ClarityScore™
          </span>{" "}
          — a composite metric unique to ExamPrep India. Formula:{" "}
          <code className="bg-muted rounded px-1">
            ( AccuracyRate × 0.5 + PeerSignal × 0.3 + ConsistencyRatio × 0.2 ) ×
            1000
          </code>
          . Only <em>Answer</em>-type replies are evaluated. Maximum score:{" "}
          <strong>1000</strong>.
        </p>
      </div>
    </div>
  );
}
