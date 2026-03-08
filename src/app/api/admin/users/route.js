import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";
import { requireAdmin } from "@/lib/isAdmin";

/**
 * GET /api/admin/users?search=&page=1&limit=20
 * Paginated user list with roles and stats. Requires admin.
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
    ? { username: { contains: search, mode: "insensitive" } }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        userRoles: { include: { role: true } },
        stats: {
          select: {
            clarityScore: true,
            totalThreads: true,
            totalAnswers: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const result = users.map((u) => ({
    id: u.id,
    clerkUserId: u.clerkUserId,
    username: u.username,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
    roles: u.userRoles.map((ur) => ur.role),
    stats: u.stats,
  }));

  return Response.json({
    users: result,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
