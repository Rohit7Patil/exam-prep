import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StoryDetailClient from "./StoryDetailClient";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/syncUser";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const story = await prisma.story.findUnique({
    where: { slug },
    select: { title: true, excerpt: true },
  });

  if (!story) return { title: "Story Not Found" };

  return {
    title: `${story.title} — Aspirants Stories | ExamPrep India`,
    description: story.excerpt || story.title,
  };
}

export default async function StoryDetailPage({ params }) {
  const { slug } = await params;

  const story = await prisma.story.update({
    where: { slug },
    data: { viewsCount: { increment: 1 } },
    include: {
      author: {
        select: { id: true, username: true, avatarUrl: true, createdAt: true },
      },
      category: {
        select: { id: true, slug: true, label: true, emoji: true, color: true },
      },
    },
  }).catch(() => null);

  if (!story) notFound();

  // Check if current user has liked
  let hasLiked = false;
  const clerkUser = await currentUser();
  if (clerkUser) {
    const dbUser = await syncUser(clerkUser);
    if (dbUser) {
      const like = await prisma.storyLike.findUnique({
        where: {
          userId_storyId: {
            userId: dbUser.id,
            storyId: story.id,
          },
        },
      });
      hasLiked = !!like;
    }
  }

  // Related stories (same category, excluding current)
  const relatedStories = story.categoryId
    ? await prisma.story.findMany({
        where: {
          categoryId: story.categoryId,
          id: { not: story.id },
        },
        take: 3,
        orderBy: { likesCount: "desc" },
        include: {
          author: {
            select: { id: true, username: true, avatarUrl: true },
          },
          category: {
            select: { id: true, slug: true, label: true, emoji: true, color: true },
          },
        },
      })
    : [];

  const serializedStory = {
    ...story,
    createdAt: story.createdAt.toISOString(),
    updatedAt: story.updatedAt.toISOString(),
  };

  const serializedRelated = relatedStories.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <StoryDetailClient
      story={serializedStory}
      hasLiked={hasLiked}
      relatedStories={serializedRelated}
    />
  );
}
