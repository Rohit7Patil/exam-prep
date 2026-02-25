import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * POST /api/replies/[id]/reply
 *
 * Create a nested reply under another reply. Requires authentication.
 * Body: { content: string }
 */
export async function POST(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const { id } = await params;

  try {
    const { content } = await req.json();

    if (!content?.trim()) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

    // Verify parent reply exists and get its threadId
    const parentReply = await prisma.reply.findUnique({
      where: { id },
      select: { id: true, threadId: true },
    });

    if (!parentReply) {
      return Response.json({ error: "Reply not found" }, { status: 404 });
    }

    // Create nested reply and increment thread reply count
    const [reply] = await prisma.$transaction([
      prisma.reply.create({
        data: {
          content: content.trim(),
          threadId: parentReply.threadId,
          parentId: id,
          authorId: user.id,
        },
        include: {
          author: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      }),
      prisma.thread.update({
        where: { id: parentReply.threadId },
        data: { repliesCount: { increment: 1 } },
      }),
    ]);

    return Response.json(reply, { status: 201 });
  } catch (error) {
    console.error("Create nested reply error:", error);
    return Response.json(
      { error: "Failed to create reply" },
      { status: 500 }
    );
  }
}
