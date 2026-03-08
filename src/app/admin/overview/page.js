"use client";

import { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  FileText,
  Tag,
  ThumbsUp,
  TrendingUp,
  Clock,
  BookOpen,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 flex items-center gap-4">
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold mt-0.5">
          {value?.toLocaleString() ?? "—"}
        </p>
      </div>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load stats");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-500">
        {error}
      </div>
    );
  }

  const { stats, recentThreads, recentReplies } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform-wide statistics and recent activity
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="Users"
          value={stats.totalUsers}
          color="bg-blue-500"
        />
        <StatCard
          icon={FileText}
          label="Threads"
          value={stats.totalThreads}
          color="bg-violet-500"
        />
        <StatCard
          icon={MessageSquare}
          label="Replies"
          value={stats.totalReplies}
          color="bg-emerald-500"
        />
        <StatCard
          icon={Tag}
          label="Tags"
          value={stats.totalTags}
          color="bg-amber-500"
        />
        <StatCard
          icon={ThumbsUp}
          label="Votes"
          value={stats.totalVotes}
          color="bg-rose-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Threads */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50">
            <TrendingUp className="h-4 w-4 text-violet-500" />
            <h2 className="font-semibold text-sm">Recent Threads</h2>
          </div>
          <ul className="divide-y divide-border/40">
            {recentThreads.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                No threads yet
              </li>
            )}
            {recentThreads.map((t) => (
              <li key={t.id} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by{" "}
                      <span className="text-foreground">
                        {t.author?.username || "Unknown"}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(t.createdAt)}
                    </span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {t.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag.slug}
                          className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Replies */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50">
            <MessageSquare className="h-4 w-4 text-emerald-500" />
            <h2 className="font-semibold text-sm">Recent Replies</h2>
          </div>
          <ul className="divide-y divide-border/40">
            {recentReplies.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                No replies yet
              </li>
            )}
            {recentReplies.map((r) => (
              <li key={r.id} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1 truncate">
                      in{" "}
                      <span className="text-foreground font-medium">
                        {r.thread?.title}
                      </span>
                    </p>
                    <p className="text-sm line-clamp-2">{r.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      by{" "}
                      <span className="text-foreground">
                        {r.author?.username || "Unknown"}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3" />
                    {timeAgo(r.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
