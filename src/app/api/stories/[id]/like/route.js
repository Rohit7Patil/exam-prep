import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * POST /api/stories/[id]/like
 * Toggle like on a story. Requires auth.
 */
export async function POST(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const { id } = await params;

  try {
    // Verify story exists
    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) {
      return Response.json({ error: "Story not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.storyLike.findUnique({
      where: {
        userId_storyId: {
          userId: user.id,
          storyId: id,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.storyLike.delete({
          where: { id: existingLike.id },
        }),
        prisma.story.update({
          where: { id },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);

      return Response.json({ liked: false, likesCount: story.likesCount - 1 });
    } else {
      // Like
      await prisma.$transaction([
        prisma.storyLike.create({
          data: {
            storyId: id,
            userId: user.id,
          },
        }),
        prisma.story.update({
          where: { id },
          data: { likesCount: { increment: 1 } },
        }),
      ]);

      return Response.json({ liked: true, likesCount: story.likesCount + 1 });
    }
  } catch (error) {
    console.error("Toggle like error:", error);
    return Response.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
