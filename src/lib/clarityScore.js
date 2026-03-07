import { prisma } from "@/lib/prisma";

const ACHIEVEMENTS = [
  {
    slug: "first-verified",
    label: "First Verified",
    emoji: "💡",
    desc: "First answer verified as correct",
    check: (stats) => stats.verifiedCorrect >= 1,
  },
  {
    slug: "bronze-starter",
    label: "Bronze Starter",
    emoji: "🥉",
    desc: "ClarityScore™ reached 300",
    check: (stats) => stats.clarityScore >= 300,
  },
  {
    slug: "silver-analyst",
    label: "Silver Analyst",
    emoji: "🥈",
    desc: "ClarityScore™ reached 600",
    check: (stats) => stats.clarityScore >= 600,
  },
  {
    slug: "gold-scholar",
    label: "Gold Scholar",
    emoji: "🏆",
    desc: "ClarityScore™ reached 800",
    check: (stats) => stats.clarityScore >= 800,
  },
  {
    slug: "sharp-shot",
    label: "Sharp Shot",
    emoji: "🎯",
    desc: "10 verified correct answers",
    check: (stats) => stats.verifiedCorrect >= 10,
  },
  {
    slug: "on-a-roll",
    label: "On a Roll",
    emoji: "🔥",
    desc: "5 consecutive correct answers",
    check: (stats) => stats.answerStreak >= 5,
  },
  {
    slug: "community-star",
    label: "Community Star",
    emoji: "🌟",
    desc: "50+ net upvotes on answers",
    check: (stats) => stats.totalUpvotes - stats.totalDownvotes >= 50,
  },
  {
    slug: "prolific",
    label: "Prolific",
    emoji: "📚",
    desc: "25+ answers posted",
    check: (stats) => stats.totalAnswers >= 25,
  },
];

export { ACHIEVEMENTS };

/**
 * Recalculates and persists ClarityScore™ for a user.
 * ClarityScore = (AccuracyRate×0.5 + NormalizedVoteSignal×0.3 + ConsistencyRatio×0.2) × 1000
 */
export async function calculateClarityScore(userId) {
  // Gather all answer-type replies
  const answers = await prisma.reply.findMany({
    where: { authorId: userId, replyType: "ANSWER" },
    select: {
      verificationStatus: true,
      votesCount: true,
    },
  });

  const discussions = await prisma.reply.findMany({
    where: { authorId: userId, replyType: "DISCUSSION" },
    select: { id: true },
  });

  const threads = await prisma.thread.findMany({
    where: { authorId: userId },
    select: { id: true },
  });

  const totalAnswers = answers.length;
  const verifiedCorrect = answers.filter(
    (a) => a.verificationStatus === "CORRECT",
  ).length;
  const verifiedIncorrect = answers.filter(
    (a) => a.verificationStatus === "INCORRECT",
  ).length;
  const verifiedTotal = verifiedCorrect + verifiedIncorrect;

  // Answer votes
  const answerUpvotes = answers.reduce(
    (sum, a) => sum + Math.max(0, a.votesCount),
    0,
  );
  const answerDownvotes = answers.reduce(
    (sum, a) => sum + Math.max(0, -a.votesCount),
    0,
  );

  // All topic votes (threads)
  const threadVotes = await prisma.vote.findMany({
    where: { thread: { authorId: userId } },
    select: { value: true },
  });
  const threadUpvotes = threadVotes.filter((v) => v.value > 0).length;
  const threadDownvotes = threadVotes.filter((v) => v.value < 0).length;

  const totalUpvotes = answerUpvotes + threadUpvotes;
  const totalDownvotes = answerDownvotes + threadDownvotes;

  // Compute streak (consecutive correct answers, any incorrect resets it)
  const answerHistory = await prisma.reply.findMany({
    where: {
      authorId: userId,
      replyType: "ANSWER",
      verificationStatus: { in: ["CORRECT", "INCORRECT"] },
    },
    orderBy: { verifiedAt: "asc" },
    select: { verificationStatus: true },
  });

  let streak = 0;
  let maxStreak = 0;
  let currentStreak = 0;
  for (const a of answerHistory) {
    if (a.verificationStatus === "CORRECT") {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  streak = currentStreak; // ongoing streak (resets on incorrect)

  // --- ClarityScore™ formula ---
  // 1. Accuracy Rate (0–1)
  const accuracyRate = verifiedTotal > 0 ? verifiedCorrect / verifiedTotal : 0;

  // 2. Normalized Vote Signal (0–1, capped at 200 net upvotes = 1.0)
  const netVotes = Math.max(0, answerUpvotes - answerDownvotes);
  const normalizedVoteSignal = Math.min(netVotes / 200, 1);

  // 3. Consistency Ratio (0–1): how much of participation is answers
  const totalPosts = totalAnswers + discussions.length + threads.length;
  const consistencyRatio =
    totalPosts > 0 ? Math.min(totalAnswers / totalPosts, 1) : 0;

  const clarityScore =
    (accuracyRate * 0.5 + normalizedVoteSignal * 0.3 + consistencyRatio * 0.2) *
    1000;

  // Upsert stats
  const stats = await prisma.userStats.upsert({
    where: { userId },
    create: {
      userId,
      clarityScore,
      totalAnswers,
      verifiedCorrect,
      verifiedIncorrect,
      totalDiscussions: discussions.length,
      totalThreads: threads.length,
      totalUpvotes,
      totalDownvotes,
      answerStreak: streak,
    },
    update: {
      clarityScore,
      totalAnswers,
      verifiedCorrect,
      verifiedIncorrect,
      totalDiscussions: discussions.length,
      totalThreads: threads.length,
      totalUpvotes,
      totalDownvotes,
      answerStreak: streak,
    },
  });

  await checkAndAwardAchievements(userId, stats);

  return stats;
}

export async function checkAndAwardAchievements(userId, stats) {
  const existing = await prisma.achievement.findMany({
    where: { userId },
    select: { slug: true },
  });
  const earnedSlugs = new Set(existing.map((a) => a.slug));

  const toCreate = ACHIEVEMENTS.filter(
    (a) => !earnedSlugs.has(a.slug) && a.check(stats),
  ).map((a) => ({ userId, slug: a.slug }));

  if (toCreate.length > 0) {
    await prisma.achievement.createMany({ data: toCreate });
  }
}
