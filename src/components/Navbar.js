"use client";

import ThemeToggle from "@/components/ThemeToggle";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import {
  ArrowRight,
  BookOpen,
  MessagesSquare,
  MessageSquare,
  Trophy,
  FileText,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  const navLinks = [
    { href: "/questions", label: "Question Bank", icon: BookOpen },
    { href: "/forum", label: "Forum", icon: MessagesSquare },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      color: "text-amber-500",
    },
    { href: "/blogs", label: "Blogs", icon: FileText },
    { href: "/about", label: "About Us", icon: BookOpen },
    { href: "/contact", label: "Contact Us", icon: MessageSquare },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            <span className="text-base sm:text-lg">ExamPrep India</span>
          </Link>

          {/* Center: Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 transition ${
                  pathname.startsWith(item.href)
                    ? "text-blue-600 dark:text-blue-500 font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className={`h-4 w-4 ${item.color || ""}`} />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right: Auth + Theme (Desktop/Tablet) */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="rounded-md border border-border/50 px-3 py-1.5 text-sm hover:bg-muted/50 transition">
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
                    Sign Up
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                />
              </SignedIn>

              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden rounded-md p-1.5 hover:bg-muted/60 transition"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer (Admin Style) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
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
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                <span className="font-semibold text-sm">ExamPrep India</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md p-1.5 hover:bg-muted/60 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-0.5 p-3">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
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
                href="/admin/overview"
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-500 hover:underline font-medium px-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Panel
              </Link>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <SignedIn>
                    <UserButton
                      appearance={{
                        elements: { avatarBox: "h-8 w-8" },
                      }}
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      Profile
                    </span>
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="text-sm font-semibold text-blue-600 hover:underline">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
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
