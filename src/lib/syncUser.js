import { prisma } from "./prisma";

export async function syncUser(clerkUser) {
  if (!clerkUser) return null;

  // Derive a display name from whichever Clerk field is available
  const username =
    clerkUser.username ||
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "User";

  const avatarUrl = clerkUser.imageUrl || null;

  return prisma.user.upsert({
    where: { clerkUserId: clerkUser.id },
    update: { username, avatarUrl },
    create: { clerkUserId: clerkUser.id, username, avatarUrl },
  });
}
