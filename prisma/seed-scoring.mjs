/**
 * Scoring Seed Script — Populates dummy Answer-type replies with verifications
 * to demonstrate the ClarityScore™ system.
 *
 * Run with: node prisma/seed-scoring.mjs
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { slug: "first-verified", check: (s) => s.verifiedCorrect >= 1 },
  { slug: "bronze-starter", check: (s) => s.clarityScore >= 300 },
  { slug: "silver-analyst", check: (s) => s.clarityScore >= 600 },
  { slug: "gold-scholar",   check: (s) => s.clarityScore >= 800 },
  { slug: "sharp-shot",     check: (s) => s.verifiedCorrect >= 10 },
  { slug: "on-a-roll",      check: (s) => s.answerStreak >= 5 },
  { slug: "community-star", check: (s) => s.totalUpvotes - s.totalDownvotes >= 50 },
  { slug: "prolific",       check: (s) => s.totalAnswers >= 25 },
];

async function computeScore(userId) {
  const answers = await prisma.reply.findMany({
    where: { authorId: userId, replyType: "ANSWER" },
    select: { verificationStatus: true, votesCount: true },
  });

  const discussions = await prisma.reply.count({
    where: { authorId: userId, replyType: "DISCUSSION" },
  });

  const threads = await prisma.thread.count({ where: { authorId: userId } });

  const verifiedCorrect  = answers.filter(a => a.verificationStatus === "CORRECT").length;
  const verifiedIncorrect = answers.filter(a => a.verificationStatus === "INCORRECT").length;
  const verifiedTotal = verifiedCorrect + verifiedIncorrect;

  const netAnswerUpvotes = answers.reduce((s, a) => s + Math.max(0, a.votesCount), 0);
  const netAnswerDownvotes = answers.reduce((s, a) => s + Math.max(0, -a.votesCount), 0);

  const accuracyRate          = verifiedTotal > 0 ? verifiedCorrect / verifiedTotal : 0;
  const normalizedVoteSignal  = Math.min(netAnswerUpvotes / 200, 1);
  const totalPosts            = answers.length + discussions + threads;
  const consistencyRatio      = totalPosts > 0 ? Math.min(answers.length / totalPosts, 1) : 0;

  const clarityScore = (accuracyRate * 0.5 + normalizedVoteSignal * 0.3 + consistencyRatio * 0.2) * 1000;

  // Streak: current run of CORRECT without INCORRECT
  const history = await prisma.reply.findMany({
    where: { authorId: userId, replyType: "ANSWER", verificationStatus: { in: ["CORRECT", "INCORRECT"] } },
    orderBy: { verifiedAt: "asc" },
    select: { verificationStatus: true },
  });
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].verificationStatus === "CORRECT") streak++;
    else break;
  }

  const stats = await prisma.userStats.upsert({
    where: { userId },
    create: {
      userId, clarityScore,
      totalAnswers: answers.length,
      verifiedCorrect, verifiedIncorrect,
      totalDiscussions: discussions,
      totalThreads: threads,
      totalUpvotes: netAnswerUpvotes,
      totalDownvotes: netAnswerDownvotes,
      answerStreak: streak,
    },
    update: {
      clarityScore,
      totalAnswers: answers.length,
      verifiedCorrect, verifiedIncorrect,
      totalDiscussions: discussions,
      totalThreads: threads,
      totalUpvotes: netAnswerUpvotes,
      totalDownvotes: netAnswerDownvotes,
      answerStreak: streak,
    },
  });

  // Award achievements
  const earned = await prisma.achievement.findMany({ where: { userId }, select: { slug: true } });
  const earnedSet = new Set(earned.map(a => a.slug));
  const toCreate = ACHIEVEMENTS.filter(a => !earnedSet.has(a.slug) && a.check(stats)).map(a => ({ userId, slug: a.slug }));
  if (toCreate.length > 0) {
    await prisma.achievement.createMany({ data: toCreate });
    console.log(`  🏆 Awarded achievements: ${toCreate.map(a => a.slug).join(", ")}`);
  }

  return stats;
}

async function main() {
  console.log("🌱 Seeding scoring data...\n");

  // Get all existing users and threads
  const users = await prisma.user.findMany({ select: { id: true, username: true } });
  const threads = await prisma.thread.findMany({
    select: { id: true, authorId: true },
    take: 10,
  });

  if (users.length === 0) {
    console.log("❌ No users found. Sign in to the app first to create your user, then re-run this script.");
    return;
  }
  if (threads.length === 0) {
    console.log("❌ No threads found. Create some threads first, then re-run this script.");
    return;
  }

  console.log(`Found ${users.length} users and ${threads.length} threads.\n`);

  // Answer templates keyed by profile type
  const answerSets = {
    expert: {
      statuses: ["CORRECT", "CORRECT", "CORRECT", "CORRECT", "CORRECT", "CORRECT", "CORRECT", "CORRECT", "CORRECT", "CORRECT", "INCORRECT"],
      votesRange: [8, 25],
      count: 11,
    },
    good: {
      statuses: ["CORRECT", "CORRECT", "CORRECT", "CORRECT", "CORRECT", "CORRECT", "INCORRECT", "INCORRECT"],
      votesRange: [3, 12],
      count: 8,
    },
    average: {
      statuses: ["CORRECT", "CORRECT", "CORRECT", "INCORRECT", "INCORRECT"],
      votesRange: [1, 6],
      count: 5,
    },
    beginner: {
      statuses: ["CORRECT", "INCORRECT", "INCORRECT"],
      votesRange: [0, 3],
      count: 3,
    },
  };

  const profiles = ["expert", "good", "average", "beginner"];

  const contentTemplates = [
    "For UPSC prelims, the most effective strategy is to focus on NCERTs first (Class 6-12) for building conceptual clarity, then move to standard references like Laxmikanth for polity, Spectrum for modern history, and Geography NCERT + GC Leong. Current affairs from The Hindu or Indian Express — 1 year back is usually sufficient.",
    "The key difference between Fundamental Rights (Part III) and Directive Principles (Part IV) is enforceability. FR are justiciable — you can approach courts if violated. DPSPs are non-justiciable guidelines for the State. However Article 37 says DPSPs are 'fundamental in governance' and the State must apply them. The Minerva Mills case (1980) balanced both.",
    "For UPSC Mains answer writing, follow the IDEA framework: I — Introduction (context hook), D — Definition/dimensions, E — Evidence/examples (2-3 specific facts), A — Analysis (multiple perspectives), then conclude with a way forward. Aim for 150-200 words per 10-mark question, 250-300 for 15-mark.",
    "The 73rd and 74th Constitutional Amendments (1992) are the backbone of decentralization in India. The 73rd created the 3-tier Panchayati Raj system (village, intermediate, district level) with mandatory elections, reservation for SC/ST/Women (minimum 1/3rd), and devolution of 29 subjects listed in the 11th Schedule.",
    "Carbon credits work through a cap-and-trade mechanism under frameworks like the Kyoto Protocol. Each credit represents 1 metric ton of CO2 reduced/sequestered. Countries/companies exceeding their caps buy credits from those under their limits. India participates through CDM (Clean Development Mechanism) projects — renewable energy, forestry, etc.",
    "The difference between Money Bill (Article 110) and Finance Bill is crucial. A Money Bill deals ONLY with taxation, government borrowing, Consolidated Fund appropriations. It can ONLY originate in Lok Sabha; Rajya Sabha can only recommend changes (not mandatory) within 14 days. Finance Bill includes Money Bill provisions PLUS other financial matters.",
    "Critically, the Supreme Court in Kesavananda Bharati v. State of Kerala (1973) established the 'Basic Structure Doctrine' — Parliament can amend any part of the Constitution (including Fundamental Rights) EXCEPT the basic structure. The 13-judge bench identified basic structure elements: supremacy of Constitution, republican/democratic form, separation of powers, federalism, judicial review.",
    "UPSC Mains GS-3 Economy questions require linking micro concepts to macro outcomes. For inflation: RBI uses monetary policy tools (repo rate, CRR, SLR) for demand-side management while government uses supply-side measures (import duties, buffer stocks, MSP). Current inflation in India is primarily food-driven — structural reforms in agriculture supply chain are key.",
    "Protected Area Network in India: Wildlife Sanctuaries (543), National Parks (106), Tiger Reserves (54 under Project Tiger), Biosphere Reserves (18 notionally designated, 12 internationally recognized). Key distinction: NPs have the highest protection — no human activity including grazing; Sanctuaries allow some controlled human activities.",
    "For Ethics GS-4, the case study approach: Always identify all stakeholders (direct/indirect), list the ethical dilemmas present, reference relevant frameworks (Deontology/Consequentialism/Virtue Ethics), cite the AIS conduct rules or any relevant government policy, then give a balanced decision with clear reasoning. Never give one-sided answers.",
    "The difference between Revenue Deficit, Fiscal Deficit, and Primary Deficit: Revenue Deficit = Revenue Expenditure - Revenue Receipts (indicates government is borrowing for current consumption). Fiscal Deficit = Total Expenditure - Total Revenue (excluding borrowings). Primary Deficit = Fiscal Deficit - Interest payments (shows current borrowing excluding debt servicing burden).",
    "Non-Cooperation Movement (1920-22) was Gandhi's first mass movement against the British. Key features: boycott of British goods, courts, schools; surrender of titles and honours; hartals. It was called off after Chauri Chaura incident (Feb 1922) where a police station was burned killing 22 constables. Gandhi's reasoning: violence defeats the purpose of civil disobedience.",
  ];

  let totalAnswersCreated = 0;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const profile = profiles[i % profiles.length];
    const template = answerSets[profile];

    console.log(`👤 Seeding user: ${user.username || user.id.slice(0, 8)} (profile: ${profile})`);

    // Skip if user is thread author for that thread (can't reply own thread)
    const availableThreads = threads.filter(t => t.authorId !== user.id);
    if (availableThreads.length === 0) {
      console.log(`  ⚠️  Skipping — this user authored all threads`);
      continue;
    }

    const count = Math.min(template.count, availableThreads.length * 2);

    for (let j = 0; j < count; j++) {
      const thread = availableThreads[j % availableThreads.length];
      const status = template.statuses[j % template.statuses.length];
      const votes = template.votesRange[0] + Math.floor(Math.random() * (template.votesRange[1] - template.votesRange[0]));
      const content = contentTemplates[(i * count + j) % contentTemplates.length];
      const daysAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date(Date.now() - daysAgo * 86400000);
      const verifiedAt = new Date(createdAt.getTime() + Math.random() * 86400000 * 3);

      try {
        await prisma.reply.create({
          data: {
            content,
            threadId: thread.id,
            authorId: user.id,
            replyType: "ANSWER",
            verificationStatus: status,
            verifiedAt,
            verifiedById: null,
            votesCount: votes,
            createdAt,
            updatedAt: createdAt,
          },
        });
        totalAnswersCreated++;
      } catch (err) {
        // May already exist or thread constraints
        console.log(`  ⚠️  Skipped reply: ${err.message.slice(0, 60)}`);
      }
    }

    // Also update thread repliesCount
    for (const thread of availableThreads) {
      const replyCount = await prisma.reply.count({ where: { threadId: thread.id } });
      await prisma.thread.update({ where: { id: thread.id }, data: { repliesCount: replyCount } });
    }

    // Calculate score
    const stats = await computeScore(user.id);
    console.log(`  ⚡ ClarityScore™: ${Math.round(stats.clarityScore)} (${stats.verifiedCorrect} correct / ${stats.totalAnswers} answers)`);
  }

  console.log(`\n✅ Done! Created ${totalAnswersCreated} answer replies.`);
  console.log(`📊 Visit http://localhost:3000/leaderboard to see the rankings.`);
  console.log(`👤 Visit http://localhost:3000/profile/[your-user-id] to see your profile.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
