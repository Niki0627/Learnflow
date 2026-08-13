"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BookOpen,
  Sparkles,
  Send,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X,
  CheckCircle,
  Info,
  Filter,
  Loader2,
} from "lucide-react";
import { api } from "@/src/lib/api-client";
import { cn } from "@/src/lib/utils";
import type { Lecture, Question } from "@/src/lib/types";

interface EditForm {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
}

function EditDialog({ question, index, onSave, onClose }: {
  question: Question;
  index: number;
  onSave: (updated: Question, index: number) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<EditForm>({
    question_text: question.question_text ?? "",
    option_a: question.option_a ?? "",
    option_b: question.option_b ?? "",
    option_c: question.option_c ?? "",
    option_d: question.option_d ?? "",
    correct_option: question.correct_option ?? "A",
    explanation: question.explanation ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put<{ question: Question }>(`questions/${question.id}/update/`, form);
      onSave(res.question, index);
      onClose();
    } catch { setError("Failed to save. Please try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary to-primary/80 rounded-t-3xl">
          <div className="flex items-center gap-2 text-white">
            <Edit size={18} />
            <h2 className="font-bold">Edit Question</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 font-semibold">{error}</div>}
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1.5">Question Text (Markdown supported)</label>
            <textarea rows={3} value={form.question_text} onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <div className="border-t border-border/50 pt-4">
            <p className="text-sm font-bold text-muted-foreground mb-3">Answer Options</p>
            {(["a", "b", "c", "d"] as const).map(l => (
              <div key={l} className="mb-3">
                <label className="block text-xs font-bold text-muted-foreground mb-1">Option {l.toUpperCase()}</label>
                <input value={form[`option_${l}`]} onChange={e => setForm(f => ({ ...f, [`option_${l}`]: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1.5">Correct Answer</label>
            <select value={form.correct_option} onChange={e => setForm(f => ({ ...f, correct_option: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              {["A", "B", "C", "D"].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1.5">Explanation (optional)</label>
            <textarea rows={3} value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold hover:bg-muted transition">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GenerateQuestionsPage() {
  const router = useRouter();
  const [noteId, setNoteId] = useState("");
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [maxGenerate, setMaxGenerate] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [filterTopic, setFilterTopic] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [editDialog, setEditDialog] = useState<{ question: Question; index: number } | null>(null);
  const [numForQuiz, setNumForQuiz] = useState(10);
  const [showQuizDialog, setShowQuizDialog] = useState(false);

  useEffect(() => {
    api.get<Lecture[]>("lectures/").then(d => setLectures(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const generate = async () => {
    setError(""); setSuccess(false);
    if (!noteId) { setError("Please select a lecture note."); return; }
    if (!maxGenerate || Number(maxGenerate) <= 0) { setError("Please enter a valid number."); return; }
    setLoading(true);
    try {
      const res = await api.post<{ questions?: Question[]; mcqs?: Question[] }>("generate-mcqs/", { note_id: noteId, count: Number(maxGenerate) });
      setQuestions(res.questions ?? res.mcqs ?? []);
      setSuccess(true); setFilterTopic("All");
    } catch (err: unknown) {
      const e = err as { error?: string; message?: string };
      setError(e?.error ?? e?.message ?? "Failed to generate questions.");
    } finally { setLoading(false); }
  };

  const topics = ["All", ...Array.from(new Set(questions.map(q => q.topic).filter(Boolean) as string[]))];
  const filtered = filterTopic === "All" ? questions : questions.filter(q => q.topic === filterTopic);

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BookOpen size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Generate Questions</h1>
          <p className="text-muted-foreground font-medium">AI-generated MCQs from your lecture notes</p>
        </div>
      </div>

      {/* Input Card */}
      <div className="rounded-[2rem] border border-primary/20 bg-card p-8 shadow-sm">
        <h2 className="text-lg font-bold mb-6">Generate Settings</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">Lecture Note *</label>
            <select value={noteId} onChange={e => setNoteId(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="">Select a lecture...</option>
              {lectures.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">Number of Questions</label>
            <input type="number" placeholder="e.g., 20" value={maxGenerate} onChange={e => setMaxGenerate(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generate()}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}

        <button onClick={generate} disabled={loading || !noteId || !maxGenerate}
          className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Send size={16} /> Generate Questions</>}
        </button>

        {success && (
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-600 flex-1">
              <CheckCircle size={16} /> {questions.length} questions generated!
            </div>
            <button onClick={() => setShowQuizDialog(true)}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition">
              Start Quiz →
            </button>
          </div>
        )}

        {/* Tip */}
        <div className="mt-4 rounded-xl border-l-4 border-primary bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Our AI creates MCQs from your notes with full explanations. Supports markdown formatting!
          </p>
        </div>
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">Generated Questions</h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{filtered.length} / {questions.length}</span>
            </div>
            {topics.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={16} className="text-muted-foreground" />
                {topics.map(t => (
                  <button key={t} onClick={() => setFilterTopic(t)}
                    className={cn("rounded-full px-3 py-1 text-xs font-bold transition", filterTopic === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {filtered.map((q, i) => {
              const globalIdx = questions.indexOf(q);
              const isOpen = expandedIdx === i;
              return (
                <div key={q.id ?? i} className="rounded-[1.5rem] border border-border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <button
                    onClick={() => setExpandedIdx(isOpen ? null : i)}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white font-black text-sm">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm line-clamp-2 text-foreground">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.question_text}</ReactMarkdown>
                      </div>
                      {q.topic && <span className="inline-block mt-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{q.topic}</span>}
                    </div>
                    {isOpen ? <ChevronUp size={18} className="shrink-0 text-muted-foreground" /> : <ChevronDown size={18} className="shrink-0 text-muted-foreground" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-border p-6 bg-muted/20">
                      {/* Options */}
                      <div className="space-y-3 mb-6">
                        {(["A", "B", "C", "D"] as const).map(letter => {
                          const opt = q[`option_${letter.toLowerCase()}` as keyof Question] as string;
                          if (!opt) return null;
                          const isCorrect = (q.correct_option ?? "").toUpperCase() === letter;
                          return (
                            <div key={letter} className={cn("flex items-start gap-3 rounded-xl p-3 border-2 transition", isCorrect ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "border-border bg-background")}>
                              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-sm", isCorrect ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground")}>
                                {letter}
                              </div>
                              <div className="flex-1 pt-0.5 text-sm font-medium">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{opt}</ReactMarkdown>
                              </div>
                              {isCorrect && <span className="shrink-0 rounded-full bg-emerald-500 text-white text-xs font-black px-2 py-1">Correct</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="rounded-xl border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-500/10 p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Info size={16} className="text-blue-500" />
                            <span className="text-sm font-bold text-blue-600">Explanation</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.explanation}</ReactMarkdown>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button onClick={() => setEditDialog({ question: q, index: globalIdx })}
                          className="flex items-center gap-2 rounded-xl border border-primary/30 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 transition">
                          <Edit size={14} /> Edit Question
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editDialog && (
        <EditDialog
          question={editDialog.question}
          index={editDialog.index}
          onSave={(updated, idx) => { const copy = [...questions]; copy[idx] = updated; setQuestions(copy); }}
          onClose={() => setEditDialog(null)}
        />
      )}

      {/* Quiz Dialog */}
      {showQuizDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-card border shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black mb-4">Start Quiz</h2>
            <p className="text-sm text-muted-foreground mb-4">How many questions would you like to attempt?</p>
            <input type="number" min={1} max={50} value={numForQuiz} onChange={e => setNumForQuiz(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowQuizDialog(false)} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold hover:bg-muted transition">Cancel</button>
              <button
                onClick={() => { setShowQuizDialog(false); router.push(`/quiz/session?noteIds=${noteId}&n=${numForQuiz}&timer=30`); }}
                disabled={!numForQuiz || numForQuiz < 1}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50">
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
