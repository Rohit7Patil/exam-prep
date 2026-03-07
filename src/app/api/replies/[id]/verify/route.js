import { prisma } from "@/lib/prisma";
import { calculateClarityScore } from "@/lib/clarityScore";
import { getAuthUser } from "@/lib/getAuthUser";

// PATCH /api/replies/[id]/verify
export async function PATCH(req, { params }) {
  const { id } = await params;
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const body = await req.json();
  const { status } = body; // "CORRECT" | "INCORRECT" | "DISPUTED"

  if (!["CORRECT", "INCORRECT", "DISPUTED"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  // Load the reply to check permissions
  const reply = await prisma.reply.findUnique({
    where: { id },
    include: {
      thread: { select: { authorId: true } },
    },
  });

  if (!reply) {
    return Response.json({ error: "Reply not found" }, { status: 404 });
  }

  if (reply.replyType !== "ANSWER") {
    return Response.json(
      { error: "Only answers can be verified" },
      { status: 400 }
    );
  }

  // Permission: admin, thread author, or user with ClarityScore >= 500
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId: user.id, role: { name: { in: ["admin", "ADMIN"] } } },
  });
  const isThreadAuthor = reply.thread.authorId === user.id;
  const userStats = await prisma.userStats.findUnique({
    where: { userId: user.id },
    select: { clarityScore: true },
  });
  const isSenior = (userStats?.clarityScore || 0) >= 500;

  if (!isAdmin && !isThreadAuthor && !isSenior) {
    return Response.json(
      { error: "Insufficient permissions to verify answers" },
      { status: 403 }
    );
  }

  // Update reply
  const updated = await prisma.reply.update({
    where: { id },
    data: {
      verificationStatus: status,
      verifiedAt: new Date(),
      verifiedById: user.id,
    },
  });

  // Recalculate author's ClarityScore
  await calculateClarityScore(reply.authorId);

  return Response.json(updated);
}
