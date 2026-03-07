import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Trophy, TrendingUp } from "lucide-react";

export default async function HomeLeaderboard() {
  const topUsers = await prisma.userStats.findMany({
    orderBy: { clarityScore: "desc" },
    take: 3,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (topUsers.length === 0) return null;

  // Reorder for podium: 2nd, 1st, 3rd
  const podium = [];
  if (topUsers[1]) podium.push(topUsers[1]);
  if (topUsers[0]) podium.push(topUsers[0]);
  if (topUsers[2]) podium.push(topUsers[2]);

  return (
    <section className="py-16 sm:py-24 border-t border-border/40 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="mx-auto max-w-4xl px-4 relative z-10 text-center">
        <h2 className="mb-4 text-3xl font-black sm:text-4xl flex items-center justify-center gap-3">
          <Trophy className="h-8 w-8 text-amber-500" />
          Top Scholars
        </h2>
        <p className="mb-12 text-muted-foreground">
          Meet the most helpful minds on ExamPrep India. Can you beat their ClarityScore™?
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-2xl mx-auto mb-10">
          {podium.map((s, i) => {
            const isFirst = s === topUsers[0];
            const rank = isFirst ? 1 : s === topUsers[1] ? 2 : 3;
            const medal = isFirst ? "🥇" : rank === 2 ? "🥈" : "🥉";
            const color = isFirst ? "text-yellow-500" : rank === 2 ? "text-slate-400" : "text-amber-600";
            const bg = isFirst ? "bg-yellow-500/10 border-yellow-500/30" : rank === 2 ? "bg-slate-400/10 border-slate-400/30" : "bg-amber-600/10 border-amber-600/30";
            
            return (
              <Link
                key={s.userId}
                href={`/profile/${s.userId}`}
                className={`flex flex-col items-center gap-3 rounded-2xl border ${bg} p-4 sm:p-6 hover:-translate-y-2 transition-transform shadow-xl ${
                  isFirst ? "pt-8 sm:pt-10 z-10 scale-105" : "opacity-90 hover:opacity-100"
                }`}
              >
                <div className="relative">
                  {s.user.avatarUrl ? (
                    <img src={s.user.avatarUrl} alt={s.user.username} className={`rounded-full object-cover ring-4 ring-background ${isFirst ? "h-20 w-20" : "h-14 w-14"}`} />
                  ) : (
                    <div className={`rounded-full flex items-center justify-center font-black ${color} bg-current/20 ring-4 ring-background ${isFirst ? "h-20 w-20 text-3xl" : "h-14 w-14 text-xl"}`}>
                      {(s.user.username || "A")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-2 -right-2 text-2xl drop-shadow-md bg-background rounded-full">{medal}</span>
                </div>
                
                <div className="text-center mt-2">
                  <p className="text-sm font-bold text-foreground truncate max-w-[100px] sm:max-w-full">{s.user.username}</p>
                  <p className={`text-xl font-black mt-1 ${color}`}>⚡{Math.round(s.clarityScore)}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-lg shadow-primary/20"
        >
          View Full Leaderboard
          <TrendingUp className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
