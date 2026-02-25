import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed roles
  const roles = ["USER", "MODERATOR", "ADMIN"];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }

  console.log("Roles seeded successfully.");

  // Seed default tags
  const tags = [
    { slug: "upsc", label: "UPSC" },
    { slug: "mains", label: "Mains" },
    { slug: "prelims", label: "Prelims" },
    { slug: "answer-writing", label: "Answer Writing" },
    { slug: "strategy", label: "Strategy" },
    { slug: "optional", label: "Optional" },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log("Tags seeded successfully.");

  // Seed Dummy Users
  const user1 = await prisma.user.upsert({
    where: { clerkUserId: "user_2p5XbQ..." }, // Dummy ID
    update: {},
    create: {
      clerkUserId: "user_2p5XbQ...",
      username: "upsc_aspirant",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { clerkUserId: "user_dummy_2" },
    update: {},
    create: {
      clerkUserId: "user_dummy_2",
      username: "ias_dreamer",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria",
    },
  });

  console.log("Dummy users seeded.");

  // Seed Rigorous Dummy Threads (100 Threads)
  const baseTitles = [
    "How to manage GS1 and Optional preparation together?",
    "Best resources for Ethics (GS4) paper?",
    "My 1-year strategy for UPSC 2026",
    "How many hours of sleep do you get during peak prep?",
    "Is daily answer writing necessary from the start?",
    "Comparing Geography vs Sociology as an optional",
    "Tips for improving CSAT score",
    "How to read The Hindu efficiently in 45 minutes?",
    "Dealing with burnout during UPSC prep",
    "Current Affairs: Monthly Magazines vs Daily News",
    "Mock tests: When to start full-length tests?",
    "Importance of NCERTs for Prelims 2025",
    "How to make crisp notes for Mains?",
    "Managing mental health during the long journey",
    "Weekly current affairs discussion - Feb 2026",
  ];

  const allTags = await prisma.tag.findMany();
  const tagIds = allTags.map(t => t.id);

  console.log("Starting rigorous thread seeding (100 threads)...");

  for (let i = 0; i < 100; i++) {
    const threadId = `00000000-0000-0000-0000-000000000${i.toString().padStart(3, "0")}`;
    const title = i < baseTitles.length ? baseTitles[i] : `Rigorous Test Thread #${i + 1}: ${baseTitles[i % baseTitles.length]}`;
    
    const thread = await prisma.thread.upsert({
      where: { id: threadId },
      update: {},
      create: {
        id: threadId,
        title: title,
        content: `This is high-rigor test content for thread #${i + 1}. We are generating 100 of these to ensure the infinite scroll and database queries remain performant under load. UPSC preparation requires this kind of endurance!`,
        authorId: i % 2 === 0 ? user1.id : user2.id,
        tags: {
          create: [
            { tagId: tagIds[i % tagIds.length] },
            { tagId: tagIds[(i + 1) % tagIds.length] },
          ],
        },
      },
    });

    // Add 10-25 replies to EVERY thread for rigorous testing
    const existingReplies = await prisma.reply.count({ where: { threadId: thread.id } });
    if (existingReplies < 10) {
      const replyCount = 10 + Math.floor(Math.random() * 15);
      const replyData = [];
      for (let j = 1; j <= replyCount; j++) {
        replyData.push({
          content: `Rigorous test reply #${j} for thread #${i + 1}. Testing pagination and nested structures at scale.`,
          threadId: thread.id,
          authorId: (i + j) % 2 === 0 ? user1.id : user2.id,
          votesCount: Math.floor(Math.random() * 100),
          createdAt: new Date(Date.now() - (100 - i) * 3600000 - j * 60000), // Staggered times
        });
      }
      await prisma.reply.createMany({ data: replyData });
    }
    
    if (i % 10 === 0) console.log(`Seeded ${i} threads...`);
  }

  console.log("Rigorous dummy threads and replies seeded (100 threads, ~2000 replies total).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
