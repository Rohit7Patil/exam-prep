import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * POST /api/threads/[id]/vote
 *
 * Toggle vote on a thread. Requires authentication.
 * Body: { value: 1 | -1 }
 *
 * - If no vote exists, creates one
 * - If same vote exists, removes it (toggle off)
 * - If opposite vote exists, updates it
 */
export async function POST(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const { id } = await params;

  try {
    const { value } = await req.json();

    if (value !== 1 && value !== -1) {
      return Response.json(
        { error: "Value must be 1 or -1" },
        { status: 400 }
      );
    }

    // Verify thread exists
    const thread = await prisma.thread.findUnique({ where: { id } });
    if (!thread) {
      return Response.json({ error: "Thread not found" }, { status: 404 });
    }

    // Author cannot vote on own thread
    if (thread.authorId === user.id) {
      return Response.json(
        { error: "Cannot vote on your own thread" },
        { status: 403 }
      );
    }

    // Check for existing vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_threadId: {
          userId: user.id,
          threadId: id,
        },
      },
    });

    let action;

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote → remove it (toggle off)
        await prisma.$transaction([
          prisma.vote.delete({ where: { id: existingVote.id } }),
          prisma.thread.update({
            where: { id },
            data: { votesCount: { decrement: value } },
          }),
        ]);
        action = "removed";
      } else {
        // Different vote → update it
        await prisma.$transaction([
          prisma.vote.update({
            where: { id: existingVote.id },
            data: { value },
          }),
          prisma.thread.update({
            where: { id },
            data: { votesCount: { increment: value * 2 } }, // swing from -1 to +1 or vice versa
          }),
        ]);
        action = "updated";
      }
    } else {
      // No existing vote → create one
      await prisma.$transaction([
        prisma.vote.create({
          data: {
            value,
            userId: user.id,
            threadId: id,
          },
        }),
        prisma.thread.update({
          where: { id },
          data: { votesCount: { increment: value } },
        }),
      ]);
      action = "created";
    }

    // Return updated count
    const updated = await prisma.thread.findUnique({
      where: { id },
      select: { votesCount: true },
    });

    return Response.json({
      action,
      votesCount: updated.votesCount,
      userVote: action === "removed" ? 0 : value,
    });
  } catch (error) {
    console.error("Vote thread error:", error);
    return Response.json(
      { error: "Failed to vote" },
      { status: 500 }
    );
  }
}
