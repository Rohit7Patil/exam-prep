import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

/**
 * GET /api/threads/[id]
 *
 * Get a single thread with all details: author, tags, nested replies, votes.
 * If the user is authenticated, also includes their vote on the thread/replies.
 */
export async function GET(req, { params }) {
  const { id } = await params;

  try {
    // Increment view count
    const thread = await prisma.thread.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        tags: {
          include: {
            tag: { select: { id: true, slug: true, label: true } },
          },
        },
        replies: {
          where: { parentId: null }, // Only top-level replies
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, username: true, avatarUrl: true },
            },
            children: {
              orderBy: { createdAt: "asc" },
              include: {
                author: {
                  select: { id: true, username: true, avatarUrl: true },
                },
                children: {
                  orderBy: { createdAt: "asc" },
                  include: {
                    author: {
                      select: { id: true, username: true, avatarUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!thread) {
      return Response.json({ error: "Thread not found" }, { status: 404 });
    }

    // Check if the current user has voted on this thread or any replies
    let userVotes = {};
    const clerkUser = await currentUser();

    if (clerkUser) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkUserId: clerkUser.id },
      });

      if (dbUser) {
        const votes = await prisma.vote.findMany({
          where: {
            userId: dbUser.id,
            OR: [
              { threadId: id },
              {
                replyId: {
                  in: getAllReplyIds(thread.replies),
                },
              },
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

    return Response.json({
      ...thread,
      tags: thread.tags.map((tt) => tt.tag),
      userVotes,
    });
  } catch (error) {
    console.error("Get thread error:", error);
    return Response.json(
      { error: "Thread not found" },
      { status: 404 }
    );
  }
}

/**
 * Recursively collect all reply IDs from nested replies.
 */
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
