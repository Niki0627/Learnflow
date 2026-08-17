"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, Tooltip,
} from "recharts";
import {
  Bell, CalendarDays, Check, CheckCircle, FileQuestion, GraduationCap, PlayCircle,
  Upload, Flame, BrainCircuit, FileText, AlertTriangle, LayoutDashboard, Loader2,
  Trash2, Plus, X,
} from "lucide-react";
import { useAuth } from "@/src/core/auth/context";
import { cn } from "@/src/core/utils/cn";
import { formatUsername } from "@/src/core/utils/formatUsername";
import { fetchDashboardStats, explainWeakTopicApi } from "../api";
import type { DashboardStats, WeakTopic, WeakTopicExplanation, Todo } from "../types";

// ─── Stat Card ────────────────────────────────────────────────

const THEME = {
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-600", icon: "bg-orange-500/20" },
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-600", icon: "bg-indigo-500/20" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-600", icon: "bg-emerald-500/20" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-600", icon: "bg-amber-500/20" },
};

function StatCard({ title, value, subtext, icon: Icon, themeColor = "indigo" }: {
  title: string; value: string | number; subtext?: string;
  icon: React.ElementType; themeColor?: keyof typeof THEME;
}) {
  const t = THEME[themeColor];
  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] p-6 shadow-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-md", t.bg, t.border)}>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", t.icon)}>
            <Icon size={28} className={t.text} />
          </div>
          {subtext && <span className={cn("rounded-lg px-2.5 py-1 text-xs font-bold", t.icon, t.text)}>{subtext}</span>}
        </div>
        <div>
          <h3 className={cn("text-4xl font-black tracking-tight", t.text)}>{value}</h3>
          <p className={cn("mt-1 text-sm font-semibold opacity-80", t.text)}>{title}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Action Card ────────────────────────────────────────

function QuickActionCard({ title, subtitle, icon: Icon, href, colorClass }: {
  title: string; subtitle: string; icon: React.ElementType; href: string; colorClass: string;
}) {
  const router = useRouter();
  const borderTint = colorClass.split(" ")[0].replace("bg-", "border-").replace("500", "500/20");
  return (
    <div
      onClick={() => router.push(href)}
      className={cn("group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md", borderTint)}
    >
      <div className={cn("mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6", colorClass)}>
        <Icon size={26} />
      </div>
      <div>
        <h4 className="mb-2 text-lg font-bold text-foreground">{title}</h4>
        <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
      </div>
      <div className="absolute bottom-6 right-6 translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white", colorClass.split(" ")[0])}>→</div>
      </div>
    </div>
  );
}

// ─── Todo Modal ────────────────────────────────────────────────

