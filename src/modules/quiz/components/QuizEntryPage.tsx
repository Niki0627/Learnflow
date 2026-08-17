"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Clock, Loader2, Check, Brain } from "lucide-react";
import { cn } from "@lib/utils";
import { fetchQuizLectures } from "../api";
import type { QuizLecture } from "../types";

const TIMER_OPTIONS = [
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
  { label: "45s", value: 45 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "∞", value: 0 },
];

export default function QuizEntryPage() {
  const router = useRouter();
  const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [timerDuration, setTimerDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [lectures, setLectures] = useState<QuizLecture[]>([]);
  const [fetchingLectures, setFetchingLectures] = useState(true);

  useEffect(() => {
    fetchQuizLectures()
      .then(data => setLectures(data))
      .catch(() => setLectures([]))
      .finally(() => setFetchingLectures(false));
  }, []);

  const toggle = (id: number) =>
    setSelectedNoteIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const startQuiz = () => {
    if (selectedNoteIds.length === 0) return;
    setLoading(true);
    router.push(`/quiz/session?noteIds=${selectedNoteIds.join(",")}&n=${numQuestions}&timer=${timerDuration}`);
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Practice Arena</p>
        <h1 className="text-4xl font-black tracking-tight">Test Your Knowledge</h1>
        <p className="mt-3 text-lg font-medium text-muted-foreground max-w-xl">
          Challenge yourself with AI-generated quizzes based on your lecture notes.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* ── Left: Lecture Picker ── */}
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border bg-card p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Select Lectures</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Pick one or more lectures to draw questions from
                </p>
              </div>
              {selectedNoteIds.length > 0 && (
                <button
                  onClick={() => setSelectedNoteIds([])}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all ({selectedNoteIds.length})
                </button>
              )}
            </div>

            {fetchingLectures ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : lectures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <BookOpen size={40} className="mb-3 opacity-30" />
                <p className="font-bold">No lectures uploaded yet</p>
                <p className="text-xs mt-1">Upload notes in the Lectures section to start quizzing.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {lectures.map(l => {
                  const selected = selectedNoteIds.includes(l.id);
                  return (
                    <div
                      key={l.id}
                      onClick={() => toggle(l.id)}
                      className={cn(
                        "flex items-center gap-3.5 rounded-2xl border p-4 cursor-pointer transition-all duration-200 select-none",
                        selected
                          ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                          : "hover:border-border/80 hover:bg-muted/30"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30 bg-background"
                        )}
                      >
                        {selected && <Check size={13} strokeWidth={3} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">{l.title}</p>
                        {l.subject && (
                          <p className="truncate text-xs text-muted-foreground mt-0.5">{l.subject}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Config Panel ── */}
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border bg-card p-8 shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-black">Quiz Settings</h2>

            {/* Question count */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-foreground">Questions</label>
                <span className="text-sm font-black text-primary">{numQuestions}</span>
              </div>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumQuestions(n)}
                    className={cn(
                      "flex-1 rounded-xl py-2.5 text-xs font-black transition-all",
                      numQuestions === n
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "border bg-background hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer per question */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-primary" />
                <label className="text-sm font-bold text-foreground">Time per Question</label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TIMER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTimerDuration(opt.value)}
                    className={cn(
                      "rounded-xl py-2.5 text-xs font-black transition-all",
                      timerDuration === opt.value
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "border bg-background hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                {timerDuration === 0 ? "Untimed — take as long as you need." : `${timerDuration} seconds per question before auto-submitting.`}
              </p>
            </div>

            {/* Launch button */}
            <button
              onClick={startQuiz}
              disabled={selectedNoteIds.length === 0 || loading}
              className={cn(
                "flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-black text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:scale-100 disabled:shadow-none"
              )}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Brain size={20} />
                  Start Quiz ({selectedNoteIds.length} lecture{selectedNoteIds.length !== 1 ? "s" : ""})
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
