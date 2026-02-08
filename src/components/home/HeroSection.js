"use client";

import Link from "next/link";
import { useState } from "react";

export default function HeroSection() {
  const [query, setQuery] = useState("");

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h1 className="mb-4 text-3xl font-bold sm:text-5xl">
          Learn. Discuss. <span className="text-primary">Crack Exams.</span>
        </h1>

        <p className="mb-8 text-base text-muted-foreground sm:text-lg">
          A community-driven platform to discuss questions, share strategies,
          and learn together with serious aspirants.
        </p>

        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) {
              alert(`Search later: ${query}`);
            }
          }}
          className="mx-auto mb-8 flex max-w-xl flex-col gap-2 sm:flex-row"
        >
          <input
            className="flex-1 rounded-md border bg-background px-4 py-3 text-sm sm:text-base"
            placeholder="Search discussions, tags, or topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground sm:text-base">
            Search
          </button>
        </form>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/forum"
            className="w-full rounded-md bg-primary px-6 py-3 text-center text-sm text-primary-foreground sm:w-auto sm:text-base"
          >
            Join the Forum
          </Link>

          <Link
            href="/questions"
            className="w-full rounded-md border px-6 py-3 text-center text-sm sm:w-auto sm:text-base"
          >
            Browse Questions
          </Link>
        </div>
      </div>
    </section>
  );
}
