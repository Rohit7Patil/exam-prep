"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart2,
  CheckCircle,
  XCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Calendar,
  Trophy,
  Zap,
  TrendingUp,
  Clock,
} from "lucide-react";

const PERIODS = [
  { key: "day", label: "Today" },
  { key: "week", label: "Last 7 Days" },
  { key: "thisMonth", label: "This Month" },
  { key: "month", label: "Last 30 Days" },
  { key: "quarter", label: "Last Quarter" },
  { key: "all", label: "All Time" },
];

function ClarityRing({ score }) {
  const pct = Math.min(score / 1000, 1);
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const strokeDash = pct * circ;

  const tier =
    score >= 800
      ? {
          label: "Gold Scholar",
          color: "#f59e0b",
          glow: "shadow-yellow-500/40",
        }
      : score >= 600
        ? {
            label: "Silver Analyst",
            color: "#94a3b8",
            glow: "shadow-slate-400/40",
          }
        : score >= 300
          ? {
              label: "Bronze Starter",
              color: "#d97706",
              glow: "shadow-amber-600/30",
            }
          : { label: "Rising", color: "#3b82f6", glow: "shadow-blue-500/30" };

  return (
    <div
      className={`relative flex items-center justify-center rounded-full shadow-xl ${tier.glow}`}
    >
      <svg width="130" height="130" className="-rotate-90">
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-border/20"
        />
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke={tier.color}
          strokeWidth="8"
          strokeDasharray={`${strokeDash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <Zap className="h-4 w-4 mb-0.5" style={{ color: tier.color }} />
        <span
          className="text-2xl font-black leading-none"
          style={{ color: tier.color }}
        >
          {Math.round(score)}
        </span>
        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mt-0.5">
          ClarityScore
        </span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = "text-primary" }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 flex flex-col gap-1 hover:border-border/70 transition-colors">
      <div
        className={`${color} flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-2xl font-black text-foreground">{value ?? "—"}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function MiniBar({ pct, color }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-border/20 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(pct * 100, 100)}%` }}
      />
    </div>
  );
}

function AchievementGrid({ achievements }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {achievements.map((a) => (
        <div
          key={a.slug}
          className={`relative rounded-xl border p-3 flex flex-col items-center gap-1.5 text-center transition-all group ${
            a.earned
              ? "border-primary/30 bg-primary/5 shadow-sm shadow-primary/10"
              : "border-border/20 bg-muted/20 opacity-40 grayscale"
          }`}
          title={a.desc}
        >
          <span className="text-3xl">{a.emoji}</span>
          <span className="text-xs font-semibold text-foreground leading-tight">
            {a.label}
          </span>
          {a.earned && a.earnedAt && (
            <span className="text-[9px] text-muted-foreground">
              {new Date(a.earnedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          {!a.earned && (
            <span className="text-[9px] text-muted-foreground italic">
              Locked
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function ReplyCard({ reply, type }) {
  const statusColors = {
    CORRECT: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    INCORRECT: "text-red-500 bg-red-500/10 border-red-500/30",
    DISPUTED: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    PENDING: "text-muted-foreground bg-muted/40 border-border/30",
  };
  const statusLabels = {
    CORRECT: "✓ Correct",
    INCORRECT: "✗ Incorrect",
    DISPUTED: "⚠ Disputed",
    PENDING: "⏳ Pending",
  };

  return (
    <Link
      href={`/forum/${reply.thread?.id}`}
      className="block rounded-lg border border-border/30 bg-card/50 p-3 hover:border-border/70 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
        <span className="text-xs font-medium text-muted-foreground truncate flex-1">
          {reply.thread?.title}
        </span>
        {type === "answer" && reply.verificationStatus && (
          <span
            className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${statusColors[reply.verificationStatus]}`}
          >
            {statusLabels[reply.verificationStatus]}
          </span>
        )}
      </div>
      <p className="text-sm text-foreground line-clamp-2">{reply.content}…</p>
      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-0.5">
          <ThumbsUp className="h-3 w-3" />{" "}
          {reply.votesCount >= 0 ? reply.votesCount : 0}
        </span>
        <span className="flex items-center gap-0.5">
          <Clock className="h-3 w-3" />
          {new Date(reply.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </Link>
  );
}

export default function ProfileDashboard({ profile }) {
  const [period, setPeriod] = useState("all");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeTab, setActiveTab] = useState("answers");

  useEffect(() => {
    setLoadingStats(true);
    fetch(`/api/users/${profile.id}/stats?period=${period}`)
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [period, profile.id]);

  const clarityScore = profile.stats?.clarityScore || 0;
  const verifiedCorrect = profile.stats?.verifiedCorrect || 0;
  const verifiedIncorrect = profile.stats?.verifiedIncorrect || 0;
  const verifiedTotal = verifiedCorrect + verifiedIncorrect;
  const accuracyPct = verifiedTotal > 0 ? verifiedCorrect / verifiedTotal : 0;

  const joinDate = new Date(profile.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* ── Hero section ── */}
      <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/20 shadow-xl"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-3xl font-black text-primary-foreground shadow-xl ring-4 ring-primary/20">
                {profile.username[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-black text-foreground">
              {profile.username}
            </h1>
            <p className="flex items-center justify-center sm:justify-start gap-1 text-xs text-muted-foreground mt-1">
              <Calendar className="h-3.5 w-3.5" />
              Member since {joinDate}
            </p>

            {/* Top achievements strip */}
            {profile.achievements.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                {profile.achievements.slice(0, 4).map((a) => (
                  <span
                    key={a.slug}
                    title={a.desc}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold"
                  >
                    {a.emoji} {a.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ClarityScore Ring */}
          <div className="shrink-0">
            <ClarityRing score={clarityScore} />
          </div>
        </div>

        {/* Accuracy bar */}
        {verifiedTotal > 0 && (
          <div className="mt-6 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="font-semibold">Answer Accuracy</span>
              <span className="font-bold text-foreground">
                {Math.round(accuracyPct * 100)}% ({verifiedCorrect}/
                {verifiedTotal})
              </span>
            </div>
            <MiniBar pct={accuracyPct} color="bg-emerald-500" />
          </div>
        )}
      </div>

      {/* ── Period Filters ── */}
      <div>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                period === p.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={CheckCircle}
          label="Answers"
          value={loadingStats ? "…" : stats?.totalAnswers}
          sub="Submitted answers"
          color="text-emerald-500"
        />
        <StatCard
          icon={MessageSquare}
          label="Discussions"
          value={loadingStats ? "…" : stats?.totalDiscussions}
          sub="Discussion replies"
          color="text-blue-500"
        />
        <StatCard
          icon={ThumbsUp}
          label="Upvotes"
          value={loadingStats ? "…" : stats?.totalUpvotes}
          sub="Votes received"
          color="text-primary"
        />
        <StatCard
          icon={BookOpen}
          label="Threads"
          value={loadingStats ? "…" : stats?.totalThreads}
          sub="Threads started"
          color="text-violet-500"
        />
      </div>

      {/* ── Verification summary ── */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
            <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.verifiedCorrect}
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Correct
            </p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
            <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <p className="text-xl font-black text-red-600 dark:text-red-400">
              {stats.verifiedIncorrect}
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Incorrect
            </p>
          </div>
          <div className="rounded-xl border border-muted/40 bg-muted/20 p-3 text-center">
            <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-black text-foreground">
              {stats.pendingAnswers}
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Pending
            </p>
          </div>
        </div>
      )}

      {/* ── Achievements ── */}
      <section>
        <h2 className="flex items-center gap-2 text-base font-bold mb-4">
          <Trophy className="h-4 w-4 text-amber-500" /> Achievements
        </h2>
        <AchievementGrid achievements={profile.allAchievements} />
      </section>

      {/* ── Activity Tabs ── */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <BarChart2 className="h-4 w-4 text-primary" /> Activity
          </h2>
          <div className="flex gap-1 rounded-lg border border-border/40 p-0.5 text-xs">
            {["answers", "discussions", "threads"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3 py-1 font-medium transition capitalize ${
                  activeTab === tab
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loadingStats ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {activeTab === "answers" &&
              (stats?.answers?.length > 0 ? (
                stats.answers.map((r) => (
                  <ReplyCard key={r.id} reply={r} type="answer" />
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No answers in this period.
                </p>
              ))}

            {activeTab === "discussions" &&
              (stats?.discussions?.length > 0 ? (
                stats.discussions.map((r) => (
                  <ReplyCard key={r.id} reply={r} type="discussion" />
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No discussions in this period.
                </p>
              ))}

            {activeTab === "threads" &&
              (stats?.threads?.length > 0 ? (
                stats.threads.map((t) => (
                  <Link
                    key={t.id}
                    href={`/forum/${t.id}`}
                    className="block rounded-lg border border-border/30 bg-card/50 p-3 hover:border-border/70 transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {t.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>
                        <MessageSquare className="inline h-3 w-3 mr-0.5" />
                        {t.repliesCount} replies
                      </span>
                      <span>
                        <ThumbsUp className="inline h-3 w-3 mr-0.5" />
                        {t.votesCount} votes
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No threads in this period.
                </p>
              ))}
          </div>
        )}
      </section>

      {/* ── Footer link ── */}
      <div className="text-center">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <TrendingUp className="h-4 w-4" />
          View Leaderboard
        </Link>
      </div>
    </div>
  );
}
