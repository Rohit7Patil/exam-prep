import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";
import { requireAdmin } from "@/lib/isAdmin";

/**
 * DELETE /api/admin/replies/[replyId]
 * Delete a reply. Requires admin.
 */
export async function DELETE(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const { replyId } = await params;

  try {
    await prisma.reply.delete({ where: { id: replyId } });
    return Response.json({ message: "Reply deleted" });
  } catch (error) {
    console.error("Delete reply error:", error);
    return Response.json({ error: "Failed to delete reply" }, { status: 500 });
  }
}
