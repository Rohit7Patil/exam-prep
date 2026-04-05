import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";
import { isAdmin } from "@/lib/isAdmin";
import { slugify } from "@/lib/slugify";

/**
 * GET /api/story-categories
 * List all story categories.
 */
export async function GET() {
  const categories = await prisma.storyCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return Response.json({ categories });
}

/**
 * POST /api/story-categories
 * Create a new story category (admin only).
 * Body: { label, emoji?, color? }
 */
export async function POST(req) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const admin = await isAdmin(user);
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { label, emoji, color } = await req.json();

    if (!label?.trim()) {
      return Response.json({ error: "Label is required" }, { status: 400 });
    }

    const slug = slugify(label);

    // Check uniqueness
    const existing = await prisma.storyCategory.findFirst({
      where: { slug },
    });
    if (existing) {
      return Response.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    // Get next sort order
    const maxOrder = await prisma.storyCategory.aggregate({
      _max: { sortOrder: true },
    });

    const category = await prisma.storyCategory.create({
      data: {
        slug,
        label: label.trim(),
        emoji: emoji || "📖",
        color: color || "#6366f1",
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });

    return Response.json(category, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return Response.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
