"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function StartupAuthModal() {
  const { isLoaded, isSignedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // Check if user is signed out and hasn't dismissed the modal yet
    const hasSkippedAuth = localStorage.getItem("hasSkippedAuthModal");
    if (!isSignedIn && !hasSkippedAuth) {
      // Small delay for smoother appearance
      const timer = setTimeout(() => setShowModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-border/40 bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <h2 className="text-xl font-semibold mb-2 text-center text-foreground">
          Welcome to Our Community
        </h2>

        <p className="text-muted-foreground text-sm text-center mb-6">
          To get the best experience and access all features, please sign in or
          create an account.
        </p>

        <div className="flex flex-col gap-3">
          <SignInButton mode="modal">
            <Button className="w-full font-medium" size="lg">
              Log in / Sign up
            </Button>
          </SignInButton>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              localStorage.setItem("hasSkippedAuthModal", "true");
              setShowModal(false);
            }}
          >
            Continue without login
          </Button>
        </div>

        <p className="mt-4 text-[11px] text-center text-muted-foreground/80 italic">
          Continuing without an account limits your ability to create threads,
          reply to discussions, and voting.
        </p>
      </div>
    </div>
  );
}
