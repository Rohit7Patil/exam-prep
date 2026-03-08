"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/tags")
      .then((r) => r.json())
      .then(setTags)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug.trim(), label: label.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create tag");
      setSlug("");
      setLabel("");
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(tagId) {
    setDeleteId(tagId);
    try {
      await fetch(`/api/admin/tags/${tagId}`, { method: "DELETE" });
      load();
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tags</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Create and manage forum tags
        </p>
      </div>

      {/* Create Tag Form */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-blue-500" />
          Create New Tag
        </h2>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-muted-foreground mb-1">
              Slug <span className="text-rose-500">*</span>
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. modern-history"
              required
              className="w-full rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lowercase letters, numbers, hyphens only
            </p>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-muted-foreground mb-1">
              Label
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Modern History"
              className="w-full rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Defaults to slug if blank
            </p>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating || !slug}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create Tag"}
            </button>
          </div>
        </form>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {/* Tags Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                Tag
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                Slug
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                Threads
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
                  colSpan={4}
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            )}
            {!loading && tags.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  No tags found
                </td>
              </tr>
            )}
            {!loading &&
              tags.map((tag) => (
                <tr
                  key={tag.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{tag.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground font-mono text-xs">
                    {tag.slug}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {tag.threadCount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(tag.id)}
                      disabled={deleteId === tag.id}
                      className="rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                      {deleteId === tag.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
