import { prisma } from "@/lib/prisma";

// GET /api/leaderboard?limit=20
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const topUsers = await prisma.userStats.findMany({
    orderBy: { clarityScore: "desc" },
    take: limit,
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

  return Response.json(
    topUsers.map((s, i) => ({
      rank: i + 1,
      userId: s.userId,
      username: s.user.username,
      avatarUrl: s.user.avatarUrl,
      clarityScore: Math.round(s.clarityScore),
      totalAnswers: s.totalAnswers,
      verifiedCorrect: s.verifiedCorrect,
      totalUpvotes: s.totalUpvotes,
      topAchievements: s.user.achievements.map((a) => a.slug),
    }))
  );
}
