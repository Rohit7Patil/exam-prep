"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function VoteButtons({
  votes = 0,
  initialUserVote = 0, // -1 | 0 | 1
  targetType, // "thread" | "reply"
  targetId,
  disabled = false,
}) {
  const [userVote, setUserVote] = useState(initialUserVote);
  const [score, setScore] = useState(votes);

  async function handleVote(value) {
    if (disabled) return;
    // Optimistic update
    const prevVote = userVote;
    const prevScore = score;

    if (userVote === value) {
      setUserVote(0);
      setScore((prev) => prev - value);
    } else {
      setScore((prev) => prev - userVote + value);
      setUserVote(value);
    }

    // Determine API endpoint
    const url =
      targetType === "thread"
        ? `/api/threads/${targetId}/vote`
        : `/api/replies/${targetId}/vote`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      if (!res.ok) {
        // Revert on failure
        setUserVote(prevVote);
        setScore(prevScore);
      } else {
        const data = await res.json();
        setScore(data.votesCount);
        setUserVote(data.userVote);
      }
    } catch {
      // Revert on error
      setUserVote(prevVote);
      setScore(prevScore);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1 text-muted-foreground">
      {/* AUTHENTICATED */}
      <SignedIn>
        <button
          onClick={() => handleVote(1)}
          className={`rounded p-2 sm:p-1 transition ${
            userVote === 1 ? "text-primary" : "hover:text-foreground"
          }`}
          aria-label="Upvote"
        >
          <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <span className="text-sm font-medium text-foreground">{score}</span>

        <button
          onClick={() => handleVote(-1)}
          className={`rounded p-2 sm:p-1 transition ${
            userVote === -1 ? "text-destructive" : "hover:text-foreground"
          }`}
          aria-label="Downvote"
        >
          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </SignedIn>

      {/* NOT AUTHENTICATED */}
      <SignedOut>
        <SignInButton mode="modal">
          <button
            className="rounded p-1 hover:text-foreground"
            aria-label="Sign in to upvote"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </SignInButton>

        <span className="text-sm font-medium text-foreground">{score}</span>

        <SignInButton mode="modal">
          <button
            className="rounded p-1 hover:text-foreground"
            aria-label="Sign in to downvote"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}
