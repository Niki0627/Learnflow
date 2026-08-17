"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  GraduationCap,
  Upload,
  Sparkles,
  Bookmark,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
} from "lucide-react";
import { cn } from "@/src/core/utils/cn";
import {
  fetchSyllabi,
  uploadSyllabus,
  fetchSyllabusQuestions,
  generateExamQuestions,
  generateExamStrategy,
  deleteExamQuestion,
} from "../api";
import type { ExamSyllabus, ExamQuestion, Strategy, MarkRow } from "../types";

// ── Question Card ──────────────────────────────────────────────
function QuestionCard({ q, index }: { q: ExamQuestion; index: number }) {
  const [revealed, setRevealed] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const marksColor = q.marks >= 10 ? "text-red-500" : q.marks >= 5 ? "text-amber-500" : "text-emerald-500";
  const marksBg = q.marks >= 10 ? "bg-red-500/10" : q.marks >= 5 ? "bg-amber-500/10" : "bg-emerald-500/10";

  return (
    <div className={cn("rounded-2xl border-2 overflow-hidden transition-all", revealed ? "border-primary/30" : "border-border hover:border-primary/20")}>
      <div className="p-5 bg-muted/20">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-black shrink-0">{index + 1}</div>
            {q.topic && <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{q.topic}</span>}
            <span className={cn("rounded-md px-2 py-0.5 text-xs font-black", marksBg, marksColor)}>{q.marks} Mark{q.marks !== 1 ? "s" : ""}</span>
            {q.is_from_pattern && (
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp size={10} /> High-Yield
              </span>
            )}
          </div>
          <button onClick={() => setBookmarked(!bookmarked)} className={cn("p-1.5 rounded-lg transition", bookmarked ? "text-amber-500" : "text-muted-foreground hover:text-amber-500")}>
            <Bookmark size={16} className={bookmarked ? "fill-current" : ""} />
          </button>
        </div>
        <div className="text-sm font-semibold text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.question_text}</ReactMarkdown>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">Priority #{q.priority}</span>
          <button onClick={() => setRevealed(!revealed)}
            className={cn("flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition", revealed ? "bg-primary text-primary-foreground" : "border border-primary/30 text-primary hover:bg-primary/5")}>
            {revealed ? <><ChevronUp size={14} /> Hide Answer</> : <><ChevronDown size={14} /> Reveal Answer</>}
          </button>
        </div>
      </div>
      {revealed && (
        <div className="border-t border-border p-5 bg-primary/3">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-primary">Model Answer ({q.marks} marks)</span>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.answer}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function ExamPrepPage() {
  const [syllabi, setSyllabi] = useState<ExamSyllabus[]>([]);
  const [activeSyllabusId, setActiveSyllabusId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [tab, setTab] = useState<"questions" | "strategy">("questions");

  // Upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);
  const [generatingStrategy, setGeneratingStrategy] = useState(false);

  // Mark distribution
  const [markRows, setMarkRows] = useState<MarkRow[]>([{ marks: 2, count: 5 }, { marks: 5, count: 5 }, { marks: 10, count: 2 }]);
  const [secureCentumMode, setSecureCentumMode] = useState(true);

  // Papers
  const [uploadedPapers] = useState<File[]>([]);

  useEffect(() => {
    fetchSyllabi().then(d => { setSyllabi(Array.isArray(d) ? d : []); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeSyllabusId) return;
    setFetchingQuestions(true);
    fetchSyllabusQuestions(activeSyllabusId)
      .then(d => setQuestions(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setFetchingQuestions(false));
  }, [activeSyllabusId]);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploadingFile(true); setUploadError("");
    try {
      const res = await uploadSyllabus(file);
      setSyllabi(prev => [...prev, res]);
      setActiveSyllabusId(res.id);
    } catch (err: unknown) {
      const e = err as { error?: string };
      setUploadError(e?.error ?? "Upload failed. Please try again.");
    } finally { setUploadingFile(false); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] }, maxFiles: 1,
  });

  const handleGenerateQuestions = async () => {
    if (!activeSyllabusId) return;
    setGenerating(true);
    try {
      const d = await generateExamQuestions(
        activeSyllabusId,
        markRows,
        secureCentumMode,
        uploadedPapers.length > 0,
      );
      setQuestions(Array.isArray(d) ? d : []);
    } catch { /* show error */ } finally { setGenerating(false); }
  };

  const handleGenerateStrategy = async () => {
    if (!activeSyllabusId) return;
    setGeneratingStrategy(true); setTab("strategy");
    try {
      const res = await generateExamStrategy(activeSyllabusId);
      setStrategy(res);
    } catch { } finally { setGeneratingStrategy(false); }
  };

  void deleteExamQuestion; // Available for deleting questions

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <GraduationCap size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Exam Preparation</h1>
          <p className="text-muted-foreground font-medium">Generate exam questions and study strategies from your syllabus</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* ── Left Panel ── */}
        <div className="space-y-6">
          {/* Upload Syllabus */}
          <div className="rounded-[2rem] border border-primary/20 bg-card p-6 shadow-sm">
            <h2 className="font-bold mb-4 flex items-center gap-2"><Upload size={18} className="text-primary" /> Upload Syllabus</h2>
            <div
              {...getRootProps()}
              className={cn(
                "rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all",
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <input {...getInputProps()} />
              <FileText size={32} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm font-semibold text-muted-foreground">
                {isDragActive ? "Drop your file here" : "Drop PDF/TXT or click to browse"}
              </p>
              {uploadingFile && <div className="mt-3 flex items-center justify-center gap-2 text-primary text-sm font-bold"><Loader2 size={16} className="animate-spin" /> Uploading...</div>}
              {uploadError && <p className="mt-2 text-xs text-red-500 font-semibold">{uploadError}</p>}
            </div>
          </div>

          {/* Syllabi list */}
          {syllabi.length > 0 && (
            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <h2 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Your Syllabi</h2>
              <div className="space-y-2">
                {syllabi.map(s => (
                  <button key={s.id} onClick={() => setActiveSyllabusId(s.id)}
                    className={cn("w-full flex items-center gap-3 rounded-xl p-3 text-left transition",
                      activeSyllabusId === s.id ? "bg-primary/10 border border-primary/30" : "border border-transparent hover:bg-muted")}>
                    <FileText size={16} className={activeSyllabusId === s.id ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-sm font-semibold truncate">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Config (only when syllabus selected) */}
          {activeSyllabusId && (
            <>
              {/* Mark Distribution */}
              <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                <h2 className="font-bold mb-4 flex items-center gap-2"><Sparkles size={18} className="text-primary" /> Mark Distribution</h2>
                <div className="space-y-3">
                  {markRows.map((row, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1">
                        <span className="text-xs text-muted-foreground">Marks</span>
                        <input disabled value={row.marks} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm font-bold text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-muted-foreground">Count</span>
                        <input type="number" min={1} value={row.count}
                          onChange={e => { const r = [...markRows]; r[i].count = parseInt(e.target.value) || 1; setMarkRows(r); }}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold outline-none focus:border-primary" />
                      </div>
                      <button onClick={() => setMarkRows(markRows.filter((_, j) => j !== i))} className="mt-4 p-2 text-muted-foreground hover:text-red-500 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setMarkRows([...markRows, { marks: markRows.length * 2 + 1, count: 3 }])}
                  className="mt-3 flex items-center gap-2 rounded-xl border border-primary/30 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 transition">
                  <Plus size={14} /> Add Row
                </button>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 p-3">
                  <div>
                    <div className="text-sm font-bold">Secure Centum Mode</div>
                    <div className="text-xs text-muted-foreground">Pattern-based high-yield focus</div>
                  </div>
                  <button onClick={() => setSecureCentumMode(!secureCentumMode)}
                    className={cn("relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors", secureCentumMode ? "bg-primary" : "bg-muted")}>
                    <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition", secureCentumMode ? "translate-x-5" : "translate-x-0")} />
                  </button>
                </div>

                <button onClick={handleGenerateQuestions} disabled={generating}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50">
                  {generating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Questions</>}
                </button>
              </div>

              {/* Strategy */}
              <button onClick={handleGenerateStrategy} disabled={generatingStrategy}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-primary/30 py-3 text-sm font-bold text-primary hover:bg-primary/5 transition disabled:opacity-50">
                {generatingStrategy ? <><Loader2 size={16} className="animate-spin" /> Generating Strategy...</> : <><TrendingUp size={16} /> Generate Study Strategy</>}
              </button>
            </>
          )}
        </div>

        {/* ── Right Panel ── */}
        <div>
          {!activeSyllabusId ? (
            <div className="rounded-[2rem] border border-dashed border-primary/30 bg-card/50 p-16 flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/5">
                <GraduationCap size={36} className="text-primary/40" />
              </div>
              <h3 className="text-xl font-black text-foreground/60">Upload a Syllabus to Get Started</h3>
              <p className="text-muted-foreground text-sm max-w-sm">Upload your exam syllabus (PDF or TXT), then generate targeted exam questions and study strategies.</p>
            </div>
          ) : (
            <div>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {(["questions", "strategy"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={cn("rounded-xl px-5 py-2.5 text-sm font-bold transition", tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                    {t === "questions" ? `Questions (${questions.length})` : "Study Strategy"}
                  </button>
                ))}
              </div>

              {tab === "questions" && (
                <div>
                  {fetchingQuestions ? (
                    <div className="flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-primary" /></div>
                  ) : questions.length > 0 ? (
                    <div className="space-y-4">
                      {questions.map((q, i) => <QuestionCard key={q.id} q={q} index={i} />)}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <AlertTriangle size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-semibold">No questions yet</p>
                      <p className="text-sm mt-1">Configure the settings and click &quot;Generate Questions&quot;</p>
                    </div>
                  )}
                </div>
              )}

              {tab === "strategy" && (
                <div>
                  {generatingStrategy ? (
                    <div className="flex flex-col items-center gap-4 py-12">
                      <Loader2 size={40} className="animate-spin text-primary" />
                      <p className="font-bold text-muted-foreground">Crafting your study strategy...</p>
                    </div>
                  ) : strategy ? (
                    <div className="space-y-6">
                      {strategy.overview && (
                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                          <h3 className="text-sm font-black uppercase tracking-wider text-primary mb-3">Strategy Overview</h3>
                          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{strategy.overview}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {strategy.focus_areas && strategy.focus_areas.length > 0 && (
                        <div className="rounded-2xl border border-border bg-card p-6">
                          <h3 className="font-bold mb-3">Focus Areas</h3>
                          <ul className="space-y-2">
                            {strategy.focus_areas.map((a, i) => (
                              <li key={i} className="flex gap-3 text-sm text-muted-foreground"><CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {strategy.tips && strategy.tips.length > 0 && (
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                          <h3 className="font-bold text-amber-600 mb-3">Study Tips</h3>
                          <ul className="space-y-2">
                            {strategy.tips.map((t, i) => <li key={i} className="flex gap-3 text-sm text-muted-foreground"><AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />{t}</li>)}
                          </ul>
                        </div>
                      )}
                      {strategy.raw && !strategy.overview && (
                        <div className="rounded-2xl border border-border bg-card p-6">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{strategy.raw}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-semibold">No strategy generated yet</p>
                      <p className="text-sm mt-1">Click &quot;Generate Study Strategy&quot; to create one</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
