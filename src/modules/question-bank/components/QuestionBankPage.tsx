"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Library,
  Search,
  ChevronDown,
  ChevronUp,
  Flame,
  Download,
  Loader2,
  CheckCircle,
  FileQuestion,
} from "lucide-react";
import { cn } from "@/src/core/utils/cn";
import { fetchAllQuestions } from "../api";
import type { BankQuestion } from "../types";

const BLOOMS_LEVELS = ["All", "remember", "understand", "apply", "analyze", "evaluate", "create"];

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [bloomsFilter, setBloomsFilter] = useState("All");
  const [highYieldOnly, setHighYieldOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchAllQuestions()
      .then(d => setQuestions(Array.isArray(d) ? d : []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, []);

  const subjects = ["All", ...Array.from(new Set(questions.map(q => q.subject).filter(Boolean) as string[]))];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch =
      (q.question_text ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.topic ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "All" || q.subject === subjectFilter;
    const matchesBlooms = bloomsFilter === "All" || q.blooms_level?.toLowerCase() === bloomsFilter;
    const matchesHighYield = !highYieldOnly || q.is_high_yield;
    return matchesSearch && matchesSubject && matchesBlooms && matchesHighYield;
  });

  const toggleReveal = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedAnswers(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredQuestions, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "question_bank_export.json");
    a.click();
  };

  if (loading) return (
    <div className="flex h-80 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-bold text-muted-foreground">Loading Question Bank...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b pb-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
            <Library size={14} /> Question Bank
          </div>
          <h1 className="text-4xl font-black tracking-tight">Question Bank</h1>
          <p className="mt-3 text-lg font-medium text-muted-foreground">
            Browse, search, and practice questions from your lecture library.
          </p>
        </div>
        <button onClick={handleExport} className="flex shrink-0 items-center gap-2 rounded-xl border bg-card px-5 py-3 text-sm font-bold hover:bg-muted transition-colors shadow-sm">
          <Download size={16} /> Export JSON
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search questions, topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border bg-background pl-11 pr-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="relative min-w-[160px]">
            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border bg-background px-4 pr-9 text-sm font-bold outline-none transition focus:border-primary">
              {subjects.map(s => <option key={s} value={s}>{s === "All" ? "All Subjects" : s}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="relative min-w-[160px]">
            <select value={bloomsFilter} onChange={e => setBloomsFilter(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border bg-background px-4 pr-9 text-sm font-bold outline-none transition focus:border-primary capitalize">
              {BLOOMS_LEVELS.map(l => <option key={l} value={l} className="capitalize">{l === "All" ? "All Levels" : l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>

          <button
            onClick={() => setHighYieldOnly(!highYieldOnly)}
            className={cn("flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all",
              highYieldOnly ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-border hover:border-amber-500/50 text-muted-foreground"
            )}
          >
            <Flame size={16} className={highYieldOnly ? "text-amber-500" : "text-muted-foreground"} />
            High Yield Only
          </button>

          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-black text-primary">
              {filteredQuestions.length} questions
            </span>
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            const isRevealed = revealedAnswers.has(q.id);
            return (
              <div key={q.id ?? idx} className="rounded-[1.5rem] border border-border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="flex items-start gap-4 p-6 cursor-pointer hover:bg-muted/20 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-black text-primary text-sm mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {q.subject && <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{q.subject}</span>}
                      {q.topic && <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">{q.topic}</span>}
                      {q.is_high_yield && (
                        <span className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600">
                          <Flame size={12} /> High Yield
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-foreground leading-relaxed text-sm md:text-base">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.question_text}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={e => toggleReveal(q.id, e)}
                      className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold hover:bg-muted transition"
                    >
                      {isRevealed ? "Hide Answer" : "Reveal Answer"}
                    </button>
                    {isExpanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-6 bg-muted/10 space-y-4">
                    <div className="space-y-2">
                      {(["A", "B", "C", "D"] as const).map(letter => {
                        const optKey = `option_${letter.toLowerCase()}` as keyof BankQuestion;
                        const text = q[optKey] as string;
                        if (!text) return null;
                        const isCorrect = (q.correct_option ?? "").toUpperCase() === letter;
                        const showCorrect = isRevealed && isCorrect;
                        return (
                          <div
                            key={letter}
                            className={cn(
                              "flex items-start gap-3 rounded-xl p-3 border transition",
                              showCorrect ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 font-bold" : "border-border bg-background"
                            )}
                          >
                            <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold text-xs", showCorrect ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground")}>
                              {letter}
                            </div>
                            <div className="flex-1 text-sm pt-0.5">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                            </div>
                            {showCorrect && <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-1" />}
                          </div>
                        );
                      })}
                    </div>

                    {isRevealed && q.explanation && (
                      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs text-muted-foreground">
                        <span className="block font-bold text-blue-600 mb-1 uppercase tracking-wider">Explanation</span>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.explanation}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed p-12 text-center text-muted-foreground">
            <FileQuestion size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-lg">No questions match your filter criteria.</p>
            <p className="text-sm mt-1">Try broadening your search query or subject filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
