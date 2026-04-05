import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";
import { slugify } from "@/lib/slugify";

/**
 * Generates a unique slug for a story based on its title.
 */
async function generateUniqueSlug(title) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.story.findFirst({
      where: { slug },
    });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

/**
 * GET /api/stories?category=&search=&sort=latest|popular&page=1&limit=12
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "latest";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
  const skip = (page - 1) * limit;

  const where = {};

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "popular"
      ? [{ likesCount: "desc" }, { createdAt: "desc" }]
      : [{ featured: "desc" }, { createdAt: "desc" }];

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        category: {
          select: { id: true, slug: true, label: true, emoji: true, color: true },
        },
      },
    }),
    prisma.story.count({ where }),
  ]);

  return Response.json({
    stories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

/**
 * POST /api/stories
 * Create a new story. Requires authentication.
 * Body: { title, content, categoryId? }
 */
export async function POST(req) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  try {
    const { title, content, categoryId } = await req.json();

    if (!title?.trim()) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }
    if (!content?.trim()) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }
    if (content.trim().length < 50) {
      return Response.json(
        { error: "Story must be at least 50 characters long" },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (categoryId) {
      const cat = await prisma.storyCategory.findUnique({
        where: { id: categoryId },
      });
      if (!cat) {
        return Response.json({ error: "Invalid category" }, { status: 400 });
      }
    }

    const slug = await generateUniqueSlug(title);

    // Generate excerpt from content (first ~160 chars)
    const plainContent = content.replace(/[#*`_~\[\]]/g, "");
    const excerpt =
      plainContent.length > 160
        ? plainContent.substring(0, 160).trim() + "..."
        : plainContent.trim();

    const story = await prisma.story.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt,
        authorId: user.id,
        categoryId: categoryId || null,
      },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        category: {
          select: { id: true, slug: true, label: true, emoji: true, color: true },
        },
      },
    });

    return Response.json(story, { status: 201 });
  } catch (error) {
    console.error("Create story error:", error);
    return Response.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}
