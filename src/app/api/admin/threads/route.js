import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";
import { requireAdmin } from "@/lib/isAdmin";

/**
 * GET /api/admin/threads?page=1&search=
 * Paginated thread list with author, tags, counts. Requires admin.
 */
export async function GET(req) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
  );
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [threads, total] = await Promise.all([
    prisma.thread.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        tags: { include: { tag: { select: { slug: true, label: true } } } },
      },
    }),
    prisma.thread.count({ where }),
  ]);

  const result = threads.map((t) => ({
    ...t,
    tags: t.tags.map((tt) => tt.tag),
  }));

  return Response.json({
    threads: result,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
