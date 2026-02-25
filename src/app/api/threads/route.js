import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * GET /api/threads?tag=&search=&page=1&limit=20
 *
 * List threads with optional tag filter, search, and pagination.
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

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

  const [threads, total] = await Promise.all([
    prisma.thread.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        tags: {
          include: {
            tag: { select: { slug: true, label: true } },
          },
        },
      },
    }),
    prisma.thread.count({ where }),
  ]);

  // Flatten tags for cleaner response
  const result = threads.map((thread) => ({
    ...thread,
    tags: thread.tags.map((tt) => tt.tag),
  }));

  return Response.json({
    threads: result,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

/**
 * POST /api/threads
 *
 * Create a new thread. Requires authentication.
 * Body: { title: string, content: string, tagIds: string[] }
 */
export async function POST(req) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  try {
    const { title, content, tagIds } = await req.json();

    // Validate
    if (!title?.trim()) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }
    if (!content?.trim()) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }
    if (!Array.isArray(tagIds) || tagIds.length < 1 || tagIds.length > 5) {
      return Response.json(
        { error: "Select between 1 and 5 tags" },
        { status: 400 }
      );
    }

    // Verify tags exist
    const existingTags = await prisma.tag.findMany({
      where: { id: { in: tagIds } },
    });

    if (existingTags.length !== tagIds.length) {
      return Response.json(
        { error: "One or more tags are invalid" },
        { status: 400 }
      );
    }

    const thread = await prisma.thread.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        authorId: user.id,
        tags: {
          create: tagIds.map((tagId) => ({
            tagId,
          })),
        },
      },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        tags: {
          include: {
            tag: { select: { slug: true, label: true } },
          },
        },
      },
    });

    return Response.json(
      {
        ...thread,
        tags: thread.tags.map((tt) => tt.tag),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create thread error:", error);
    return Response.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}
