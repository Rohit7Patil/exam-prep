import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";
import { requireAdmin } from "@/lib/isAdmin";

/**
 * PATCH /api/admin/tags/[tagId]
 * Update a tag's slug and/or label.
 */
export async function PATCH(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const { tagId } = await params;
  const { slug, label } = await req.json();

  try {
    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(slug && { slug }),
        ...(label && { label }),
      },
    });
    return Response.json(tag);
  } catch (error) {
    console.error("Update tag error:", error);
    return Response.json({ error: "Failed to update tag" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/tags/[tagId]
 * Delete a tag (cascades via ThreadTag).
 */
export async function DELETE(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const { tagId } = await params;

  try {
    await prisma.tag.delete({ where: { id: tagId } });
    return Response.json({ message: "Tag deleted" });
  } catch (error) {
    console.error("Delete tag error:", error);
    return Response.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}
