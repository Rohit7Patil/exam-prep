import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * POST /api/replies/[id]/vote
 *
 * Toggle vote on a reply. Same toggle semantics as thread voting.
 * Body: { value: 1 | -1 }
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

    // Verify reply exists
    const reply = await prisma.reply.findUnique({ where: { id } });
    if (!reply) {
      return Response.json({ error: "Reply not found" }, { status: 404 });
    }

    // Check for existing vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_replyId: {
          userId: user.id,
          replyId: id,
        },
      },
    });

    let action;

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote → remove it (toggle off)
        await prisma.$transaction([
          prisma.vote.delete({ where: { id: existingVote.id } }),
          prisma.reply.update({
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
          prisma.reply.update({
            where: { id },
            data: { votesCount: { increment: value * 2 } },
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
            replyId: id,
          },
        }),
        prisma.reply.update({
          where: { id },
          data: { votesCount: { increment: value } },
        }),
      ]);
      action = "created";
    }

    // Return updated count
    const updated = await prisma.reply.findUnique({
      where: { id },
      select: { votesCount: true },
    });

    return Response.json({
      action,
      votesCount: updated.votesCount,
      userVote: action === "removed" ? 0 : value,
    });
  } catch (error) {
    console.error("Vote reply error:", error);
    return Response.json(
      { error: "Failed to vote" },
      { status: 500 }
    );
  }
}
