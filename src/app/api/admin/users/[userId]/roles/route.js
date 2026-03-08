import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";
import { requireAdmin } from "@/lib/isAdmin";

/**
 * POST /api/admin/users/[userId]/roles
 * Assign a role to a user. Body: { roleName: string }
 */
export async function POST(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const { userId } = await params;
  const { roleName } = await req.json();

  if (!roleName) {
    return Response.json({ error: "roleName is required" }, { status: 400 });
  }

  try {
    // Find or create the role
    let role = await prisma.role.findFirst({
      where: { name: { equals: roleName, mode: "insensitive" } },
    });

    if (!role) {
      role = await prisma.role.create({
        data: { name: roleName.toLowerCase() },
      });
    }

    // Upsert user role (idempotent)
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      create: { userId, roleId: role.id },
      update: {},
    });

    return Response.json({ message: `Role '${roleName}' assigned` });
  } catch (error) {
    console.error("Assign role error:", error);
    return Response.json({ error: "Failed to assign role" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[userId]/roles
 * Revoke a role from a user. Body: { roleName: string }
 */
export async function DELETE(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const { userId } = await params;
  const { roleName } = await req.json();

  if (!roleName) {
    return Response.json({ error: "roleName is required" }, { status: 400 });
  }

  try {
    const role = await prisma.role.findFirst({
      where: { name: { equals: roleName, mode: "insensitive" } },
    });

    if (!role) {
      return Response.json({ error: "Role not found" }, { status: 404 });
    }

    await prisma.userRole.deleteMany({
      where: { userId, roleId: role.id },
    });

    return Response.json({ message: `Role '${roleName}' revoked` });
  } catch (error) {
    console.error("Revoke role error:", error);
    return Response.json({ error: "Failed to revoke role" }, { status: 500 });
  }
}
