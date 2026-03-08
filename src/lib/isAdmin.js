import { prisma } from "@/lib/prisma";

/**
 * Checks if a given DB user has the "admin" role.
 * @param {Object} user - The DB user object (with .id)
 * @returns {Promise<boolean>}
 */
export async function isAdmin(user) {
  if (!user?.id) return false;

  const adminRole = await prisma.userRole.findFirst({
    where: {
      userId: user.id,
      role: { name: { equals: "admin", mode: "insensitive" } },
    },
  });

  return !!adminRole;
}

/**
 * Returns a 403 Response if the user is not an admin.
 * Use in API routes for admin-only access.
 */
export async function requireAdmin(user) {
  const admin = await isAdmin(user);
  if (!admin) {
    return Response.json({ error: "Forbidden: Admins only" }, { status: 403 });
  }
  return null;
}
