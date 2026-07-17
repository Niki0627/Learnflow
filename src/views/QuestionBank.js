import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Check, X, Flame, BookOpen, Download, Loader2, Library } from 'lucide-react';
import API from '../api/api';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BLOOMS_LEVELS = ['All', 'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [bloomsFilter, setBloomsFilter] = useState('All');
  const [highYieldOnly, setHighYieldOnly] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [attempts, setAttempts] = useState({});

  useEffect(() => {
    API.get('questions/all/')
      .then(res => setQuestions(res.data.questions || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(() => {
    const subs = new Set(questions.map(q => q.subject || 'General'));
    return ['All', ...Array.from(subs)];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchSubject = subjectFilter === 'All' || (q.subject || 'General') === subjectFilter;
      const matchBlooms = bloomsFilter === 'All' || q.blooms_level === bloomsFilter;
      const matchHighYield = !highYieldOnly || q.is_high_yield;
      const matchSearch = (q.question_text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.topic || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchBlooms && matchHighYield && matchSearch;
    });
  }, [questions, searchQuery, subjectFilter, bloomsFilter, highYieldOnly]);

  const groupedQuestions = useMemo(() => {
    return filteredQuestions.reduce((acc, q) => {
      const sub = q.subject || 'General';
      if (!acc[sub]) acc[sub] = [];
      acc[sub].push(q);
      return acc;
    }, {});
  }, [filteredQuestions]);

  const handleAttempt = (qId, opt, correct) => {
    setAttempts(prev => ({ ...prev, [qId]: { selected: opt, isCorrect: opt === (correct || 'A').toUpperCase() } }));
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredQuestions, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr); a.setAttribute("download", "question_bank_export.json"); a.click();
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
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b pb-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
            <Library size={14} /> Question Bank
          </div>
          <h1 className="text-4xl font-black tracking-tight">Question Bank</h1>
          <p className="mt-3 text-lg font-medium text-muted-foreground">
            Browse, search, and quick-attempt all generated questions from your library.
          </p>
        </div>
        <button onClick={handleExport} className="flex shrink-0 items-center gap-2 rounded-xl border bg-card px-5 py-3 text-sm font-bold hover:bg-muted transition-colors shadow-sm">
          <Download size={16} /> Export JSON
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
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

          {/* Subject */}
          <div className="relative min-w-[160px]">
            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border bg-background px-4 pr-9 text-sm font-bold outline-none transition focus:border-primary">
              {subjects.map(s => <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Blooms */}
          <div className="relative min-w-[160px]">
            <select value={bloomsFilter} onChange={e => setBloomsFilter(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border bg-background px-4 pr-9 text-sm font-bold outline-none transition focus:border-primary capitalize">
              {BLOOMS_LEVELS.map(l => <option key={l} value={l} className="capitalize">{l === 'All' ? "All Levels" : l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* High yield toggle */}
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

      {/* Questions grouped by subject */}
      {Object.keys(groupedQuestions).length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-24 text-muted-foreground">
          <Library size={64} className="mb-4 opacity-20" />
          <h3 className="text-xl font-bold">No questions found</h3>
          <p className="text-sm mt-2">Try adjusting your filters or generate new questions from your lectures.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {Object.entries(groupedQuestions).map(([subject, qs]) => (
            <div key={subject}>
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen size={18} />
                </div>
                <h2 className="text-2xl font-black">{subject}</h2>
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-sm font-black text-primary">{qs.length}</span>
              </div>

              <div className="flex flex-col gap-4">
                {qs.map((q, idx) => {
                  const isOpen = expandedId === q.id;
                  const attempt = attempts[q.id];
                  return (
                    <div key={q.id} className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                      {/* Question header */}
                      <button
                        onClick={() => setExpandedId(isOpen ? null : q.id)}
                        className="w-full text-left p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-black">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-semibold leading-snug mb-3">{q.question_text}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            {q.is_high_yield && (
                              <span className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-black text-amber-600 border border-amber-500/20">
                                <Flame size={11} /> HIGH YIELD
                              </span>
                            )}
                            {q.blooms_level && (
                              <span className="rounded-md bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-black text-violet-600 capitalize">{q.blooms_level}</span>
                            )}
                            {q.question_type && (
                              <span className="rounded-md bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground uppercase">{q.question_type.replace('_', ' ')}</span>
                            )}
                            {q.topic && <span className="rounded-md border px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">{q.topic}</span>}
                            {attempt && (
                              <span className={cn("ml-auto flex items-center gap-1 text-[11px] font-black", attempt.isCorrect ? "text-emerald-600" : "text-red-500")}>
                                {attempt.isCorrect ? <Check size={13} /> : <X size={13} />}
                                {attempt.isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            )}
                          </div>
                        </div>
                        {isOpen ? <ChevronUp size={18} className="shrink-0 text-muted-foreground mt-0.5" /> : <ChevronDown size={18} className="shrink-0 text-muted-foreground mt-0.5" />}
                      </button>

                      {/* Expanded options */}
                      {isOpen && (
                        <div className="border-t bg-muted/20 p-6">
                          <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Quick Attempt</p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {['A', 'B', 'C', 'D'].map(opt => {
                              const optText = q[`option_${opt.toLowerCase()}`];
                              if (!optText) return null;
                              const isCorrect = (q.correct_option || 'A').toUpperCase() === opt;
                              const isSelected = attempt?.selected === opt;
                              return (
                                <div
                                  key={opt}
                                  onClick={() => !attempt && handleAttempt(q.id, opt, q.correct_option)}
                                  className={cn(
                                    "flex gap-3 items-start rounded-xl border-2 p-4 transition-all text-sm font-medium leading-snug",
                                    attempt
                                      ? isCorrect ? "border-emerald-500 bg-emerald-500/10 text-emerald-800"
                                        : isSelected ? "border-red-500 bg-red-500/10 text-red-700 opacity-80"
                                          : "border-border opacity-50 cursor-default"
                                      : "border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                                  )}
                                >
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-black">
                                    {attempt && isCorrect ? <Check size={13} className="text-emerald-600" /> :
                                      attempt && isSelected ? <X size={13} className="text-red-500" /> : opt}
                                  </div>
                                  <span>{optText}</span>
                                </div>
                              );
                            })}
                          </div>
                          {attempt && q.explanation && (
                            <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
                              <p className="text-xs font-black uppercase tracking-wider text-blue-600 mb-2">Explanation</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
