"use client"

import Link from "next/link"
import { useState } from "react"

export default function HeroSection() {
  const [query, setQuery] = useState("")

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6 text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Ace Your <span className="text-primary">Competitive Exams</span>
        </h1>

        <p className="text-muted-foreground text-lg mb-8">
          Practice questions, discuss strategies, and learn with aspirants across India.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (query.trim()) {
              alert(`Search later: ${query}`)
            }
          }}
          className="flex gap-2 max-w-xl mx-auto mb-8"
        >
          <input
            className="flex-1 border rounded-md px-4 py-3 bg-background"
            placeholder="Search questions by topic or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="px-6 py-3 rounded-md bg-primary text-primary-foreground">
            Search
          </button>
        </form>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/questions"
            className="px-6 py-3 rounded-md bg-primary text-primary-foreground"
          >
            Browse Questions
          </Link>

          <Link
            href="/forum"
            className="px-6 py-3 rounded-md border"
          >
            Join Discussion Forum
          </Link>
        </div>
      </div>
    </section>
  )
}
