"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Sparkles,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Loader2,
  Target,
  Trophy,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "@/src/lib/api-client";
import { cn } from "@/src/lib/utils";
import type { Lecture } from "@/src/lib/types";

interface StudyPlanSection {
  title: string;
  content: string;
  type?: string;
}

interface StudyPlanResult {
  overview?: string;
  daily_schedule?: StudyPlanSection[];
  topics?: { topic: string; priority: string; hours: number }[];
  tips?: string[];
  raw?: string;
}

interface GenerateParams {
  exam_date: string;
  hours_per_day: number;
  priority_subjects: string[];
  focus_weak_areas: boolean;
}

function PlanDisplay({ plan }: { plan: StudyPlanResult }) {
  return (
    <div className="space-y-6">
      {plan.overview && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-primary mb-3">Plan Overview</h3>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan.overview}</ReactMarkdown>
          </div>
        </div>
      )}

      {plan.topics && plan.topics.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground mb-4">Topic Priorities</h3>
          <div className="space-y-3">
            {plan.topics.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn("h-2 w-2 rounded-full shrink-0", t.priority === "high" ? "bg-red-500" : t.priority === "medium" ? "bg-amber-500" : "bg-emerald-500")} />
                <div className="flex-1 font-semibold text-sm">{t.topic}</div>
                <div className="text-xs font-bold text-muted-foreground">{t.hours}h</div>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-black",
                  t.priority === "high" ? "bg-red-500/10 text-red-600" :
                  t.priority === "medium" ? "bg-amber-500/10 text-amber-600" :
                  "bg-emerald-500/10 text-emerald-600")}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan.daily_schedule && plan.daily_schedule.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground mb-4">Daily Schedule</h3>
          <div className="space-y-4">
            {plan.daily_schedule.map((s, i) => (
              <div key={i} className="border-l-2 border-primary/30 pl-4">
                <h4 className="font-bold text-sm mb-2">{s.title}</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan.tips && plan.tips.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-600 mb-4">Study Tips</h3>
          <ul className="space-y-2">
            {plan.tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.raw && !plan.overview && !plan.daily_schedule && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan.raw}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudyPlanPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [noteId, setNoteId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [priorityInput, setPriorityInput] = useState("");
  const [focusWeak, setFocusWeak] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<StudyPlanResult | null>(null);

  useEffect(() => {
    api.get<Lecture[]>("lectures/").then(d => setLectures(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const addPriority = () => {
    const t = priorityInput.trim();
    if (t && !priorities.includes(t)) { setPriorities([...priorities, t]); setPriorityInput(""); }
  };

  const generate = async () => {
    if (!noteId) { setError("Please select a lecture note."); return; }
    setLoading(true); setError(""); setPlan(null);
    try {
      const params: GenerateParams = {
        exam_date: examDate,
        hours_per_day: hoursPerDay,
        priority_subjects: priorities,
        focus_weak_areas: focusWeak,
      };
      const res = await api.post<StudyPlanResult>("study-plan/", { note_id: noteId, ...params });
      setPlan(res);
    } catch (err: unknown) {
      const e = err as { error?: string };
      setError(e?.error ?? "Failed to generate study plan. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Target size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Mastery Schedule Planner</h1>
          <p className="text-muted-foreground font-medium">AI-powered study plan personalized to your strengths and weak areas</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        {/* Config Panel */}
        <div className="rounded-[2rem] border border-primary/20 bg-card p-8 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={20} className="text-primary" />
            <h2 className="text-lg font-bold">Plan Parameters</h2>
          </div>

          <div className="space-y-6">
            {/* Lecture */}
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Lecture Note *</label>
              <select value={noteId} onChange={e => setNoteId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="">Select a lecture...</option>
                {lectures.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
              {!noteId && <p className="text-xs text-muted-foreground mt-1">Your strengths/weaknesses will be analysed from this note</p>}
            </div>

            {/* Exam Date */}
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Target Exam Date</label>
              <div className="relative">
                <CalendarDays size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            {/* Hours */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-muted-foreground">Daily Study Hours</label>
                <span className="text-sm font-black text-primary">{hoursPerDay}h</span>
              </div>
              <input type="range" min={0.5} max={10} step={0.5} value={hoursPerDay} onChange={e => setHoursPerDay(Number(e.target.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>0.5h</span><span>10h</span></div>
            </div>

            {/* Priority Topics */}
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Priority Topics (optional)</label>
              <div className="flex gap-2 mb-2">
                <input placeholder="e.g., Thermodynamics" value={priorityInput} onChange={e => setPriorityInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addPriority())}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                <button onClick={addPriority} className="rounded-xl bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 transition">
                  <Plus size={18} />
                </button>
              </div>
              {priorities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {priorities.map(p => (
                    <span key={p} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {p}
                      <button onClick={() => setPriorities(priorities.filter(x => x !== p))} className="hover:text-red-500 transition"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Focus Weak */}
            <div className="flex items-center justify-between rounded-2xl bg-primary/5 border border-primary/20 p-4">
              <div>
                <div className="text-sm font-bold">Prioritise Weak Areas</div>
                <div className="text-xs text-muted-foreground">Extra focus on topics you struggle with</div>
              </div>
              <button
                onClick={() => setFocusWeak(!focusWeak)}
                className={cn("relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2", focusWeak ? "bg-primary" : "bg-muted")}
              >
                <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200", focusWeak ? "translate-x-5" : "translate-x-0")} />
              </button>
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</div>}

            <button onClick={generate} disabled={loading || !noteId}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Generating Your Plan...</> : <><Sparkles size={16} /> Generate Study Plan</>}
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          {loading ? (
            <div className="rounded-[2rem] border border-primary/20 bg-card p-12 shadow-sm flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10">
                <Loader2 size={36} className="text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-black">Crafting Your Plan...</h3>
              <p className="text-muted-foreground text-sm text-center max-w-sm">
                Analysing your notes, identifying weak areas, and creating a personalised schedule.
              </p>
            </div>
          ) : plan ? (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Trophy size={20} className="text-amber-500" />
                <h2 className="text-xl font-black">Your Personalised Study Plan</h2>
              </div>
              <PlanDisplay plan={plan} />
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-primary/30 bg-card/50 p-12 flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/5">
                <BookOpen size={36} className="text-primary/40" />
              </div>
              <h3 className="text-xl font-black text-foreground/60">Your plan will appear here</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Configure your parameters on the left and click "Generate Study Plan" to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
