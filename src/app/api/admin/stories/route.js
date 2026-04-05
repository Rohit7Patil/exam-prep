import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/syncUser";
import { isAdmin } from "@/lib/isAdmin";

export async function GET(req) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await syncUser(clerkUser);
    const admin = await isAdmin(dbUser);
    if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });

    const stories = await prisma.story.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { username: true },
        },
        category: {
          select: { label: true, emoji: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
      take: 100, // Fetch top 100 for admin
    });

    return Response.json(stories);
  } catch (error) {
    console.error("Admin Fetch Stories Error:", error);
    return Response.json({ error: "Failed to fetch stories" }, { status: 500 });
  }
}
