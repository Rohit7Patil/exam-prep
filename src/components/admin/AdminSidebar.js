"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  Users,
  Tag,
  MessageSquare,
  FileText,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

const navItems = [
  { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users & Roles", icon: Users },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/replies", label: "Replies", icon: MessageSquare },
  { href: "/admin/threads", label: "Threads", icon: FileText },
];

/**
 * Desktop-only sidebar. Hidden on mobile (md:flex).
 * Mobile navigation is handled by AdminMobileBar.
 */
export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border/50 h-full overflow-y-auto bg-muted/20">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border/50 shrink-0">
        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span className="font-semibold text-sm">Admin Panel</span>
      </div>

      <nav className="flex flex-col gap-0.5 p-2 pt-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto border-t border-border/50 p-4 space-y-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-500 hover:underline font-medium px-1"
        >
          <BookOpen className="h-4 w-4" />
          ExamPrep India
        </Link>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <UserButton
              appearance={{
                elements: { avatarBox: "h-8 w-8" },
              }}
            />
            <span className="text-sm font-medium text-muted-foreground">
              Profile
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
