"use client";

import { Search, BookOpen, FileText, Layout, Award, Filter, ArrowRight, GraduationCap, History, Globe, Shield, Microscope } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import dynamic from 'next/dynamic';

const ThreeDElement = dynamic(() => import('../../components/ThreeDElement'), { ssr: false });

const CATEGORIES = [
  {
    title: "UPSC Prelims",
    description: "Objective type questions (GS Paper I & CSAT)",
    icon: Layout,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    link: "/questions/prelims",
    count: "2500+ Questions"
  },
  {
    title: "UPSC Mains",
    description: "Subjective questions for GS I, II, III, IV & Essay",
    icon: FileText,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    link: "/questions/mains",
    count: "1200+ Questions"
  },
  {
    title: "Optional Subjects",
    description: "Specialized papers for various optional selections",
    icon: GraduationCap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    link: "/questions/optional",
    count: "800+ Questions"
  },
  {
    title: "State PSC",
    description: "Previous year questions for various State Services",
    icon: Award,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    link: "/questions/state-psc",
    count: "3000+ Questions"
  }
];

const SUBJECTS = [
  { name: "Indian Polity", icon: Shield, color: "bg-blue-500" },
  { name: "Modern History", icon: History, color: "bg-orange-500" },
  { name: "Geography", icon: Globe, color: "bg-green-500" },
  { name: "Economy", icon: Award, color: "bg-emerald-500" },
  { name: "S&T", icon: Microscope, color: "bg-purple-500" },
  { name: "Environment", icon: Globe, color: "bg-teal-500" }
];

export default function QuestionBankPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden border-b border-border/40 bg-muted/20">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[center_top_-1px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <ThreeDElement />

        <div className="container relative mx-auto px-6 max-w-6xl text-center z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-600 mb-6">
            <BookOpen className="h-4 w-4" />
            <span>Over 10,000+ Previous Year Questions</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Question Bank
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Access organized, year-wise and subject-wise previous year questions (PYQs) for UPSC and State PSC exams.
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search PYQs (e.g. 2024 Polity)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background pl-12 pr-28 py-4 text-base md:text-lg shadow-2xl shadow-primary/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-muted-foreground/60"
            />
            <button className="absolute right-2 top-2 bottom-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 active:scale-95">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Main Categories */}
      <section className="py-20 container mx-auto px-6 max-w-6xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Exam Categories</h2>
            <p className="text-muted-foreground">Select an exam format to browse questions</p>
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            View All Exams <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, i) => (
            <Link 
              key={i}
              href={cat.link}
              className="group relative rounded-3xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className={`h-12 w-12 rounded-2xl ${cat.bg} flex items-center justify-center ${cat.color} mb-6 transition-transform group-hover:scale-110 duration-300`}>
                <cat.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{cat.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{cat.description}</p>
              <div className="text-xs font-bold text-primary uppercase tracking-widest">{cat.count}</div>
              
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Subject Filter Chips */}
      <section className="py-20 border-t border-border/40 bg-muted/10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Subject</h2>
            <p className="text-muted-foreground">Deep dive into specific GS subjects and topics</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {SUBJECTS.map((sub, i) => (
              <button 
                key={i}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-background px-6 py-3 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
              >
                <div className={`h-8 w-8 rounded-lg ${sub.color} flex items-center justify-center text-white shadow-lg`}>
                  <sub.icon className="h-4 w-4" />
                </div>
                <span className="font-semibold">{sub.name}</span>
              </button>
            ))}
            <button className="flex items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-3 text-muted-foreground hover:text-foreground transition-colors group">
              <Filter className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              More Subjects
            </button>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-20 container mx-auto px-6 max-w-6xl text-center">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
          
          <h2 className="text-3xl font-bold mb-4 relative z-10">Download Year-wise PDFs</h2>
          <p className="text-blue-100/80 mb-8 max-w-xl mx-auto relative z-10">
            Get offline access to the complete set of question papers with high-quality printing format.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <button className="rounded-xl bg-white px-8 py-3 font-bold text-blue-600 shadow-xl hover:scale-105 active:scale-95 transition-all">
              2024 Prelims GS-I
            </button>
            <button className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 font-bold text-white hover:bg-white/20 transition-all">
              All Previous Years
            </button>
          </div>
        </div>
      </section>

      {/* Footer Hint */}
      <footer className="py-12 text-center text-sm text-muted-foreground border-t border-border/40">
        <p>&copy; 2026 ExamPrep India. All Question Bank materials are curated for educational purposes.</p>
      </footer>
    </div>
  );
}
