"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Trophy,
  CheckCircle,
  X,
  Timer,
  Flame,
  TrendingUp,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { api } from "@/src/lib/api-client";
import { cn } from "@/src/lib/utils";

interface AnswerRecord {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizResultData {
  score: number;
  total: number;
  noteId?: number;
  answers: AnswerRecord[];
  totalTimeTaken?: number;
}

const getGrade = (pct: number) => {
  if (pct >= 90) return { grade: "A+", color: "text-emerald-500", msg: "Excellent!" };
  if (pct >= 80) return { grade: "A", color: "text-emerald-500", msg: "Great job!" };
  if (pct >= 70) return { grade: "B", color: "text-blue-500", msg: "Good work!" };
  if (pct >= 60) return { grade: "C", color: "text-amber-500", msg: "Keep practicing" };
  return { grade: "D", color: "text-red-500", msg: "Needs improvement" };
};

const formatTime = (s?: number | null) => {
  if (s == null) return "--";
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return mins === 0 ? `${secs}s` : `${mins}m ${secs}s`;
};

export default function QuizResultPage() {
  const router = useRouter();
  // Read result from sessionStorage (written by the quiz session page)
  const [data, setData] = useState<QuizResultData | null>(null);
  const [streak, setStreak] = useState(0);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("lf:quiz-result");
    if (!raw) { router.replace("/quiz"); return; }
    try {
      const parsed = JSON.parse(raw) as QuizResultData;
      setData(parsed);
      // Confetti for high scores
      if (Math.round((parsed.score / parsed.total) * 100) >= 70) {
        import("canvas-confetti").then(m => {
          const confetti = m.default;
          const end = Date.now() + 3000;
          const frame = () => {
            confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
            confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
            if (Date.now() < end) requestAnimationFrame(frame);
          };
          frame();
        }).catch(() => {});
      }
    } catch { router.replace("/quiz"); }

    api.get<{ streak: number }>("dashboard/stats/")
      .then(d => setStreak(d.streak))
      .catch(() => {});
  }, [router]);

  const percentage = data ? Math.round((data.score / data.total) * 100) : 0;
  const avgTime = data?.total && data.totalTimeTaken ? Math.round(data.totalTimeTaken / data.total) : null;

  const chartData = useMemo(() => {
    if (!data?.answers?.length) return [];
    let cumCorrect = 0;
    return data.answers.map((ans, i) => {
      if (ans.isCorrect) cumCorrect++;
      return { name: `Q${i + 1}`, score: Math.round((cumCorrect / (i + 1)) * 100) };
    });
  }, [data]);

  const breakdown = useMemo(() => {
    if (!data?.answers?.length) return [];
    const g = Math.ceil(data.answers.length / 3);
    return [
      { label: "First Phase", items: data.answers.slice(0, g) },
      { label: "Middle Phase", items: data.answers.slice(g, g * 2) },
      { label: "Final Phase", items: data.answers.slice(g * 2) },
    ]
      .filter(x => x.items.length)
      .map(x => ({
        label: x.label,
        pct: Math.round((x.items.filter(a => a.isCorrect).length / x.items.length) * 100),
      }));
  }, [data]);

  if (!data) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  );

  const { grade, color: gradeColor, msg: gradeMsg } = getGrade(percentage);

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-card p-8 rounded-[2.5rem] border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary">
              Completed
            </span>
            <span className="text-muted-foreground text-sm">• {data.total} questions</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Quiz Results</h1>
          <p className="text-muted-foreground font-medium mt-1">
            {new Date().toLocaleDateString()} at{" "}
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowReview(!showReview)}
            className="flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition"
          >
            {showReview ? <><ChevronUp size={16} /> Hide Review</> : <><ChevronDown size={16} /> Review Questions</>}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition"
          >
            Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Overall Score", value: `${percentage}%`, sub: `${grade} · ${gradeMsg}`, icon: TrendingUp, color: "indigo" },
          { label: "Accuracy", value: `${percentage}%`, sub: `${data.score} correct / ${data.total - data.score} wrong`, icon: CheckCircle, color: "emerald" },
          { label: "Time Taken", value: formatTime(data.totalTimeTaken), sub: avgTime ? `~${avgTime}s avg/q` : "Total time", icon: Timer, color: "amber" },
          { label: "Study Streak", value: `${streak} Day${streak !== 1 ? "s" : ""}`, sub: streak > 0 ? "Keep the momentum!" : "Start today", icon: Flame, color: "red" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className={cn("rounded-[2rem] border bg-card p-6 shadow-sm", `border-${color}-500/20`)}>
            <div className={cn("flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-wider", `text-${color}-500`)}>
              <Icon size={16} /> {label}
            </div>
            <div className="text-3xl font-black">{value}</div>
            <div className="text-sm text-muted-foreground font-medium mt-1">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* ── Left ── */}
        <div className="flex flex-col gap-6">
          {/* Performance Chart */}
          {chartData.length > 0 && (
            <div className="rounded-[2rem] border border-indigo-500/20 bg-card p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Performance Analysis</h3>
                  <p className="text-sm text-muted-foreground">Score progression during quiz</p>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-xs font-black", percentage >= 70 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600")}>
                  Final: {percentage}%
                </span>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="rScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                      formatter={(v: any) => [`${v}%`, "Score"]}
                    />
                    <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={3} fill="url(#rScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Question Review */}
          {showReview && (
            <div className="rounded-[2rem] border border-border bg-card shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/30">
                <h3 className="text-lg font-bold">Question Review</h3>
              </div>
              <div className="divide-y divide-border">
                {data.answers.map((ans, i) => (
                  <div key={i} className="p-5 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={cn("shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full", ans.isCorrect ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600")}>
                        {ans.isCorrect ? <CheckCircle size={16} /> : <X size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm mb-2">{ans.question}</p>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span className={cn("font-bold", ans.isCorrect ? "text-emerald-600" : "text-red-500")}>
                            You: {ans.userAnswer === "TIMEOUT" ? "Timed Out" : ans.userAnswer}
                          </span>
                          {!ans.isCorrect && (
                            <span className="text-muted-foreground">Correct: {ans.correctAnswer}</span>
                          )}
                        </div>
                        {ans.explanation && !ans.isCorrect && (
                          <p className="text-xs text-muted-foreground italic mt-2">{ans.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div className="flex flex-col gap-6">
          {/* AI Insights */}
          <div className="rounded-[2rem] border border-primary/20 bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-lg bg-primary/10 p-2 text-primary"><Sparkles size={18} /></div>
              <h3 className="font-bold">AI Insights</h3>
            </div>

            <div className={cn("rounded-2xl p-4 border", percentage >= 70 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20")}>
              <p className={cn("text-sm font-black mb-1", percentage >= 70 ? "text-emerald-600" : "text-red-600")}>
                {percentage >= 70 ? "Strong Performance" : "Room to Improve"}
              </p>
              <p className="text-sm text-foreground">
                {percentage >= 90 ? "Outstanding! You have mastered this material." :
                 percentage >= 70 ? `Great job! You got ${data.score}/${data.total} correct. Review the ${data.total - data.score} missed.` :
                 `You got ${data.score}/${data.total}. A focused study session will help.`}
              </p>
            </div>

            {avgTime != null && (
              <div className="rounded-2xl p-4 border border-blue-500/20 bg-blue-500/10">
                <p className="text-sm font-black text-blue-600 mb-1">Speed Analysis</p>
                <p className="text-sm text-foreground">
                  {avgTime <= 15 ? "Excellent pace! You answered quickly and confidently." :
                   avgTime <= 25 ? `${avgTime}s avg per question — good balance.` :
                   `${avgTime}s avg per question. Accuracy matters more than speed.`}
                </p>
              </div>
            )}

            <div className="rounded-2xl p-4 border border-amber-500/20 bg-amber-500/10">
              <p className="text-sm font-black text-amber-600 mb-1 flex items-center gap-1"><Lightbulb size={14} /> Recommended Focus</p>
              <p className="text-sm text-foreground">
                {data.total - data.score > 0
                  ? `Review the ${data.total - data.score} missed questions. Consider generating a study plan.`
                  : "Excellent! Try a harder quiz or explore new topics."}
              </p>
              {data.total - data.score > 0 && (
                <button onClick={() => router.push("/study-plan")} className="mt-2 text-xs font-bold text-amber-600 hover:underline">
                  Go to Study Plan →
                </button>
              )}
            </div>
          </div>

          {/* Breakdown */}
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <h3 className="font-bold mb-5">Performance Breakdown</h3>
            {breakdown.length > 0 ? (
              <div className="space-y-4">
                {breakdown.map(b => (
                  <div key={b.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-semibold text-muted-foreground">{b.label}</span>
                      <span className="text-sm font-bold">{b.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-1000"
                        style={{ width: `${b.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 text-center">
              <div><div className="text-2xl font-black text-emerald-500">{data.score}</div><div className="text-xs text-muted-foreground">Correct</div></div>
              <div><div className="text-2xl font-black text-red-500">{data.total - data.score}</div><div className="text-xs text-muted-foreground">Wrong</div></div>
              <div><div className="text-2xl font-black text-primary">{data.total}</div><div className="text-xs text-muted-foreground">Total</div></div>
            </div>
          </div>

          <button
            onClick={() => router.push("/quiz")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition"
          >
            <Trophy size={18} /> Try Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
