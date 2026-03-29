import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import ThreadPageClient from "./ThreadPageClient";

export default async function ThreadPage({ params }) {
  const { thread: threadParam } = await params;
  const decodedParam = decodeURIComponent(threadParam);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(decodedParam);

  const threadInclude = {
    author: {
      select: { id: true, username: true, avatarUrl: true },
    },
    tags: {
      include: {
        tag: { select: { id: true, slug: true, label: true } },
      },
    },
    replies: {
      where: { parentId: null },
      take: 10,
      orderBy: [{ pinned: "desc" }, { votesCount: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true, stats: { select: { clarityScore: true } } },
        },
        votes: true,
        children: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, username: true, avatarUrl: true, stats: { select: { clarityScore: true } } },
            },
            votes: true,
            children: {
              orderBy: { createdAt: "asc" },
              include: {
                author: {
                  select: { id: true, username: true, avatarUrl: true, stats: { select: { clarityScore: true } } },
                },
                votes: true,
              },
            },
          },
        },
      },
    },
  };

  // Try slug first, then fallback to ID
  let thread = await prisma.thread.findUnique({
    where: { slug: decodedParam },
    include: threadInclude,
  });

  if (!thread && isUuid) {
    thread = await prisma.thread.findUnique({
      where: { id: decodedParam },
      include: threadInclude,
    });
  }

  if (!thread) notFound();

  // Increment view count (fire-and-forget)
  prisma.thread.update({
    where: { id: thread.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {});


  // Get current user's votes if authenticated
  let userVotes = {};
  const clerkUser = await currentUser();

  if (clerkUser) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    if (dbUser) {
      const allReplyIds = getAllReplyIds(thread.replies);
      const votes = await prisma.vote.findMany({
        where: {
          userId: dbUser.id,
          OR: [
            { threadId: thread.id },
            ...(allReplyIds.length > 0
              ? [{ replyId: { in: allReplyIds } }]
              : []),
          ],
        },
      });

      for (const vote of votes) {
        if (vote.threadId) {
          userVotes[`thread_${vote.threadId}`] = vote.value;
        }
        if (vote.replyId) {
          userVotes[`reply_${vote.replyId}`] = vote.value;
        }
      }
    }
  }

  // Serialize for client component
  const threadData = {
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
    replies: serializeReplies(thread.replies),
  };

  // Resolve current user's DB id and admin status
  let currentUserId = null;
  let isAdmin = false;
  if (clerkUser) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      select: { id: true },
    });
    if (dbUser) {
      currentUserId = dbUser.id;
      const adminRole = await prisma.userRole.findFirst({
        where: {
          userId: dbUser.id,
          role: { name: { in: ["admin", "ADMIN"] } },
        },
      });
      isAdmin = !!adminRole;
    }
  }

  return <ThreadPageClient thread={threadData} userVotes={userVotes} currentUserId={currentUserId} isAdmin={isAdmin} />;
}

function getAllReplyIds(replies) {
  const ids = [];
  for (const reply of replies) {
    ids.push(reply.id);
    if (reply.children?.length) {
      ids.push(...getAllReplyIds(reply.children));
    }
  }
  return ids;
}

function serializeReplies(replies) {
  return replies.map((reply) => ({
    id: reply.id,
    content: reply.content,
    pinned: reply.pinned,
    votesCount: reply.votesCount,
    replyType: reply.replyType,
    verificationStatus: reply.verificationStatus,
    authorId: reply.authorId,
    createdAt: reply.createdAt.toISOString(),
    updatedAt: reply.updatedAt.toISOString(),
    author: reply.author,
    replies: reply.children ? serializeReplies(reply.children) : [],
  }));
}
