import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/syncUser";
import { isAdmin } from "@/lib/isAdmin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileBar from "@/components/admin/AdminMobileBar";

/**
 * Admin layout - server-side auth + admin check.
 * Redirects to "/" if not logged in or not an admin.
 *
 * Structure:
 *   <sticky mobile top bar>   ← only visible on mobile, sits ABOVE the flex row
 *   <flex row>
 *     <desktop sidebar>       ← only visible on md+
 *     <main content>
 *   </flex row>
 */
export default async function AdminLayout({ children }) {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/");

  const dbUser = await syncUser(clerkUser);
  const admin = await isAdmin(dbUser);
  if (!admin) redirect("/");

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Mobile top bar — sits above the content row, sticky below the main navbar */}
      <AdminMobileBar />

      {/* Content row */}
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <AdminSidebar />
        {/* Page content */}
        <main className="flex-1 min-w-0 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
