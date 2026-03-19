"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, FileText, ExternalLink, Check, X, Pencil } from "lucide-react";
import Link from "next/link";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", slug: "", content: "", published: false });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/blogs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBlogs(data);
        } else {
          setBlogs([]);
          setError(data.error || "Failed to load blogs");
        }
      })
      .catch(err => setError("Failed to load blogs"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setFormData({ title: blog.title, slug: blog.slug, content: blog.content, published: blog.published });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: "", slug: "", content: "", published: false });
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url = editingId ? `/api/admin/blogs/${editingId}` : "/api/admin/blogs";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    setDeleteId(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
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
          <h1 className="text-2xl font-bold">Blogs Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and edit blog posts for ExamPrep India
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "New Blog Post"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h2 className="font-semibold mb-6 flex items-center gap-2">
            {editingId ? <Pencil className="h-4 w-4 text-blue-500" /> : <Plus className="h-4 w-4 text-blue-500" />}
            {editingId ? "Edit Blog Post" : "Create New Blog Post"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Latest UPSC Notification 2026"
                  className="w-full rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Slug (URL)</label>
                <input
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g. upsc-notification-2026"
                  className="w-full rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Content</label>
              <textarea
                required
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog content here..."
                className="w-full rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="published" className="text-sm font-medium">Publish immediately</label>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : (editingId ? "Update Post" : "Create Post")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30 text-muted-foreground font-medium">
              <th className="text-left px-5 py-3">Blog</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Author</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Date</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center">Loading...</td></tr>
            ) : blogs.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No blogs found. Start by creating one!</td></tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-foreground">{blog.title}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">/{blog.slug}</div>
                  </td>
                  <td className="px-4 py-4">
                    {blog.published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                        <Check className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                        <X className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell italic text-muted-foreground">
                    {blog.author?.username}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-muted-foreground">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Link
                        href={`/blogs/${blog.slug}`}
                        target="_blank"
                        className="rounded-md p-1.5 hover:bg-muted transition text-muted-foreground hover:text-foreground"
                        title="View Live"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleEdit(blog)}
                        className="rounded-md p-1.5 hover:bg-blue-500/10 transition text-muted-foreground hover:text-blue-600"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={deleteId === blog.id}
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
