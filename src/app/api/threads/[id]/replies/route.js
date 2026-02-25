import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * GET /api/threads/[id]/replies?page=1&limit=20&sort=top
 *
 * List replies for a thread with pagination and sorting.
 */
export async function GET(req, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const sort = searchParams.get("sort") || "top"; // 'top' or 'new'
  const skip = (page - 1) * limit;

  try {
    const orderBy = [];
    if (sort === "new") {
      orderBy.push({ pinned: "desc" });
      orderBy.push({ createdAt: "desc" });
    } else {
      // Default: top (votes)
      orderBy.push({ pinned: "desc" });
      orderBy.push({ votesCount: "desc" });
      orderBy.push({ createdAt: "desc" });
    }

    const [replies, total] = await Promise.all([
      prisma.reply.findMany({
        where: { threadId: id, parentId: null },
        skip,
        take: limit,
        orderBy,
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
      }),
      prisma.reply.count({ where: { threadId: id, parentId: null } }),
    ]);

    return Response.json({
      replies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch replies error:", error);
    return Response.json(
      { error: "Failed to fetch replies" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/threads/[id]/replies
 *
 * Create a top-level reply on a thread. Requires authentication.
 * Body: { content: string }
 */
export async function POST(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const { id } = await params;

  try {
    const { content } = await req.json();

    if (!content?.trim()) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

    // Verify thread exists
    const thread = await prisma.thread.findUnique({ where: { id } });
    if (!thread) {
      return Response.json({ error: "Thread not found" }, { status: 404 });
    }

    // Author cannot reply to own thread
    if (thread.authorId === user.id) {
      return Response.json(
        { error: "Cannot reply to your own thread" },
        { status: 403 }
      );
    }

    // Create reply and increment thread reply count in a transaction
    const [reply] = await prisma.$transaction([
      prisma.reply.create({
        data: {
          content: content.trim(),
          threadId: id,
          authorId: user.id,
        },
        include: {
          author: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      }),
      prisma.thread.update({
        where: { id },
        data: { repliesCount: { increment: 1 } },
      }),
    ]);

    return Response.json(reply, { status: 201 });
  } catch (error) {
    console.error("Create reply error:", error);
    return Response.json(
      { error: "Failed to create reply" },
      { status: 500 }
    );
  }
}
