import { prisma } from "@/lib/prisma";
import { ACHIEVEMENTS } from "@/lib/clarityScore";

export async function GET(req, { params }) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      createdAt: true,
      stats: true,
      achievements: {
        orderBy: { earnedAt: "asc" },
        select: { slug: true, earnedAt: true },
      },
    },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Enrich achievements with metadata
  const enrichedAchievements = user.achievements.map((a) => {
    const meta = ACHIEVEMENTS.find((m) => m.slug === a.slug);
    return {
      slug: a.slug,
      earnedAt: a.earnedAt,
      label: meta?.label || a.slug,
      emoji: meta?.emoji || "🎖️",
      desc: meta?.desc || "",
    };
  });

  return Response.json({
    ...user,
    achievements: enrichedAchievements,
    createdAt: user.createdAt.toISOString(),
  });
}
