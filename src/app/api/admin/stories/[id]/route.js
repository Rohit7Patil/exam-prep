import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/syncUser";
import { isAdmin } from "@/lib/isAdmin";

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    const clerkUser = await currentUser();
    if (!clerkUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await syncUser(clerkUser);
    const admin = await isAdmin(dbUser);
    if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });

    // Delete story (cascade deletes comments and likes based on Prisma schema)
    await prisma.story.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin Delete Story Error:", error);
    return Response.json({ error: "Failed to delete story" }, { status: 500 });
  }
}
