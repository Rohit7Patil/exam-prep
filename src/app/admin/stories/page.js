"use client";

import { useEffect, useState } from "react";
import { Trash2, ExternalLink, Calendar, MessageCircle, Heart, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminStoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/stories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStories(data);
        } else {
          setStories([]);
          setError(data.error || "Failed to load stories");
        }
      })
      .catch((err) => setError("Failed to load stories"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this story? This cannot be undone.")) return;
    
    setDeleteId(id);
    try {
      const res = await fetch(`/api/admin/stories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stories Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage Aspirants Stories posted by users.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="rounded-xl border border-border/50 overflow-x-auto bg-card">
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30 text-muted-foreground font-medium">
              <th className="text-left px-5 py-3">Story</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Author</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Stats</th>
              <th className="text-right px-5 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center">
                  Loading...
                </td>
              </tr>
            ) : stories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                  No stories found.
                </td>
              </tr>
            ) : (
              stories.map((story) => (
                <tr key={story.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-5 py-4 min-w-0">
                    <div className="font-bold text-foreground max-w-[200px] sm:max-w-sm truncate" title={story.title}>
                      {story.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                       {story.category && (
                         <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-medium">
                           <span>{story.category.emoji}</span>
                           {story.category.label}
                         </span>
                       )}
                       <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(story.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell text-muted-foreground">
                    {story.author?.username || "Anonymous"}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-muted-foreground">
                     <div className="flex items-center gap-3 text-xs">
                       <span className="flex items-center gap-1" title="Views">
                         <Eye className="h-3.5 w-3.5" />
                         {story.viewsCount}
                       </span>
                       <span className="flex items-center gap-1" title="Likes">
                         <Heart className="h-3.5 w-3.5 text-rose-500/70" />
                         {story._count?.likes || 0}
                       </span>
                       <span className="flex items-center gap-1" title="Comments">
                         <MessageCircle className="h-3.5 w-3.5 text-blue-500/70" />
                         {story._count?.comments || 0}
                       </span>
                     </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Link
                        href={`/stories/${story.slug}`}
                        target="_blank"
                        className="rounded-md p-1.5 hover:bg-muted transition text-muted-foreground hover:text-foreground"
                        title="View Live"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(story.id)}
                        disabled={deleteId === story.id}
                        className="rounded-md p-1.5 hover:bg-red-500/10 transition text-muted-foreground hover:text-red-500 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
