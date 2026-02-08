"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function VoteButtons({
  votes = 0,
  initialUserVote = 0, // -1 | 0 | 1
}) {
  const [userVote, setUserVote] = useState(initialUserVote);
  const [score, setScore] = useState(votes);

  function handleUpvote() {
    if (userVote === 1) {
      // cancel upvote
      setUserVote(0);
      setScore((v) => v - 1);
    } else if (userVote === -1) {
      // switch from downvote to upvote
      setUserVote(1);
      setScore((v) => v + 2);
    } else {
      // fresh upvote
      setUserVote(1);
      setScore((v) => v + 1);
    }
  }

  function handleDownvote() {
    if (userVote === -1) {
      // cancel downvote
      setUserVote(0);
      setScore((v) => v + 1);
    } else if (userVote === 1) {
      // switch from upvote to downvote
      setUserVote(-1);
      setScore((v) => v - 2);
    } else {
      // fresh downvote
      setUserVote(-1);
      setScore((v) => v - 1);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1 text-muted-foreground">
      <button
        onClick={handleUpvote}
        className={`rounded p-1 transition ${
          userVote === 1 ? "text-primary" : "hover:text-foreground"
        }`}
        aria-label="Upvote"
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      <span className="text-sm font-medium text-foreground">{score}</span>

      <button
        onClick={handleDownvote}
        className={`rounded p-1 transition ${
          userVote === -1 ? "text-destructive" : "hover:text-foreground"
        }`}
        aria-label="Downvote"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}
