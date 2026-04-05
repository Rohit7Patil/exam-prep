"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";
import {
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Tag,
  MessageSquare,
  FileText,
  BookOpen,
  BookHeart,
} from "lucide-react";

const navItems = [
  { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users & Roles", icon: Users },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/replies", label: "Replies", icon: MessageSquare },
  { href: "/admin/threads", label: "Threads", icon: FileText },
  { href: "/admin/blogs", label: "Blogs", icon: BookOpen },
  { href: "/admin/stories", label: "Stories", icon: BookHeart },
  { href: "/admin/contact", label: "Contacts", icon: MessageSquare },
];

/**
 * Mobile-only top bar with hamburger drawer.
 * Rendered above the flex row in the layout, so sticky works correctly.
 */
export default function AdminMobileBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const current = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );

  return (
    <>
      {/* Sticky top bar — only on mobile */}
      <div
        suppressHydrationWarning
        className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-md px-4 py-3"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
          <span>Admin</span>
          {current && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{current.label}</span>
            </>
          )}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-md p-1.5 hover:bg-muted/60 transition"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Panel from right */}
          <div
            className="absolute top-0 right-0 h-full w-64 bg-background border-l border-border/50 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-sm">Admin Panel</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 hover:bg-muted/60 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-0.5 p-3">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
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
          </div>
        </div>
      )}
    </>
  );
}
