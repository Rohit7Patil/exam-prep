import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";
import { requireAdmin } from "@/lib/isAdmin";

/**
 * PATCH /api/admin/threads/[threadId]
 * Toggle pin: body { pinned: boolean }
 */
export async function PATCH(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const { threadId } = await params;
  const { pinned } = await req.json();

  try {
    const thread = await prisma.thread.update({
      where: { id: threadId },
      data: { pinned: Boolean(pinned) },
    });
    return Response.json(thread);
  } catch (error) {
    console.error("Update thread error:", error);
    return Response.json({ error: "Failed to update thread" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/threads/[threadId]
 * Delete a thread.
 */
export async function DELETE(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const { threadId } = await params;

  try {
    await prisma.thread.delete({ where: { id: threadId } });
    return Response.json({ message: "Thread deleted" });
  } catch (error) {
    console.error("Delete thread error:", error);
    return Response.json({ error: "Failed to delete thread" }, { status: 500 });
  }
}
