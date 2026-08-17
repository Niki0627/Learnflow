"use client";

import React, { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Timer,
  X,
  ChevronRight,
  BrainCircuit,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@lib/utils";
import {
  fetchQuestionsForQuiz,
  generateMCQsForQuiz,
  submitMCQAnswer,
  completeQuizApi,
} from "../api";
import type { QuizQuestion, AnswerRecord } from "../types";

const cleanOption = (text?: string | null) => {
  if (!text) return "";
  return text.replace(/^([A-D][.)]\s*|\([A-D]\)\s*)+/gi, "").trim();
};

function QuizSessionContent() {
  const router = useRouter();
  const params = useSearchParams();

  const noteIds = useMemo(() => (params?.get("noteIds") ?? "").split(",").filter(Boolean), [params]);
  const n = parseInt(params?.get("n") ?? "10", 10);
  const timerDuration = parseInt(params?.get("timer") ?? "30", 10);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [, setGenerating] = useState(false);
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
        let all: QuizQuestion[] = [];
        for (const id of noteIds) {
          try {
            let fetched = await fetchQuestionsForQuiz(id, perLecture);
            if (fetched.length < perLecture) {
              const needed = perLecture - fetched.length;
              if (needed > 0 && needed <= 20) {
                setGenerating(true);
                try {
                  await generateMCQsForQuiz(id, needed);
                  fetched = await fetchQuestionsForQuiz(id, perLecture);
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
  }, [n, noteIds]);

  const submitAndNext = useCallback(async (autoSubmit = false) => {
    const q = questions[idx];
    if (!q || submitting) return;
    setSubmitting(true);

    const timeTaken = timerDuration > 0 ? (timerDuration - (timer ?? 0)) : 0;
    const answerToSend = selected || "TIMEOUT";

    try {
      const res = await submitMCQAnswer(q.id, answerToSend, timeTaken);

      let newScore = score;
      if (res.correct) { newScore = score + 1; setScore(newScore); }

      const record: AnswerRecord = {
        question: q.question_text,
        userAnswer: answerToSend,
        correctAnswer: res.correct_option || q.correct_option || "",
        isCorrect: res.correct,
        explanation: q.explanation ?? undefined,
      };
      const updatedAnswers = [...userAnswers, record];
      setUserAnswers(updatedAnswers);

      if (idx + 1 < questions.length) {
        setIdx(i => i + 1);
        setSelected("");
        setSubmitting(false);
      } else {
        // Quiz complete
        try {
          await completeQuizApi(
            newScore,
            questions.length,
            updatedAnswers.map((a, i) => ({
              question_id: questions[i]?.id ?? 0,
              is_correct: a.isCorrect,
              selected_option: a.userAnswer,
              time_taken: 0,
            }))
          );
        } catch { /* ignore completion reporting error */ }

        const resultPayload = {
          score: newScore,
          total: questions.length,
          noteId: noteIds.length === 1 ? Number(noteIds[0]) : undefined,
          answers: updatedAnswers,
          totalTimeTaken: Math.round((Date.now() - quizStartTime) / 1000),
        };
        sessionStorage.setItem("lf:quiz-result", JSON.stringify(resultPayload));
        router.replace("/quiz/result");
      }
    } catch {
      // Fallback local grading
      const isCorrect = !autoSubmit && selected === (q.correct_option ?? "");
      let newScore = score;
      if (isCorrect) { newScore = score + 1; setScore(newScore); }

      const record: AnswerRecord = {
        question: q.question_text,
        userAnswer: answerToSend,
        correctAnswer: q.correct_option || "",
        isCorrect,
        explanation: q.explanation ?? undefined,
      };
      const updatedAnswers = [...userAnswers, record];
      setUserAnswers(updatedAnswers);

      if (idx + 1 < questions.length) {
        setIdx(i => i + 1);
        setSelected("");
        setSubmitting(false);
      } else {
        const resultPayload = {
          score: newScore,
          total: questions.length,
          noteId: noteIds.length === 1 ? Number(noteIds[0]) : undefined,
          answers: updatedAnswers,
          totalTimeTaken: Math.round((Date.now() - quizStartTime) / 1000),
        };
        sessionStorage.setItem("lf:quiz-result", JSON.stringify(resultPayload));
        router.replace("/quiz/result");
      }
    }
  }, [idx, noteIds, questions, quizStartTime, router, score, selected, submitting, timer, timerDuration, userAnswers]);

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
  }, [timer, questions.length, submitAndNext, timerDuration]);

  const q = questions[idx];
  const progress = questions.length > 0 ? ((idx + 1) / questions.length) * 100 : 0;
  const timerPct = timerDuration > 0 && timer !== null ? (timer / timerDuration) * 100 : 100;
  const isTimerLow = timer !== null && timer <= 5;

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <BrainCircuit size={32} className="animate-pulse" />
      </div>
      <p className="font-bold text-foreground">Preparing your quiz...</p>
      <p className="text-xs text-muted-foreground">Pulling questions from {noteIds.length} lecture note{noteIds.length !== 1 ? "s" : ""}</p>
    </div>
  );

  if (error) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center max-w-md">
        <p className="font-bold text-red-600 mb-4">{error}</p>
        <button onClick={() => router.push("/quiz")} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
          Back to Quiz Setup
        </button>
      </div>
    </div>
  );

  if (!q) return null;

  const rawOptions = [
    { key: "A", text: q.option_a },
    { key: "B", text: q.option_b },
    { key: "C", text: q.option_c },
    { key: "D", text: q.option_d },
  ].filter(o => Boolean(o.text));

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-3xl flex-col justify-between py-6 animate-in fade-in duration-500">
      {/* Top bar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              Question {idx + 1} of {questions.length}
            </span>
            {q.topic && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                {q.topic}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {timerDuration > 0 && timer !== null && (
              <div className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black transition-colors",
                isTimerLow
                  ? "bg-red-500/10 text-red-600 animate-pulse border border-red-500/30"
                  : "bg-muted text-muted-foreground"
              )}>
                <Timer size={13} />
                <span>{timer}s</span>
              </div>
            )}
            <button
              onClick={() => router.push("/quiz")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Question progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Timer progress bar (when timed) */}
        {timerDuration > 0 && (
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-transparent">
            <div
              className={cn("h-full transition-all duration-1000", isTimerLow ? "bg-red-500" : "bg-primary/40")}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Main question card */}
      <div className="my-8 flex flex-col gap-6">
        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <p className="text-lg font-bold leading-relaxed text-foreground md:text-xl">
            {q.question_text}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {rawOptions.map(opt => {
            const isSelected = selected === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelected(opt.key)}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-150 select-none",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10 -translate-y-0.5"
                    : "bg-card hover:border-border/80 hover:bg-muted/30"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-black text-sm transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border bg-background text-muted-foreground"
                )}>
                  {opt.key}
                </div>
                <span className={cn(
                  "flex-1 text-sm font-semibold leading-relaxed",
                  isSelected ? "text-foreground font-bold" : "text-muted-foreground"
                )}>
                  {cleanOption(opt.text)}
                </span>
                {isSelected && <CheckCircle size={18} className="text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom submit */}
      <div className="flex items-center justify-between border-t pt-4">
        <span className="text-xs text-muted-foreground">
          {selected ? `Option ${selected} selected` : "Select an answer above"}
        </span>
        <button
          type="button"
          onClick={() => submitAndNext(false)}
          disabled={!selected || submitting}
          className={cn(
            "flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:shadow-none"
          )}
        >
          {submitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : idx + 1 === questions.length ? (
            <>Finish Quiz <CheckCircle size={16} /></>
          ) : (
            <>Next Question <ChevronRight size={16} /></>
          )}
        </button>
      </div>
    </div>
  );
}

export default function QuizSessionPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <QuizSessionContent />
    </Suspense>
  );
}
