"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MessageSquare } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          <span className="text-lg">ExamPrep India</span>
        </Link>

        {/* Center: Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/questions"
            className={`flex items-center gap-1 transition ${
              pathname.startsWith("/questions")
                ? "text-blue-600 dark:text-blue-500 font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Question Bank
          </Link>

          <Link
            href="/forum"
            className={`flex items-center gap-1 transition ${
              pathname.startsWith("/forum")
                ? "text-blue-600 dark:text-blue-500 font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Forum
          </Link>
        </div>

        {/* Right: Auth + Theme */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Sign Up
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
