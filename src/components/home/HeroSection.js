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

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mt-4">
          <Link
            href="/forum"
            className="w-full rounded-md bg-primary px-8 py-3.5 text-center text-sm font-bold text-primary-foreground sm:w-auto sm:text-base hover:bg-primary/90 transition shadow-lg shadow-primary/20"
          >
            Join the Forum
          </Link>

          <Link
            href="/questions"
            className="w-full rounded-md border border-border/60 bg-background px-8 py-3.5 text-center text-sm font-bold sm:w-auto sm:text-base hover:bg-muted/50 transition shadow-sm"
          >
            Browse Questions
          </Link>
        </div>
      </div>
    </section>
  );
}
