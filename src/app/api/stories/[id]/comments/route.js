import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * GET /api/stories/[id]/comments
 * List comments for a story.
 */
export async function GET(req, { params }) {
  const { id } = await params;

  const comments = await prisma.storyComment.findMany({
    where: { storyId: id },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });

  return Response.json({ comments });
}

/**
 * POST /api/stories/[id]/comments
 * Add a comment to a story. Requires auth.
 * Body: { content }
 */
export async function POST(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const { id } = await params;

  try {
    const { content } = await req.json();

    if (!content?.trim()) {
      return Response.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    // Verify story exists
    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) {
      return Response.json({ error: "Story not found" }, { status: 404 });
    }

    const [comment] = await prisma.$transaction([
      prisma.storyComment.create({
        data: {
          content: content.trim(),
          storyId: id,
          authorId: user.id,
        },
        include: {
          author: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      }),
      prisma.story.update({
        where: { id },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    return Response.json(comment, { status: 201 });
  } catch (error) {
    console.error("Add comment error:", error);
    return Response.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
