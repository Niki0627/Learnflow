import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  Layers,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Lecture Workspace",
    desc: "Upload PDFs, read them in a clean viewer, and keep notes right next to your content.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Brain,
    title: "AI Practice Engine",
    desc: "Automatically generate quizzes, flashcards, summaries, and identify your weak spots.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Target,
    title: "Exam Readiness",
    desc: "Build structured study plans and track your progress toward your exam date.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Layers,
    title: "Flashcard Studio",
    desc: "Spaced-repetition flashcards built directly from your own lecture content.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    desc: "One place to see your streak, weak topics, quiz scores, and next actions.",
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    icon: Zap,
    title: "Concept Coach",
    desc: "Get instant AI-powered explanations for any concept you're struggling with.",
    gradient: "from-cyan-500 to-blue-600",
  },
];

const steps = [
  { num: "01", title: "Upload your lecture", desc: "Drop a PDF or paste your notes — LearnFlow ingests and structures your content." },
  { num: "02", title: "Generate study aids", desc: "With one click, get summaries, quizzes, flashcards, and key concepts from any lecture." },
  { num: "03", title: "Review & Improve", desc: "The dashboard surfaces your weakest areas so you always study what matters most." },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* ── Nav ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
              <GraduationCap size={20} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              <span className="text-violet-600">Learn</span>Flow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="rounded-full px-5 py-2 text-sm font-bold text-slate-600 transition hover:text-slate-900"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-500 hover:shadow-violet-500/40"
            >
              Get started <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
        {/* Background glow - subtle for light mode */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/50 blur-[100px]" />
          <div className="absolute left-1/4 top-2/3 h-[400px] w-[400px] rounded-full bg-blue-100/50 blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
            <Sparkles size={14} />
            AI-Powered Study Platform
          </div>

          <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Study smarter,
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              not harder.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-slate-600">
            Upload your lectures, generate quizzes and flashcards automatically, find your weak spots, and walk into every exam prepared. All in one workspace.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/20 transition hover:scale-105 hover:shadow-violet-500/30 active:scale-95"
            >
              Start for free <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Sign in to dashboard
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-500">
            {["No credit card required", "Start in under 2 minutes", "Cancel anytime"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-slate-50 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-violet-600">How it works</p>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">From lecture to mastery</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">Three steps to transform how you study</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.num} className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-6 text-5xl font-black text-slate-100">{step.num}</div>
                <h3 className="mb-3 text-xl font-black text-slate-900">{step.title}</h3>
                <p className="text-base leading-relaxed text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-violet-600">Everything you need</p>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Built for serious students</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-violet-200 hover:shadow-md hover:-translate-y-1"
                >
                  <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} shadow-md text-white`}>
                    <Icon size={26} strokeWidth={1.8} />
                  </div>
                  <h3 className="mb-3 text-lg font-black text-slate-900">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-slate-50 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-12 text-center shadow-2xl shadow-violet-500/20">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="relative text-white">
              <h2 className="text-4xl font-black tracking-tight">Ready to level up?</h2>
              <p className="mx-auto mt-5 max-w-xl text-lg font-medium leading-relaxed text-white/90">
                Join students who turned their scattered notes into a structured, AI-powered study system.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-black text-violet-700 shadow-xl transition hover:scale-105 active:scale-95"
              >
                Create free account <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            <GraduationCap size={16} />
          </div>
          <span className="font-black text-slate-900"><span className="text-violet-600">Learn</span>Flow</span>
        </div>
        <p>© {new Date().getFullYear()} LearnFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
