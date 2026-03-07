"use client";

export default function ReplyTypeSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs text-muted-foreground font-medium">Type:</span>
      <div className="flex gap-1 rounded-lg border border-border/40 p-0.5 text-xs">
        <button
          type="button"
          onClick={() => onChange("ANSWER")}
          className={`rounded-md px-3 py-1 font-medium transition-all ${
            value === "ANSWER"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ✅ Answer
        </button>
        <button
          type="button"
          onClick={() => onChange("DISCUSSION")}
          className={`rounded-md px-3 py-1 font-medium transition-all ${
            value === "DISCUSSION"
              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          💬 Discussion
        </button>
      </div>
      {value === "ANSWER" && (
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
          Counts for ClarityScore™
        </span>
      )}
    </div>
  );
}
