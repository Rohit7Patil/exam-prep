import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "./syncUser";

/**
 * Resolves the current Clerk session to a database User.
 * Returns { user } on success, or { user: null, response } with a 401 Response.
 *
 * Usage:
 *   const { user, response } = await getAuthUser();
 *   if (!user) return response;
 */
export async function getAuthUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return {
      user: null,
      response: Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const user = await syncUser(clerkUser);

  return { user, response: null };
}
