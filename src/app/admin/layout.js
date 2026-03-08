import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/syncUser";
import { isAdmin } from "@/lib/isAdmin";
import AdminSidebar from "@/components/admin/AdminSidebar";

/**
 * Admin layout - server-side auth + admin check.
 * Redirects to "/" if not logged in or not an admin.
 */
export default async function AdminLayout({ children }) {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/");

  const dbUser = await syncUser(clerkUser);
  const admin = await isAdmin(dbUser);
  if (!admin) redirect("/");

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
