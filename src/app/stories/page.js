import { prisma } from "@/lib/prisma";
import StoriesPageClient from "./StoriesPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Aspirants Stories — ExamPrep India",
  description:
    "Read inspiring stories from exam aspirants across India. Learn from their preparation strategies, success journeys, and challenges they overcame.",
};

export default async function StoriesPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || null;
  const search = params?.search || null;
  const sort = params?.sort || "latest";

  const where = {};
  if (category) {
    where.category = { slug: category };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "popular"
      ? [{ likesCount: "desc" }, { createdAt: "desc" }]
      : [{ featured: "desc" }, { createdAt: "desc" }];

  const [stories, categories] = await Promise.all([
    prisma.story.findMany({
      where,
      take: 12,
      orderBy,
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        category: {
          select: { id: true, slug: true, label: true, emoji: true, color: true },
        },
      },
    }),
    prisma.storyCategory.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // Serialize dates
  const serializedStories = stories.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <StoriesPageClient
      initialStories={serializedStories}
      categories={categories}
      activeCategory={category}
      initialSearch={search || ""}
      initialSort={sort}
    />
  );
}
