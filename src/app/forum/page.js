import { prisma } from "@/lib/prisma";
import ForumPageClient from "./ForumPageClient";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/syncUser";

export default async function ForumPage({ searchParams }) {
  const clerkUser = await currentUser();
  if (clerkUser) {
    await syncUser(clerkUser);
  }

  const params = await searchParams;
  const tag = params?.tag || null;
  const search = params?.search || null;

  // Build where clause
  const where = {};

  if (tag) {
    where.tags = {
      some: {
        tag: { slug: tag },
      },
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const [threads, tags] = await Promise.all([
    prisma.thread.findMany({
      where,
      take: 20,
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        tags: {
          include: {
            tag: { select: { id: true, slug: true, label: true } },
          },
        },
      },
    }),
    prisma.tag.findMany({
      orderBy: { label: "asc" },
    }),
  ]);

  // Flatten tags for cleaner data shape
  const formattedThreads = threads.map((thread) => ({
    id: thread.id,
    title: thread.title,
    content: thread.content,
    pinned: thread.pinned,
    viewsCount: thread.viewsCount,
    repliesCount: thread.repliesCount,
    votesCount: thread.votesCount,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    author: thread.author,
    tags: thread.tags.map((tt) => tt.tag.slug),
  }));

  return (
    <ForumPageClient
      initialThreads={formattedThreads}
      tags={tags}
      activeTag={tag}
      initialSearch={search || ""}
    />
  );
}
