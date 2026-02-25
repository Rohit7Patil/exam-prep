import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * GET /api/tags
 *
 * List all tags, ordered by label.
 */
export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: { label: "asc" },
  });

  return Response.json(tags);
}

/**
 * POST /api/tags
 *
 * Create a new tag. Requires authentication.
 * Body: { slug: string, label: string }
 */
export async function POST(req) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  try {
    const { slug, label } = await req.json();

    // Validate slug
    if (!slug || slug.length < 2 || slug.length > 20) {
      return Response.json(
        { error: "Slug must be 2–20 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return Response.json(
        { error: "Slug must contain only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    // Check uniqueness
    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      return Response.json(
        { error: "Tag already exists" },
        { status: 409 }
      );
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
    return Response.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
