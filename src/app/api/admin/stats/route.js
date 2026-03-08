import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";
import { requireAdmin } from "@/lib/isAdmin";

/**
 * GET /api/admin/stats
 * Returns platform-wide statistics. Requires admin role.
 */
export async function GET() {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const [
    totalUsers,
    totalThreads,
    totalReplies,
    totalTags,
    totalVotes,
    recentThreads,
    recentReplies,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.thread.count(),
    prisma.reply.count(),
    prisma.tag.count(),
    prisma.vote.count(),
    prisma.thread.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        tags: { include: { tag: { select: { slug: true, label: true } } } },
      },
    }),
    prisma.reply.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        thread: { select: { id: true, title: true } },
      },
    }),
  ]);

  return Response.json({
    stats: { totalUsers, totalThreads, totalReplies, totalTags, totalVotes },
    recentThreads: recentThreads.map((t) => ({
      ...t,
      tags: t.tags.map((tt) => tt.tag),
    })),
    recentReplies,
  });
}
