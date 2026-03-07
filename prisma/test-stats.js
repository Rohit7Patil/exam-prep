const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { replies: { some: {} } },
    take: 1,
  });
  if (users.length === 0) {
    console.log("No users with replies");
    return;
  }
  const userId = users[0].id;
  const period = "all";

  const now = new Date();
  let since = null;
  const dateFilter = since ? { createdAt: { gte: since } } : {};

  try {
    const [
      answers,
      discussions,
      threads,
      replyVotes,
      threadVotes,
      recentActivity,
    ] = await Promise.all([
      prisma.reply.findMany({
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
      }),
      prisma.reply.findMany({
        where: { authorId: userId, replyType: "DISCUSSION", ...dateFilter },
        select: {
          id: true,
          votesCount: true,
          createdAt: true,
          thread: { select: { title: true, id: true } },
          content: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.thread.findMany({
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
      }),
      prisma.vote.findMany({
        where: { reply: { authorId: userId }, ...dateFilter },
        select: { value: true },
      }),
      prisma.vote.findMany({
        where: {
          thread: { authorId: userId },
          ...(since ? { createdAt: { gte: since } } : {}),
        },
        select: { value: true },
      }),
      // Daily activity breakdown
      prisma.reply.groupBy({
        by: ["createdAt"],
        where: {
          authorId: userId,
          createdAt: { gte: new Date(now - 30 * 24 * 60 * 60 * 1000) },
        },
        _count: { id: true },
      }),
    ]);
    console.log("Success:", {
      answers: answers.length,
      discussions: discussions.length,
      threads: threads.length,
    });
  } catch (e) {
    console.error("API error", e);
  }
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
