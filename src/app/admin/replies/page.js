"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
} from "lucide-react";

const STATUS_OPTIONS = ["", "PENDING", "CORRECT", "INCORRECT", "DISPUTED"];

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-amber-500 bg-amber-500/10",
  },
  CORRECT: {
    label: "Correct",
    icon: CheckCircle,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  INCORRECT: {
    label: "Incorrect",
    icon: XCircle,
    color: "text-red-500 bg-red-500/10",
  },
  DISPUTED: {
    label: "Disputed",
    icon: AlertTriangle,
    color: "text-orange-500 bg-orange-500/10",
  },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || {
    label: status,
    color: "text-muted-foreground bg-muted",
  };
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {cfg.label}
    </span>
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

export default function RepliesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (status) params.set("status", status);
    fetch(`/api/admin/replies?${params}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(replyId) {
    setDeletingId(replyId);
    try {
      await fetch(`/api/admin/replies/${replyId}`, { method: "DELETE" });
      load();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Replies</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Moderate replies across all threads
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              status === s
                ? "bg-primary text-primary-foreground"
                : "border border-border/50 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {s || "All Statuses"}
          </button>
        ))}
      </div>

      {/* Replies list */}
      <div className="space-y-3">
        {loading && (
          <div className="py-10 text-center text-muted-foreground text-sm">
            Loading...
          </div>
        )}
        {!loading && data?.replies?.length === 0 && (
          <div className="rounded-xl border border-border/50 py-10 text-center text-muted-foreground text-sm">
            No replies found
          </div>
        )}
        {!loading &&
          data?.replies?.map((reply) => (
            <div
              key={reply.id}
              className="rounded-xl border border-border/50 bg-card p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {reply.author?.username || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      in{" "}
                      <span className="text-foreground">
                        {reply.thread?.title}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={reply.verificationStatus} />
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(reply.createdAt)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <p className="text-sm text-muted-foreground line-clamp-3 border-l-2 border-border/50 pl-3">
                {reply.content}
              </p>

              {/* Actions */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(reply.id)}
                  disabled={deletingId === reply.id}
                  className="flex items-center gap-1.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1.5 text-xs font-medium transition disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deletingId === reply.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {data.pagination.total} replies · Page {data.pagination.page} of{" "}
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
