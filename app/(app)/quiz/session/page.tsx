"use client";

import React, { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Flag,
  Timer,
  X,
  ChevronRight,
  BrainCircuit,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { api } from "@/src/lib/api-client";
import { cn } from "@/src/lib/utils";
import type { Question } from "@/src/lib/types";

const cleanOption = (text?: string | null) => {
  if (!text) return "";
  return text.replace(/^([A-D][.)]\s*|\([A-D]\)\s*)+/gi, "").trim();
};

interface AnswerRecord {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

function QuizSessionContent() {
  const router = useRouter();
  const params = useSearchParams();

  const noteIds = (params.get("noteIds") ?? "").split(",").filter(Boolean);
  const n = parseInt(params.get("n") ?? "10", 10);
  const timerDuration = parseInt(params.get("timer") ?? "30", 10);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [userAnswers, setUserAnswers] = useState<AnswerRecord[]>([]);
  const [timer, setTimer] = useState<number | null>(timerDuration > 0 ? timerDuration : null);
  const [quizStartTime] = useState(Date.now);
  const [submitting, setSubmitting] = useState(false);

  // Load questions
  useEffect(() => {
    if (noteIds.length === 0) {
      setError("No lecture notes provided.");
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const perLecture = Math.ceil(n / noteIds.length);
        let all: Question[] = [];
        for (const id of noteIds) {
          try {
            const res = await api.get<{ questions: Question[] }>(`quiz/${id}/?n=${perLecture}`);
            let fetched = res.questions ?? [];
            if (fetched.length < perLecture) {
              const needed = perLecture - fetched.length;
              if (needed > 0 && needed <= 20) {
                setGenerating(true);
                try {
                  await api.post("generate-mcqs/", { note_id: id, count: needed });
                  const res2 = await api.get<{ questions: Question[] }>(`quiz/${id}/?n=${perLecture}`);
                  fetched = res2.questions ?? [];
                } catch { /* keep whatever we have */ } finally { setGenerating(false); }
              }
            }
            all.push(...fetched);
          } catch { /* skip this lecture */ }
        }
        all = all.sort(() => Math.random() - 0.5).slice(0, n);
        if (all.length === 0) {
          setError("No questions available. Please generate questions first.");
        }
        setQuestions(all);
      } catch {
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer reset on question change
  useEffect(() => {
    if (timerDuration > 0) setTimer(timerDuration);
  }, [idx, timerDuration]);

  // Timer countdown
  useEffect(() => {
    if (!timer || timerDuration === 0 || questions.length === 0) return;
    if (timer === 0) { submitAndNext(true); return; }
    const id = setInterval(() => setTimer(t => (t !== null && t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, questions.length]);

  // Navigation guard
  useEffect(() => {
    if (loading || questions.length === 0) return;
    window.history.pushState(null, "", window.location.href);
    const onPop = () => { window.history.pushState(null, "", window.location.href); };
    const onUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; return ""; };
    window.addEventListener("popstate", onPop);
    window.addEventListener("beforeunload", onUnload);
    return () => { window.removeEventListener("popstate", onPop); window.removeEventListener("beforeunload", onUnload); };
  }, [loading, questions.length]);

  const submitAndNext = useCallback(async (autoSubmit = false) => {
    const q = questions[idx];
    if (!q || submitting) return;
    setSubmitting(true);

    const timeTaken = timerDuration > 0 ? (timerDuration - (timer ?? 0)) : 0;
    const answerToSend = selected || "TIMEOUT";

    try {
      const res = await api.post<{ correct: boolean; correct_option: string }>("submit-mcq/", {
        question_id: q.id,
        selected_option: answerToSend,
        time_taken: timeTaken,
      });

      let newScore = score;
      if (res.correct) { newScore = score + 1; setScore(newScore); }

      const record: AnswerRecord = {
        question: q.question_text,
        userAnswer: answerToSend,
        correctAnswer: res.correct_option,
        isCorrect: res.correct,
        explanation: q.explanation ?? "",
      };

      const nextAnswers = [...userAnswers, record];
      setUserAnswers(nextAnswers);

      if (idx + 1 < questions.length) {
        setIdx(i => i + 1);
        setSelected("");
      } else {
        // Quiz finished
        const totalTimeTaken = Math.round((Date.now() - quizStartTime) / 1000);
        try {
          await api.post("quiz-completed/", {
            note_id: noteIds.join(","),
            score: newScore,
            total: questions.length,
          });
          window.dispatchEvent(new CustomEvent("refreshNotifications"));
        } catch { /* navigate anyway */ }

        sessionStorage.setItem("lf:quiz-result", JSON.stringify({
          score: newScore,
          total: questions.length,
          noteId: noteIds[0] ? parseInt(noteIds[0]) : undefined,
          answers: nextAnswers,
          totalTimeTaken,
        }));
        router.replace("/quiz/result");
      }
    } catch { /* ignore network errors — still advance */ }
    finally { setSubmitting(false); }
  }, [questions, idx, selected, score, timer, timerDuration, userAnswers, quizStartTime, router, noteIds, submitting]);

  const options = useMemo(() => {
    const q = questions[idx];
    if (!q) return [];
    return [
      { key: "A", text: cleanOption(q.option_a) },
      { key: "B", text: cleanOption(q.option_b) },
      { key: "C", text: cleanOption(q.option_c) },
      { key: "D", text: cleanOption(q.option_d) },
    ].filter(o => o.text);
  }, [questions, idx]);

  const progress = questions.length > 0 ? ((idx + 1) / questions.length) * 100 : 0;
  const timerPct = timerDuration > 0 && timer !== null ? (timer / timerDuration) * 100 : 100;
  const timerColor = timerPct > 50 ? "bg-emerald-500" : timerPct > 25 ? "bg-amber-500" : "bg-red-500";

  if (generating) return (
    <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
      <BrainCircuit className="h-12 w-12 animate-pulse text-primary" />
      <p className="text-lg font-bold text-muted-foreground">Generating adaptive questions…</p>
    </div>
  );

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="max-w-md text-center space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-bold text-red-600">{error}</p>
        </div>
        <button onClick={() => router.push("/lectures")} className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition">
          Go to Lectures
        </button>
      </div>
    </div>
  );

  const q = questions[idx];

  return (
    <div className="flex flex-col gap-0 h-[calc(100vh-80px)]">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
        <button
          onClick={() => { if (window.confirm("Exit quiz? Progress will be lost.")) router.push("/quiz"); }}
          className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold hover:bg-muted transition"
        >
          <X size={16} /> Exit
        </button>

        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-muted-foreground">
            {idx + 1} / {questions.length}
          </span>
          {timerDuration > 0 && timer !== null && (
            <div className="flex items-center gap-2">
              <Timer size={16} className={timerPct <= 25 ? "text-red-500" : "text-muted-foreground"} />
              <span className={cn("text-lg font-black tabular-nums", timerPct <= 25 ? "text-red-500" : "text-foreground")}>{timer}s</span>
            </div>
          )}
        </div>
        <div className="text-sm font-bold text-muted-foreground">
          Score: <span className="text-primary">{score}</span>
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="h-1.5 w-full bg-muted">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      {timerDuration > 0 && (
        <div className="h-1 w-full bg-muted/50">
          <div className={cn("h-full transition-all duration-1000", timerColor)} style={{ width: `${timerPct}%` }} />
        </div>
      )}

      {/* ── Question ── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-sm">
                {idx + 1}
              </div>
              {q?.is_high_yield && (
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-600">
                  ⭐ High Yield
                </span>
              )}
              {q?.topic && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {q.topic}
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed">
              {q?.question_text}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {options.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSelected(opt.key)}
                disabled={submitting}
                className={cn(
                  "w-full flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-200",
                  selected === opt.key
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border hover:border-primary/40 hover:bg-muted/40"
                )}
              >
                <div className={cn(
                  "shrink-0 flex h-9 w-9 items-center justify-center rounded-xl font-black text-sm transition-all",
                  selected === opt.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {opt.key}
                </div>
                <span className={cn("flex-1 font-semibold pt-1", selected === opt.key ? "text-foreground" : "text-muted-foreground")}>{opt.text}</span>
                {selected === opt.key && (
                  <CheckCircle size={20} className="shrink-0 mt-1 text-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => submitAndNext(true)}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted transition"
            >
              <Flag size={16} /> Skip
            </button>
            <button
              onClick={() => submitAndNext(false)}
              disabled={!selected || submitting}
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {idx + 1 < questions.length ? <><ChevronRight size={18} /> Next Question</> : "Finish Quiz"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizSessionPage() {
  return (
    <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <QuizSessionContent />
    </Suspense>
  );
}
