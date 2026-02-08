"use client";

import ThemeToggle from "@/components/ThemeToggle";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ArrowRight, BookOpen, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          <span className="text-base sm:text-lg">ExamPrep India</span>
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
        <div className="flex items-center gap-2 sm:gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-md border px-2.5 py-1.5 text-xs sm:px-3 sm:text-sm hover:bg-muted">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs sm:px-3 sm:text-sm text-primary-foreground">
                Sign Up
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7 sm:h-8 sm:w-8",
                },
              }}
            />
          </SignedIn>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
