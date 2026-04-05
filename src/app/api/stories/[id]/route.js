import { prisma } from "@/lib/prisma";

/**
 * GET /api/stories/[id]
 * Get a single story by ID and increment views.
 */
export async function GET(req, { params }) {
  const { id } = await params;

  try {
    const story = await prisma.story.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        category: {
          select: { id: true, slug: true, label: true, emoji: true, color: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    return Response.json(story);
  } catch (error) {
    return Response.json({ error: "Story not found" }, { status: 404 });
  }
}
