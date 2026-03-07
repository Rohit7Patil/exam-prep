import { Trophy, CheckCircle, Zap, ShieldCheck } from "lucide-react";

export default function FeatureSection() {
  const features = [
    {
      icon: Zap,
      title: "ClarityScore™ Reputation",
      description:
        "Earn reputation points based on the accuracy of your answers, peer upvotes, and consistency. Stand out as an expert.",
    },
    {
      icon: CheckCircle,
      title: "Verified Answers",
      description:
        "Thread authors and admins verify answers as Correct or Incorrect. No more sifting through noise to find the truth.",
    },
    {
      icon: Trophy,
      title: "Achievements & Medals",
      description:
        "Unlock prestigious titles like Gold Scholar and Sharp Shot. Showcase your expertise directly on your profile.",
    },
    {
      icon: ShieldCheck,
      title: "Built for Aspirants",
      description: "Smart search, nested replies, and chronological discussions. Everything you need to crack your exam.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
            <Zap className="h-3.5 w-3.5" />
            New: Answer Verification System
          </div>
          <h2 className="mb-4 text-3xl font-black sm:text-4xl text-foreground">
            More Signal. Less Noise.
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            ExamPrep India rewards accuracy and clarity. Our gamified reputation system ensures the best answers always rise to the top.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-2xl border border-border/40 bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
