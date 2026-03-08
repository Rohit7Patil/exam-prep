"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Tag,
  MessageSquare,
  FileText,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users & Roles", icon: Users },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/replies", label: "Replies", icon: MessageSquare },
  { href: "/admin/threads", label: "Threads", icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border/50 min-h-[calc(100vh-3.5rem)] bg-muted/20">
      {/* Brand header */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border/50">
        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span className="font-semibold text-sm">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 p-2 pt-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
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
    </aside>
  );
}
