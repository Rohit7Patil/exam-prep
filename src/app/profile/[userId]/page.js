import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ACHIEVEMENTS } from "@/lib/clarityScore";
import ProfileDashboard from "./ProfileDashboard";

export default async function ProfilePage({ params }) {
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
      _count: {
        select: { threads: true, replies: true },
      },
    },
  });

  if (!user) notFound();

  const enrichedAchievements = user.achievements.map((a) => {
    const meta = ACHIEVEMENTS.find((m) => m.slug === a.slug);
    return {
      slug: a.slug,
      earnedAt: a.earnedAt.toISOString(),
      label: meta?.label || a.slug,
      emoji: meta?.emoji || "🎖️",
      desc: meta?.desc || "",
    };
  });

  // All achievements list (locked + unlocked)
  const allAchievements = ACHIEVEMENTS.map((meta) => {
    const earned = user.achievements.find((a) => a.slug === meta.slug);
    return {
      slug: meta.slug,
      label: meta.label,
      emoji: meta.emoji,
      desc: meta.desc,
      earned: !!earned,
      earnedAt: earned?.earnedAt?.toISOString() || null,
    };
  });

  const profileData = {
    id: user.id,
    username: user.username || "Anonymous",
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    stats: user.stats,
    achievements: enrichedAchievements,
    allAchievements,
    totalThreads: user._count.threads,
    totalReplies: user._count.replies,
  };

  return <ProfileDashboard profile={profileData} />;
}
