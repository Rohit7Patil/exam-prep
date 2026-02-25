import { prisma } from "@/lib/prisma";

/**
 * POST /api/webhooks/clerk
 *
 * Handles Clerk webhook events for user sync.
 * In production, you should verify the webhook signature using svix.
 * For now, this handles user.created and user.updated events.
 */
export async function POST(req) {
  try {
    const payload = await req.json();
    const { type, data } = payload;

    if (type === "user.created" || type === "user.updated") {
      const { id, username, image_url } = data;

      await prisma.user.upsert({
        where: { clerkUserId: id },
        update: {
          username: username || null,
          avatarUrl: image_url || null,
        },
        create: {
          clerkUserId: id,
          username: username || null,
          avatarUrl: image_url || null,
        },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
