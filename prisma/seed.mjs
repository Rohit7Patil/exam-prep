/**
 * Production Testing Seed Script
 * Generates a large volume of realistic dummy data (Users, Threads, Replies, Stats)
 * to test the application under load and populate the leaderboard.
 * 
 * Run with: node prisma/seed-production.mjs
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

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

const avatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Nolan",
];

const mockUsers = Array.from({ length: 25 }, (_, i) => ({
  id: crypto.randomUUID(),
  clerkUserId: `fake_clerk_${Date.now()}_${i}`,
  username: `Aspirant${Math.floor(Math.random() * 1000)}${i}`,
  avatarUrl: avatars[i % avatars.length],
  createdAt: new Date(Date.now() - Math.random() * 90 * 86400000), // Up to 90 days ago
}));

const threadTitles = [
  "Best strategy for UPSC Prelims 2025?",
  "How to tackle Ethics GS-4 case studies?",
  "Is the Hindu better than Indian Express for daily current affairs?",
  "My marks are stuck at 85 in mock tests. Help!",
  "Detailed analysis of the new economic survey",
  "Geography optional resources and booklist",
  "How many hours do you really need to study?",
  "Should I quit my job to prepare full time?",
  "Interview transcripts for the latest batch",
  "Which test series is most accurate?",
];

const replyContents = [
  "Focus on the basics. NCERTs are your best friend.",
  "I completely disagree, you need standard reference books first.",
  "This is a great question. Based on last year's trend...",
  "Don't worry about mock scores right now, focus on syllabus coverage.",
  "Can someone explain the concept of fiscal deficit again?",
  "I found Vision IAS materials to be the most comprehensive.",
  "It's not about the hours, it's about the consistency. 6-8 dedicated hours is plenty.",
  "Here is a detailed breakdown of how to structure your Mains answer...",
  "Thanks for sharing this, very helpful!",
  "Could you elaborate on the second point?",
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
      clarityScore, totalAnswers: answers.length, verifiedCorrect, verifiedIncorrect,
      totalDiscussions: discussions, totalThreads: threads, totalUpvotes: netAnswerUpvotes,
      totalDownvotes: netAnswerDownvotes, answerStreak: streak,
    },
  });

  const earned = await prisma.achievement.findMany({ where: { userId }, select: { slug: true } });
  const earnedSet = new Set(earned.map(a => a.slug));
  const toCreate = ACHIEVEMENTS.filter(a => !earnedSet.has(a.slug) && a.check(stats)).map(a => ({ userId, slug: a.slug }));
  if (toCreate.length > 0) {
    await prisma.achievement.createMany({ data: toCreate });
  }
}

async function main() {
  console.log("🌱 Starting Production DB Seeding...");

  console.log("Seeding Roles and Tags...");
  const roles = ["USER", "MODERATOR", "ADMIN"];
  for (const role of roles) {
    await prisma.role.upsert({ where: { name: role }, update: {}, create: { name: role } });
  }
  const dbRoleUser = await prisma.role.findUnique({ where: { name: "USER" } });

  const tags = [
    { slug: "upsc", label: "UPSC" },
    { slug: "mains", label: "Mains" },
    { slug: "prelims", label: "Prelims" },
    { slug: "answer-writing", label: "Answer Writing" },
    { slug: "strategy", label: "Strategy" },
    { slug: "optional", label: "Optional" },
  ];
  for (const tag of tags) {
    await prisma.tag.upsert({ where: { slug: tag.slug }, update: {}, create: tag });
  }
  const dbTags = await prisma.tag.findMany();

  // 1. Create Users
  console.log(`Creating ${mockUsers.length} dummy users...`);
  await prisma.user.createMany({ data: mockUsers, skipDuplicates: true });
  
  for (const u of mockUsers) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: u.id, roleId: dbRoleUser.id } },
      update: {},
      create: { userId: u.id, roleId: dbRoleUser.id }
    });
  }

  // 2. Create Threads
  console.log("Creating threads...");
  const createdThreads = [];
  for (let i = 0; i < 40; i++) {
    const author = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const title = threadTitles[i % threadTitles.length] + (i > 9 ? ` (Part ${Math.floor(i/10)+1})` : "");
    const thread = await prisma.thread.create({
      data: {
        title,
        content: `I am looking for some advice regarding ${title.toLowerCase()}. Any thoughts?`,
        author: { connect: { id: author.id } },
        createdAt: new Date(Date.now() - Math.random() * 30 * 86400000),
        tags: {
          create: [
            { tag: { connect: { id: dbTags[i % dbTags.length].id } } },
            { tag: { connect: { id: dbTags[(i + 1) % dbTags.length].id } } },
          ]
        }
      }
    });
    createdThreads.push(thread);
  }

  // 3. Create Replies (Answers & Discussions)
  console.log("Creating replies and verifying them...");
  let replyCount = 0;
  for (const thread of createdThreads) {
    const numReplies = Math.floor(Math.random() * 15) + 1; // 1 to 15 replies per thread
    
    for (let i = 0; i < numReplies; i++) {
      // Pick random author (not the thread author to allow verifications realistically)
      const availableAuthors = mockUsers.filter(u => u.id !== thread.authorId);
      const author = availableAuthors[Math.floor(Math.random() * availableAuthors.length)];
      
      const isAnswer = Math.random() > 0.3; // 70% chance of being an Answer
      const statusRoll = Math.random();
      let status = "PENDING";
      let verifiedAt = null;

      if (isAnswer) {
        if (statusRoll > 0.8) { status = "INCORRECT"; verifiedAt = new Date(); }
        else if (statusRoll > 0.2) { status = "CORRECT"; verifiedAt = new Date(); }
      }

      const votesCount = Math.floor(Math.random() * 20);
      const voteData = Array.from({ length: votesCount }).map((_, v) => ({
        value: 1,
        user: { connect: { id: mockUsers[(v + i) % mockUsers.length].id } }
      }));

      await prisma.reply.create({
        data: {
          thread: { connect: { id: thread.id } },
          author: { connect: { id: author.id } },
          content: replyContents[Math.floor(Math.random() * replyContents.length)],
          replyType: isAnswer ? "ANSWER" : "DISCUSSION",
          verificationStatus: isAnswer ? status : undefined,
          verifiedAt: verifiedAt ? verifiedAt : undefined,
          verifiedBy: verifiedAt ? { connect: { id: thread.authorId } } : undefined,
          votesCount,
          votes: { create: voteData },
          createdAt: new Date(thread.createdAt.getTime() + Math.random() * 86400000), // Up to 1 day after thread
        }
      });
      replyCount++;
    }
    
    // Update thread reply count
    await prisma.thread.update({
      where: { id: thread.id },
      data: { repliesCount: numReplies }
    });
  }

  console.log(`Created ${replyCount} replies.`);

  // 4. Calculate Scores and Achievements
  console.log("Calculating ClarityScores & awarding achievements... (this might take a minute)");
  for (const user of mockUsers) {
    await computeScore(user.id);
  }

  console.log("✅ Production seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
