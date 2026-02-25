import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * PATCH /api/threads/[id]/pin
 *
 * Toggle the pinned status of a thread. Admin only.
 */
export async function PATCH(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const { id } = await params;

  try {
    // Check if user has admin role
    const adminRole = await prisma.userRole.findFirst({
      where: {
        userId: user.id,
        role: { name: { in: ["admin", "ADMIN"] } },
      },
    });

    if (!adminRole) {
      return Response.json(
        { error: "Forbidden — admin role required" },
        { status: 403 }
      );
    }

    // Verify thread exists
    const thread = await prisma.thread.findUnique({ where: { id } });
    if (!thread) {
      return Response.json({ error: "Thread not found" }, { status: 404 });
    }

    // Toggle pinned
    const updated = await prisma.thread.update({
      where: { id },
      data: { pinned: !thread.pinned },
      select: { id: true, pinned: true },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("Pin thread error:", error);
    return Response.json(
      { error: "Failed to update pin status" },
      { status: 500 }
    );
  }
}
