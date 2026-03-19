"use client";

import { BookOpen, Zap, Target, Users, ShieldCheck, Trophy } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To provide a transparent, accurate, and gamified platform for exam aspirants in India to learn and share knowledge.",
    },
    {
      icon: ShieldCheck,
      title: "Verified Accuracy",
      description: "Our unique verification system ensures that correct answers are highlighted, reducing noise for genuine learners.",
    },
    {
      icon: Users,
      title: "Community First",
      description: "Built by aspirants, for aspirants. We believe in the power of peer-to-peer learning and mentorship.",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "ClarityScore Reputation",
      description: "Earn reputation points based on the accuracy of your answers and peer upvotes.",
    },
    {
      icon: Trophy,
      title: "Achievements & Medals",
      description: "Unlock prestigious titles like Gold Scholar and Sharp Shot as you progress.",
    },
    {
      icon: BookOpen,
      title: "Comprehensive Question Bank",
      description: "Access thousands of questions across various exam categories in India.",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-primary/5">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom" />
        <div className="container relative mx-auto max-w-6xl px-4 text-center">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            About <span className="text-primary text-blue-600">ExamPrep India</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground sm:text-xl">
            We are redefining how students prepare for competitive exams in India. 
            By combining high-quality content with a robust reputation system, 
            we ensure you get the most accurate information every time.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="mb-6 rounded-2xl bg-primary/10 p-4 text-primary">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-4 text-xl font-bold">{v.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-black sm:text-4xl mb-4">Features We Offer</h2>
            <p className="text-muted-foreground text-lg">The tools you need to excel in your preparation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="rounded-xl border border-border/50 bg-background p-8 shadow-sm transition-all hover:shadow-md">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="mb-3 text-lg font-bold">{f.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
