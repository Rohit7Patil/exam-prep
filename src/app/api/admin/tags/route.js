import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";
import { requireAdmin } from "@/lib/isAdmin";

/**
 * GET /api/admin/tags
 * List all tags with thread usage count. Requires admin.
 */
export async function GET() {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const tags = await prisma.tag.findMany({
    orderBy: { label: "asc" },
    include: {
      _count: { select: { threads: true } },
    },
  });

  const result = tags.map((t) => ({
    id: t.id,
    slug: t.slug,
    label: t.label,
    createdAt: t.createdAt,
    threadCount: t._count.threads,
  }));

  return Response.json(result);
}

/**
 * POST /api/admin/tags
 * Create a new tag. Body: { slug, label }
 */
export async function POST(req) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  try {
    const { slug, label } = await req.json();

    if (!slug || slug.length < 2 || slug.length > 20) {
      return Response.json(
        { error: "Slug must be 2–20 characters" },
        { status: 400 },
      );
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return Response.json(
        { error: "Slug must be lowercase letters, numbers, and hyphens only" },
        { status: 400 },
      );
    }

    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      return Response.json({ error: "Tag already exists" }, { status: 409 });
    }

    const tag = await prisma.tag.create({
      data: {
        slug,
        label: label?.trim() || slug.replace(/-/g, " "),
      },
    });

    return Response.json(tag, { status: 201 });
  } catch (error) {
    console.error("Create tag error:", error);
    return Response.json({ error: "Failed to create tag" }, { status: 500 });
  }
}