function TodoModal({ onClose }: { onClose: () => void }) {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("dashboard_todos") ?? "[]"); } catch { return []; }
  });
  const [newTodo, setNewTodo] = useState("");

  const save = (next: Todo[]) => {
    setTodos(next);
    localStorage.setItem("dashboard_todos", JSON.stringify(next));
  };
  const add = () => { if (newTodo.trim()) { save([...todos, { id: Date.now(), text: newTodo.trim(), completed: false }]); setNewTodo(""); } };
  const toggle = (id: number) => save(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const del = (id: number) => save(todos.filter(t => t.id !== id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-card border shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"><X size={18} /></button>
        <h2 className="text-xl font-black mb-6 flex items-center gap-2"><CalendarDays className="text-primary" /> Daily Goals</h2>
        <div className="flex gap-2 mb-6">
          <input type="text" placeholder="Add a new task..." className="flex-1 bg-muted rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-primary"
            value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
          <button onClick={add} className="bg-primary text-primary-foreground p-2 rounded-xl hover:bg-primary/90 transition-colors"><Plus size={20} /></button>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {todos.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8 font-medium">No tasks yet. Add your first goal!</p>
          ) : todos.map(todo => (
            <div key={todo.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <button onClick={() => toggle(todo.id)} className={cn("w-5 h-5 rounded-md border flex items-center justify-center transition-colors", todo.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30")}>
                  {todo.completed && <Check size={14} />}
                </button>
                <span className={cn("text-sm font-medium transition-colors", todo.completed && "line-through text-muted-foreground")}>{todo.text}</span>
              </div>
              <button onClick={() => del(todo.id)} className="text-muted-foreground hover:text-red-500 p-1 rounded-md hover:bg-red-500/10 transition-colors"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Weak Topic Modal ──────────────────────────────────────────

interface WeakDialogState {
  open: boolean; topic: string | null; subject: string | null;
  noteId: number | null; data: WeakTopicExplanation | null; loading: boolean;
}

function WeakTopicModal({ state, onClose, onRetry, onPractice }: {
  state: WeakDialogState; onClose: () => void; onRetry: () => void; onPractice: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border shadow-2xl p-6 sm:p-8 relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"><X size={18} /></button>
        <div className="mb-6">
          <h2 className="text-2xl font-black flex items-center gap-3"><PlayCircle className="text-primary" /> Learn: {state.topic}</h2>
          {state.subject && <p className="text-sm font-semibold text-muted-foreground mt-1 ml-9">{state.subject}</p>}
        </div>
        {state.loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
            <p className="font-bold">Generating personalized AI explanation...</p>
          </div>
        ) : state.data?.error ? (
          <div className="text-center py-8">
            <p className="text-red-500 font-bold mb-4">{state.data.error}</p>
            {state.data.canRetry && <button onClick={onRetry} className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold">Try Again</button>}
          </div>
        ) : state.data ? (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-2">Understanding the Topic</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{state.data.explanation}</p>
            </div>
            {state.data.key_concepts && state.data.key_concepts.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3">Key Concepts</h3>
                <ul className="space-y-2">
                  {state.data.key_concepts.map((c, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground"><CheckCircle className="text-emerald-500 shrink-0" size={18} /><span>{c}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {state.data.common_mistakes && state.data.common_mistakes.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3">Common Mistakes</h3>
                <ul className="space-y-2">
                  {state.data.common_mistakes.map((c, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground"><AlertTriangle className="text-red-500 shrink-0" size={18} /><span>{c}</span></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-4 flex justify-end gap-3">
              <button onClick={onClose} className="px-6 py-2 rounded-full font-bold hover:bg-muted transition-colors">Close</button>
              <button onClick={onPractice} className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
                <BrainCircuit size={18} /> Start Practice
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ───────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [todoOpen, setTodoOpen] = useState(false);
  const [weakDialog, setWeakDialog] = useState<WeakDialogState>({
    open: false, topic: null, subject: null, noteId: null, data: null, loading: false,
  });

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch {
      setStatsError("Could not load your dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    const handleVisibility = () => { if (!document.hidden) loadStats(); };
    document.addEventListener("visibilitychange", handleVisibility);
    const timer = setInterval(() => { if (!document.hidden) loadStats(); }, 30000);
    return () => { document.removeEventListener("visibilitychange", handleVisibility); clearInterval(timer); };
  }, [loadStats]);

  const explainWeakTopic = async (topic: string, subject: string, noteId: number | null) => {
    setWeakDialog({ open: true, topic, subject, noteId, data: null, loading: true });
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await explainWeakTopicApi(topic, subject, controller.signal);
      clearTimeout(timeout);
      setWeakDialog(prev => ({ ...prev, data: res.data, loading: false }));
    } catch (err: unknown) {
      const msg = err instanceof Error && err.name === "AbortError" ? "Request timed out." : "Failed to load explanation.";
      setWeakDialog(prev => ({ ...prev, loading: false, data: { error: msg, canRetry: true } }));
    }
  };

  const d = stats ?? {
    streak: 0, questions_answered: 0, topics_mastered: 0, avg_score: 0,
    weekly_activity: [], quiz_scores: [], weak_topics: [], mastery_data: [],
    recent_activity: [], score_distribution: [], skill_radar: [],
    total_lectures: 0, total_flashcards: 0, quiz_attempts: 0,
    unread_notifications: 0, average_score: 0, study_time: "",
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName = user?.first_name ? `${user.first_name} ${user.last_name ?? ""}`.trim() : formatUsername(user?.username ?? user?.email ?? "");

  void Bell; // ensure all imports used

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-bold text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-card p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-2">
            {greeting},{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">{displayName}</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Ready to crush your goals today? You have a{" "}
            <span className="font-bold text-orange-500">{d.streak}-day streak!</span>
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button onClick={() => setTodoOpen(true)} className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full font-bold hover:scale-105 transition-transform shadow-lg">
            <CalendarDays size={18} /><span>Daily Goals</span>
          </button>
        </div>
      </div>

      {statsError && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">{statsError}</div>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Current Streak" value={`${d.streak} Days`} subtext="Keep it up!" icon={Flame} themeColor="orange" />
        <StatCard title="Questions Answered" value={d.questions_answered} subtext="Total" icon={FileQuestion} themeColor="indigo" />
        <StatCard title="Topics Mastered" value={d.topics_mastered} subtext=">80% mastery" icon={GraduationCap} themeColor="emerald" />
        <StatCard title="Avg. Quiz Score" value={`${d.avg_score}%`} subtext="Lifetime" icon={BrainCircuit} themeColor="amber" />
      </div>

      {/* Quick Actions */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-6 w-1.5 rounded-full bg-primary" />
          <h2 className="text-2xl font-black tracking-tight">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard title="Start Adaptive Quiz" subtitle="Test your knowledge on weak areas." icon={BrainCircuit} colorClass="bg-indigo-500 text-white" href="/quiz" />
          <QuickActionCard title="Upload Notes" subtitle="Generate summaries and flashcards." icon={Upload} colorClass="bg-emerald-500 text-white" href="/lectures" />
          <QuickActionCard title="Study Plan" subtitle="Create a personalized study guide." icon={FileText} colorClass="bg-amber-500 text-white" href="/study-plan" />
          <QuickActionCard title="Exam Prep" subtitle="Generate strategies & practice." icon={GraduationCap} colorClass="bg-pink-500 text-white" href="/exam-preparation" />
        </div>
      </div>

      {/* Insights */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-6 w-1.5 rounded-full bg-purple-500" />
          <h2 className="text-2xl font-black tracking-tight">Insights</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Weekly Activity */}
          <div className="rounded-[2rem] border border-indigo-500/20 bg-card p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500"><LayoutDashboard size={20} /></div>
              Weekly Activity
            </h3>
            <div className="h-[260px]">
              {d.weekly_activity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={d.weekly_activity}>
                    <defs>
                      <linearGradient id="colorQ" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)" }} />
                    <Area type="monotone" dataKey="questions" stroke="#6366F1" strokeWidth={3} fill="url(#colorQ)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
                  <LayoutDashboard size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-semibold">Not enough data yet.</p>
                  <p className="text-xs text-muted-foreground">Start practicing to see your activity!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Scores */}
          <div className="rounded-[2rem] border border-emerald-500/20 bg-card p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500"><CheckCircle size={20} /></div>
              Recent Scores
            </h3>
            <div className="h-[260px]">
              {d.quiz_scores.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.quiz_scores}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" />
                        <stop offset="95%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="score" fill="url(#colorScore)" radius={[6, 6, 6, 6]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
                  <CheckCircle size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-semibold">No quiz scores yet.</p>
                  <p className="text-xs text-muted-foreground">Complete a quiz to see your progress!</p>
                </div>
              )}
            </div>
          </div>

          {/* Weak Topics */}
          <div className="flex flex-col rounded-[2rem] border border-red-500/20 bg-card p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <div className="rounded-lg bg-red-500/10 p-2 text-red-500"><AlertTriangle size={20} /></div>
                Weak Topics
              </h3>
              <button onClick={() => router.push("/weak-topics")} className="text-xs font-bold text-primary hover:underline">View All</button>
            </div>
            <div className="flex flex-1 flex-wrap content-start gap-2 overflow-y-auto max-h-[260px]">
              {d.weak_topics.length > 0 ? (
                d.weak_topics.slice(0, 12).map((w: WeakTopic, idx) => {
                  const isCritical = (w.accuracy ?? 0) < 40;
                  const isWarning = !isCritical && (w.accuracy ?? 0) < 70;
                  return (
                    <button key={idx} onClick={() => explainWeakTopic(w.topic, w.subject, w.note_id ?? null)}
                      className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-all hover:-translate-y-0.5",
                        isCritical ? "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20"
                          : isWarning ? "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                      )}>
                      <span>{w.topic}</span><span className="opacity-70">{w.accuracy}%</span>
                    </button>
                  );
                })
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-center opacity-60 py-8">
                  <CheckCircle size={32} className="mb-2 text-emerald-500" />
                  <p className="text-sm font-semibold">Great job! No weak topics detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {todoOpen && <TodoModal onClose={() => setTodoOpen(false)} />}
      {weakDialog.open && (
        <WeakTopicModal
          state={weakDialog}
          onClose={() => setWeakDialog(prev => ({ ...prev, open: false }))}
          onRetry={() => explainWeakTopic(weakDialog.topic!, weakDialog.subject!, weakDialog.noteId)}
          onPractice={() => {
            const nid = weakDialog.noteId;
            setWeakDialog(prev => ({ ...prev, open: false }));
            router.push(nid ? `/quiz?noteIds=${nid}&n=10` : "/quiz");
          }}
        />
      )}
    </div>
  );
}
