"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Pin,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  Tag,
} from "lucide-react";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ThreadsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pinningId, setPinningId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (search) params.set("search", search);
    fetch(`/api/admin/threads?${params}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function handlePin(thread) {
    setPinningId(thread.id);
    try {
      await fetch(`/api/admin/threads/${thread.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !thread.pinned }),
      });
      load();
    } finally {
      setPinningId(null);
    }
  }

  async function handleDelete(threadId) {
    setDeletingId(threadId);
    try {
      await fetch(`/api/admin/threads/${threadId}`, { method: "DELETE" });
      load();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Threads</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Moderate and manage forum threads
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search threads…"
            className="w-full rounded-lg border border-border/50 bg-muted/30 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
        >
          Search
        </button>
      </form>

      {/* Threads Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                Thread
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                Tags
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                <ThumbsUp className="inline h-3.5 w-3.5" />
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                <MessageSquare className="inline h-3.5 w-3.5" />
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                Date
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            )}
            {!loading && data?.threads?.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  No threads found
                </td>
              </tr>
            )}
            {!loading &&
              data?.threads?.map((t) => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {t.pinned && (
                        <Pin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-xs">
                          {t.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.author?.username || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {t.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag.slug}
                          className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                    {t.votesCount}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                    {t.repliesCount}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell text-xs">
                    {timeAgo(t.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePin(t)}
                        disabled={pinningId === t.id}
                        title={t.pinned ? "Unpin" : "Pin"}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
                          t.pinned
                            ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                            : "border border-border/50 text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        className="rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {data.pagination.total} threads · Page {data.pagination.page} of{" "}
            {data.pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-border/50 p-1.5 hover:bg-muted/50 transition disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page === data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-border/50 p-1.5 hover:bg-muted/50 transition disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
