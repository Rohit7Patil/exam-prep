import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";
import { requireAdmin } from "@/lib/isAdmin";

/**
 * GET /api/admin/replies?page=1&status=PENDING|CORRECT|INCORRECT|DISPUTED
 * Paginated list of replies with author + thread info. Requires admin.
 */
export async function GET(req) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
  );
  const skip = (page - 1) * limit;
  const status = searchParams.get("status");

  const where = {};
  if (
    status &&
    ["PENDING", "CORRECT", "INCORRECT", "DISPUTED"].includes(status)
  ) {
    where.verificationStatus = status;
  }

  const [replies, total] = await Promise.all([
    prisma.reply.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        thread: { select: { id: true, title: true } },
      },
    }),
    prisma.reply.count({ where }),
  ]);

  return Response.json({
    replies,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
