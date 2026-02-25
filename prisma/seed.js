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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
