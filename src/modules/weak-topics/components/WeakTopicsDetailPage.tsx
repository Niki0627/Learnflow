"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, Loader2, TrendingDown, Play } from "lucide-react";
import { cn } from "@/src/core/utils/cn";
import { fetchWeakTopics } from "../api";
import type { WeakTopicItem } from "../types";

const getSeverity = (pct: number) => {
  if (pct < 40) return { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20", dot: "bg-red-500", label: "Critical" };
  if (pct < 70) return { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20", dot: "bg-amber-500", label: "Needs Work" };
  return { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20", dot: "bg-emerald-500", label: "Fair" };
};

const SUBJECT_COLORS = ["#2563EB", "#7C3AED", "#DB2777", "#EA580C", "#16A34A", "#0891B2"];

type EnrichedWeakTopic = WeakTopicItem & { accuracy: number };

function TopicChip({
  topic,
  subject,
  accuracy,
  noteId,
  onNavigate,
}: {
  topic: string;
  subject: string;
  accuracy: number;
  noteId: string | number | undefined;
  onNavigate: (action: string, topic: string, subject: string, noteId: string | number | undefined) => void;
}) {
  const [showPopup, setShowPopup] = useState(false);
  const sev = getSeverity(accuracy);
  return (
    <div className="relative">
      <button
        onClick={() => setShowPopup(!showPopup)}
        className={cn("flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all hover:-translate-y-0.5", sev.bg, sev.text, sev.border)}
      >
        <span>{topic}</span>
        <span className="opacity-60 text-xs">{accuracy}%</span>
      </button>

      {showPopup && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowPopup(false)} />
          <div className="absolute z-40 top-full mt-2 left-0 w-64 rounded-2xl border bg-card shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
            <h4 className="font-black text-sm mb-1">{topic}</h4>
            <div className="flex items-center gap-2 mb-4">
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", sev.bg, sev.text)}>{sev.label}</span>
              <span className="text-xs text-muted-foreground">{accuracy}% accuracy</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">Mastery</span>
                <span className={cn("text-xs font-bold", sev.text)}>{accuracy}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", sev.dot)} style={{ width: `${accuracy}%`, backgroundColor: accuracy < 40 ? "#ef4444" : accuracy < 70 ? "#f59e0b" : "#10b981" }} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowPopup(false); onNavigate("practice", topic, subject, noteId); }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-black text-primary-foreground transition hover:bg-primary/90">
                <Play size={13} /> Practice
              </button>
              <button onClick={() => { setShowPopup(false); onNavigate("explain", topic, subject, noteId); }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black transition hover:bg-muted">
                Explain
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function WeakTopicsDetailPage() {
  const [topics, setTopics] = useState<WeakTopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const routeParams = useParams();
  const noteId = String(routeParams?.noteId ?? "");
  const router = useRouter();

  const loadWeakTopics = useCallback(() => {
    setLoading(true); setError("");
    fetchWeakTopics(noteId)
      .then((data) => setTopics(data || []))
      .catch(() => { setTopics([]); setError("We could not load weak topics right now."); })
      .finally(() => setLoading(false));
  }, [noteId]);

  useEffect(() => { loadWeakTopics(); }, [loadWeakTopics]);

  const handleNavigate = (action: string, topic: string, subject: string, nId: string | number | undefined) => {
    if (action === "explain") {
      router.push(`/concept-coach?topic=${encodeURIComponent(topic)}&subject=${encodeURIComponent(subject || "")}&autoExplain=true`);
    } else {
      router.push(`/quiz/${nId || noteId}`);
    }
  };

  const enrichedTopics: EnrichedWeakTopic[] = [...topics]
    .map((t) => ({ ...t, accuracy: Math.max(0, Math.min(100, Math.round((1 - Number(t.score || 0)) * 100))), subject: t.subject || "General" }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const subjectGroups = enrichedTopics.reduce<Record<string, EnrichedWeakTopic[]>>((acc, t) => { if (!acc[t.subject]) acc[t.subject] = []; acc[t.subject].push(t); return acc; }, {});
  const allSubjects = Object.keys(subjectGroups);

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b pb-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Weak Topics</p>
          <h1 className="text-4xl font-black tracking-tight">Lecture {noteId}</h1>
          <p className="mt-3 text-lg font-medium text-muted-foreground max-w-xl">
            Prioritize weak areas — click any topic chip to practice or get an instant AI explanation.
          </p>
        </div>
        <button onClick={loadWeakTopics} className="flex shrink-0 items-center gap-2 rounded-xl border bg-card px-5 py-3 text-sm font-bold hover:bg-muted transition-colors shadow-sm">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 rounded-2xl border bg-card p-6">
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Severity key:</span>
        {[{ color: "bg-red-500", label: "Critical (<40%)" }, { color: "bg-amber-500", label: "Needs Work (40–70%)" }, { color: "bg-emerald-500", label: "Fair (>70%)" }].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${color}`} />
            <span className="text-sm font-semibold text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm font-semibold text-red-600">
          {error}
          <button onClick={loadWeakTopics} className="text-xs font-black text-red-600 underline hover:no-underline">Retry</button>
        </div>
      )}

      {!loading && !error && enrichedTopics.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-24 text-center text-muted-foreground">
          <TrendingDown size={56} className="mb-4 opacity-20" />
          <h3 className="text-xl font-bold mb-2">No weak topics yet</h3>
          <p className="text-sm max-w-sm">Complete a quiz for this lecture to surface weak concepts and recommendations.</p>
          <button onClick={() => router.push(`/quiz/${noteId}`)} className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground transition hover:bg-primary/90">
            <Play size={16} /> Go to Quiz
          </button>
        </div>
      )}

      {!loading && !error && allSubjects.length > 0 && (
        <div className="flex flex-col gap-6">
          {allSubjects.map((subject, subjectIdx) => {
            const color = SUBJECT_COLORS[subjectIdx % SUBJECT_COLORS.length];
            const group = subjectGroups[subject];
            const avgAcc = Math.round(group.reduce((s, t) => s + t.accuracy, 0) / group.length);
            const sev = getSeverity(avgAcc);
            const worst = group[0];
            return (
              <div key={subject} className="rounded-3xl border bg-card shadow-sm overflow-hidden" style={{ borderLeft: `4px solid ${color}` }}>
                <div className="p-7">
                  {/* Subject header */}
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-black" style={{ color }}>{subject}</h2>
                      <span className="rounded-full px-3 py-0.5 text-sm font-bold" style={{ backgroundColor: `${color}18`, color }}>
                        {group.length} topic{group.length > 1 ? "s" : ""}
                      </span>
                      <span className={cn("rounded-full px-3 py-0.5 text-sm font-bold", sev.bg, sev.text)}>Avg: {avgAcc}%</span>
                    </div>
                    <button onClick={() => router.push(`/quiz/${noteId}`)}
                      className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-bold transition hover:bg-muted"
                      style={{ borderColor: `${color}40`, color }}>
                      <Play size={13} /> Practice All
                    </button>
                  </div>

                  {/* Topic chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {group.map((t, i) => (
                      <TopicChip key={`${t.topic}-${i}`} topic={t.topic || `Topic ${i + 1}`} subject={subject} accuracy={t.accuracy} noteId={t.note_id || noteId} onNavigate={handleNavigate} />
                    ))}
                  </div>

                  {/* Worst topic progress bar */}
                  {worst && (
                    <div className="rounded-2xl bg-muted/50 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-muted-foreground">Most critical: <strong className="text-foreground">{worst.topic}</strong></span>
                        <span className={cn("text-xs font-black", getSeverity(worst.accuracy).text)}>{worst.accuracy}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${worst.accuracy}%`, backgroundColor: worst.accuracy < 40 ? "#ef4444" : worst.accuracy < 70 ? "#f59e0b" : "#10b981" }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
