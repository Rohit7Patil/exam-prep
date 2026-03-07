"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const STATUS_CONFIG = {
  CORRECT: {
    label: "Verified Correct",
    icon: CheckCircle,
    className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  INCORRECT: {
    label: "Marked Incorrect",
    icon: XCircle,
    className: "text-red-500 dark:text-red-400 bg-red-500/10 border-red-500/30",
  },
  DISPUTED: {
    label: "Disputed",
    icon: AlertCircle,
    className: "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  PENDING: {
    label: "Pending Review",
    icon: AlertCircle,
    className: "text-muted-foreground bg-muted/50 border-border/30",
  },
};

export function VerificationBadge({ status }) {
  if (!status || status === "PENDING") return null;
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export default function VerifyButton({ replyId, currentStatus, onVerified }) {
  const [status, setStatus] = useState(currentStatus || "PENDING");
  const [loading, setLoading] = useState(false);

  async function handleVerify(newStatus) {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/replies/${replyId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        onVerified?.(newStatus);
      }
    } catch (err) {
      console.error("Verify failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
        Verify:
      </span>
      <button
        onClick={() => handleVerify("CORRECT")}
        disabled={loading || status === "CORRECT"}
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition disabled:opacity-50 ${
          status === "CORRECT"
            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
            : "text-muted-foreground border-border/40 hover:text-emerald-600 hover:border-emerald-500/30 hover:bg-emerald-500/5"
        }`}
        title="Mark as Correct"
      >
        <CheckCircle className="h-3 w-3" />
        Correct
      </button>
      <button
        onClick={() => handleVerify("INCORRECT")}
        disabled={loading || status === "INCORRECT"}
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition disabled:opacity-50 ${
          status === "INCORRECT"
            ? "text-red-500 dark:text-red-400 bg-red-500/10 border-red-500/30"
            : "text-muted-foreground border-border/40 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5"
        }`}
        title="Mark as Incorrect"
      >
        <XCircle className="h-3 w-3" />
        Incorrect
      </button>
      <button
        onClick={() => handleVerify("DISPUTED")}
        disabled={loading || status === "DISPUTED"}
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition disabled:opacity-50 ${
          status === "DISPUTED"
            ? "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/30"
            : "text-muted-foreground border-border/40 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5"
        }`}
        title="Mark as Disputed"
      >
        <AlertCircle className="h-3 w-3" />
        Dispute
      </button>
    </div>
  );
}
