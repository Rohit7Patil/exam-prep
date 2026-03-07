import { prisma } from "@/lib/prisma";

// GET /api/users/[userId]/stats?period=week
export async function GET(req, { params }) {
  const { userId } = await params;
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "all";

  const now = new Date();
  let since = null;

  if (period === "day") {
    since = new Date(now - 24 * 60 * 60 * 1000);
  } else if (period === "week") {
    since = new Date(now - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "month") {
    since = new Date(now - 30 * 24 * 60 * 60 * 1000);
  } else if (period === "quarter") {
    since = new Date(now - 90 * 24 * 60 * 60 * 1000);
  } else if (period === "thisMonth") {
    since = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const dateFilter = since ? { createdAt: { gte: since } } : {};

  const answers = await prisma.reply.findMany({
    where: { authorId: userId, replyType: "ANSWER", ...dateFilter },
    select: {
      id: true,
      votesCount: true,
      verificationStatus: true,
      createdAt: true,
      thread: { select: { title: true, id: true } },
      content: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const discussions = await prisma.reply.findMany({
    where: { authorId: userId, replyType: "DISCUSSION", ...dateFilter },
    select: {
      id: true,
      votesCount: true,
      createdAt: true,
      thread: { select: { title: true, id: true } },
      content: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const threads = await prisma.thread.findMany({
    where: {
      authorId: userId,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    select: {
      id: true,
      title: true,
      votesCount: true,
      repliesCount: true,
      viewsCount: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const replyVotes = await prisma.vote.findMany({
    where: { reply: { authorId: userId }, ...dateFilter },
    select: { value: true },
  });

  const threadVotes = await prisma.vote.findMany({
    where: {
      thread: { authorId: userId },
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    select: { value: true },
  });

  const upvotes = [...replyVotes, ...threadVotes].filter(
    (v) => v.value > 0,
  ).length;
  const downvotes = [...replyVotes, ...threadVotes].filter(
    (v) => v.value < 0,
  ).length;
  const verifiedCorrect = answers.filter(
    (a) => a.verificationStatus === "CORRECT",
  ).length;
  const verifiedIncorrect = answers.filter(
    (a) => a.verificationStatus === "INCORRECT",
  ).length;
  const pendingAnswers = answers.filter(
    (a) => a.verificationStatus === "PENDING",
  ).length;

  return Response.json({
    period,
    totalAnswers: answers.length,
    totalDiscussions: discussions.length,
    totalThreads: threads.length,
    totalUpvotes: upvotes,
    totalDownvotes: downvotes,
    verifiedCorrect,
    verifiedIncorrect,
    pendingAnswers,
    answers: answers.map((a) => ({
      id: a.id,
      content: a.content?.slice(0, 120),
      votesCount: a.votesCount,
      verificationStatus: a.verificationStatus,
      createdAt: a.createdAt.toISOString(),
      thread: a.thread,
    })),
    discussions: discussions.map((d) => ({
      id: d.id,
      content: d.content?.slice(0, 120),
      votesCount: d.votesCount,
      createdAt: d.createdAt.toISOString(),
      thread: d.thread,
    })),
    threads: threads.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    })),
  });
}
