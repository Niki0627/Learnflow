"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Document, Page, pdfjs } from "react-pdf";
import {
  FileText, PlayCircle, Loader2, Search, Plus, UploadCloud, X, Check, Trash2,
  Maximize, ExternalLink, CalendarDays, BookOpen, Layers, ChevronLeft, ChevronRight, ZoomIn, ZoomOut
} from "lucide-react";
import NotesSidebar from "@/src/components/shared/NotesSidebar";
import { subjectToColor } from "@/src/utils/subjectColors";
import { api } from "@/src/lib/api-client";
import { cn } from "@/src/lib/utils";
import type { Lecture, Question } from "@/src/lib/types";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ── Helpers ────────────────────────────────────────────────────

const getFileType = (filename?: string | null) => {
  if (!filename) return "unknown";
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext ?? "")) return "image";
  if (["mp4", "webm", "ogg", "mov"].includes(ext ?? "")) return "video";
  if (["mp3", "wav", "aac"].includes(ext ?? "")) return "audio";
  return "unknown";
};

const getFileUrl = (file?: string | null): string | null => {
  if (!file) return null;
  if (/^(https?:|blob:|data:)/.test(file)) return file;
  const base = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "").replace(/\/$/, "");
  if (base) return `${base}/${file.replace(/^\//, "")}`;
  return null;
};

const hasPreviewableFileUrl = (url: string | null) => Boolean(url && /^(https?:|blob:|data:)/.test(url));
const isLegacyFilename = (f?: string | null) => Boolean(f && !f.startsWith("http") && !f.startsWith("/") && !f.startsWith("blob:") && !f.startsWith("data:"));

// ── No Preview Fallback ────────────────────────────────────────

function NoPreviewFallback({ lecture, isLegacy, onReuploadSuccess }: {
  lecture: Lecture; isLegacy: boolean; onReuploadSuccess: (url: string) => void;
}) {
  const [reuploading, setReuploading] = useState(false);
  const [reuploadError, setReuploadError] = useState("");
  const [reuploadSuccess, setReuploadSuccess] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleReupload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setReuploading(true); setReuploadError("");
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await api.post<{ file_path: string }>(`lectures/${lecture.id}/reupload/`, undefined, { formData: fd });
      setReuploadSuccess(true);
      onReuploadSuccess(res.file_path);
    } catch (err: unknown) {
      const e = err as { error?: string };
      setReuploadError(e?.error ?? "Re-upload failed.");
    } finally { setReuploading(false); }
  };

  return (
    <div className="flex h-full flex-col p-8 overflow-y-auto bg-card">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex items-start gap-4 pb-6 border-b">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black">{lecture.file ? "Document Content" : "Text Lesson"}</h3>
            <p className="text-sm text-muted-foreground">{lecture.file ? "Displaying extracted text content." : "This lecture was added as plain text."}</p>
          </div>
        </div>

        {isLegacy && (
          <div className="mb-6 rounded-2xl border border-amber-200/60 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10 p-5">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">⚠️ PDF preview not available</p>
            <p className="text-xs mt-1 text-amber-700/80 dark:text-amber-400/80">This lecture was uploaded before PDF storage was configured. Re-upload to enable live preview.</p>
            {reuploadSuccess ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-600">
                <Check size={16} /> PDF uploaded! Refreshing preview…
              </div>
            ) : (
              <>
                <input ref={ref} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleReupload} />
                <button onClick={() => ref.current?.click()} disabled={reuploading}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
                  {reuploading ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : <><UploadCloud size={16} /> Re-upload PDF</>}
                </button>
                {reuploadError && <p className="mt-2 text-xs font-semibold text-red-600">{reuploadError}</p>}
              </>
            )}
          </div>
        )}

        {lecture.content ? (
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lecture.content}</ReactMarkdown>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border/50 bg-background/50 p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold text-muted-foreground">No text content available for this lecture.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── File Viewer ────────────────────────────────────────────────

function FileViewer({ lecture }: { lecture: Lecture | null }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [selectedText, setSelectedText] = useState("");
  const [previewError, setPreviewError] = useState("");
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (getFileType(lecture?.file) !== "pdf") return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setPageNumber(p => Math.max(1, p - 1));
      else if (e.key === "ArrowRight") setPageNumber(p => Math.min(numPages || p, p + 1));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lecture?.file, numPages]);

  useEffect(() => {
    setNumPages(0); setPageNumber(1); setScale(1.0); setSelectedText(""); setPreviewError("");
  }, [lecture?.id]);

  if (!lecture) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
        <FileText size={80} className="opacity-20" />
        <h3 className="text-xl font-bold">Select a lecture to preview</h3>
        <p className="text-sm">Click any lecture card to view its content here</p>
      </div>
    );
  }

  const fileType = getFileType(lecture.file);
  const fileUrl = getFileUrl(lecture.file);
  const canPreview = hasPreviewableFileUrl(fileUrl);

  if (!lecture.file || !canPreview) {
    const isLegacy = isLegacyFilename(lecture.file);
    return (
      <NoPreviewFallback lecture={lecture} isLegacy={isLegacy} onReuploadSuccess={() => window.location.reload()} />
    );
  }

  const showSelectionBtn = fileType === "pdf" && Boolean(selectedText) && !previewError;

  const dispatchSelection = () => {
    const text = selectedText || "";
    if (!text.trim()) return;
    window.dispatchEvent(new CustomEvent("lf:pdf-selection", { detail: { text, lectureId: lecture.id, pageNumber } }));
    setSelectedText("");
    window.getSelection?.()?.removeAllRanges();
  };

  return (
    <div ref={viewerRef} className="relative flex h-full flex-col bg-background/50" onMouseUp={() => {
      const sel = window.getSelection?.()?.toString() ?? "";
      setSelectedText(sel);
    }}>
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText size={20} /></div>
          <div>
            <h4 className="truncate font-bold">{lecture.title}</h4>
            <p className="text-xs text-muted-foreground">{fileType === "pdf" ? `Page ${pageNumber}${numPages ? ` / ${numPages}` : ""}` : "Preview"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {fileType === "pdf" && (
            <>
              <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-background/50 px-1 py-1 shadow-sm">
                <button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => Math.max(1, p - 1))} className="p-1 hover:bg-muted disabled:opacity-30 rounded-md transition-colors text-muted-foreground hover:text-foreground"><ChevronLeft size={16} /></button>
                <span className="text-xs font-bold w-16 text-center tabular-nums">{pageNumber} <span className="text-muted-foreground font-medium">/ {numPages || "?"}</span></span>
                <button disabled={Boolean(numPages && pageNumber >= numPages)} onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))} className="p-1 hover:bg-muted disabled:opacity-30 rounded-md transition-colors text-muted-foreground hover:text-foreground"><ChevronRight size={16} /></button>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-background/50 px-1 py-1 shadow-sm">
                <button disabled={scale <= 0.5} onClick={() => setScale(s => Math.max(0.5, +(s - 0.2).toFixed(1)))} className="p-1 hover:bg-muted disabled:opacity-30 rounded-md transition-colors text-muted-foreground hover:text-foreground"><ZoomOut size={16} /></button>
                <span className="text-xs font-bold w-12 text-center tabular-nums">{Math.round(scale * 100)}%</span>
                <button disabled={scale >= 3.0} onClick={() => setScale(s => Math.min(3.0, +(s + 0.2).toFixed(1)))} className="p-1 hover:bg-muted disabled:opacity-30 rounded-md transition-colors text-muted-foreground hover:text-foreground"><ZoomIn size={16} /></button>
              </div>
            </>
          )}
          <a href={fileUrl!} target="_blank" rel="noreferrer" className="flex items-center justify-center p-2 rounded-lg hover:bg-muted border border-border/50 bg-background/50 shadow-sm transition-colors text-muted-foreground hover:text-foreground" title="Open in new tab"><ExternalLink size={16} /></a>
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex flex-1 flex-col items-center overflow-y-auto p-6 relative", fileType === "pdf" ? "bg-[#0f0f13]" : "bg-muted/30")}>
        {previewError ? (
          <div className="rounded-xl bg-blue-500/10 p-4 text-blue-500 border border-blue-500/20 max-w-lg text-sm">{previewError}</div>
        ) : fileType === "pdf" ? (
          <Document
            file={fileUrl!}
            loading={<div className="flex flex-col items-center gap-4 py-20"><Loader2 className="animate-spin text-primary w-10 h-10" /><span className="text-sm font-medium text-muted-foreground">Loading PDF...</span></div>}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            onLoadError={() => setPreviewError("PDF preview not available, but the lecture text was saved.")}
            error={<div className="text-white text-sm bg-red-500/20 p-4 rounded-xl border border-red-500/30">PDF preview not available.</div>}
            className="flex flex-col items-center"
          >
            <div className="relative group">
              <Page
                pageNumber={Math.min(pageNumber, numPages || pageNumber)}
                scale={scale}
                renderTextLayer
                renderAnnotationLayer={false}
                className="shadow-2xl shadow-black/40 rounded-sm overflow-hidden border border-white/10"
              />
            </div>
          </Document>
        ) : fileType === "image" ? (
          <img src={fileUrl!} alt={lecture.title} className="max-w-full rounded-xl object-contain shadow-lg" />
        ) : fileType === "video" ? (
          <video controls className="w-full max-w-4xl rounded-xl shadow-lg"><source src={fileUrl!} /></video>
        ) : fileType === "audio" ? (
          <audio controls className="w-full max-w-md mt-10"><source src={fileUrl!} /></audio>
        ) : (
          <div className="rounded-xl bg-blue-500/10 p-4 text-blue-500 border border-blue-500/20">Preview not available</div>
        )}
      </div>

      {showSelectionBtn && (
        <div className="absolute bottom-6 right-6 z-20">
          <button onClick={dispatchSelection} className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95">
            Add selection to notes
          </button>
        </div>
      )}
    </div>
  );
}

// ── Study Aids Panel ───────────────────────────────────────────

function StudyAidsPanel({ lecture }: { lecture: Lecture }) {
  const [tab, setTab] = useState("notes");
  const formulas = (lecture?.formulas ?? []) as Array<{ name?: string; formula?: string; description?: string }>;
  const keyPoints = (lecture?.key_points ?? []) as string[];
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="shrink-0 border-b px-6 py-4">
        <h3 className="text-lg font-bold">AI Study Aids</h3>
        <p className="text-sm text-muted-foreground">Study notes, formulas, and key points</p>
      </div>
      <div className="flex shrink-0 gap-2 border-b px-4 py-2 overflow-x-auto">
        {[["notes", "Notes"], ["formulas", `Formulas (${formulas.length})`], ["points", `Key Points (${keyPoints.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cn("px-4 py-2 text-sm font-bold rounded-full transition-colors whitespace-nowrap", tab === k ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground")}>{l}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {tab === "notes" && (
          lecture.study_notes ? (
            <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{lecture.study_notes}</ReactMarkdown></div>
          ) : <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No study notes generated yet.</div>
        )}
        {tab === "formulas" && (
          <div className="space-y-4">
            {formulas.length > 0 ? formulas.map((f, i) => (
              <div key={i} className="rounded-xl border bg-muted/30 p-4">
                <h4 className="font-bold text-sm mb-2">{f.name ?? `Formula ${i + 1}`}</h4>
                <code className="block rounded-lg bg-background p-3 font-mono text-sm border shadow-sm">{f.formula ?? "—"}</code>
                {f.description && <p className="mt-3 text-sm text-muted-foreground">{f.description}</p>}
              </div>
            )) : <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No formulas extracted yet.</div>}
          </div>
        )}
        {tab === "points" && (
          <div className="space-y-3">
            {keyPoints.length > 0 ? keyPoints.map((p, i) => (
              <div key={i} className="rounded-xl border bg-muted/30 p-4 text-sm font-medium leading-relaxed">{p}</div>
            )) : <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No key points extracted yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Lecture Details Modal ──────────────────────────────────────

interface LectureDetails { questions?: Question[]; summary?: string; study_notes?: string; formulas?: unknown[]; key_points?: unknown[]; }

function LectureDetailsModal({ open, onClose, lecture, details, loading, onGenerateQuestions, generating }: {
  open: boolean; onClose: () => void; lecture: Lecture | null; details: LectureDetails | null;
  loading: boolean; onGenerateQuestions: (id: number) => void; generating: boolean;
}) {
  const [tab, setTab] = useState("questions");
  if (!open || !lecture) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div><h2 className="text-xl font-bold">{lecture.title}</h2><p className="text-sm text-muted-foreground">Generated Content & Analysis</p></div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted text-muted-foreground"><X size={20} /></button>
        </div>
        <div className="flex shrink-0 gap-2 border-b px-4 py-2 bg-muted/10">
          {[["questions", "Questions", <FileText key="f" size={16} />], ["summary", "Summary", <BookOpen key="b" size={16} />], ["study-aids", "Study Aids", <Layers key="l" size={16} />]].map(([k, l, icon]) => (
            <button key={k as string} onClick={() => setTab(k as string)}
              className={cn("px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2", tab === k ? "bg-card shadow text-foreground border" : "hover:bg-muted text-muted-foreground border border-transparent")}>
              {icon as React.ReactNode} {l as string}
            </button>
          ))}
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {loading ? (
            <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="flex h-full flex-col overflow-hidden">
              {tab === "questions" && (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="text-primary" size={24} />
                      <h3 className="text-lg font-bold">Generated Questions</h3>
                      {(details?.questions?.length ?? 0) > 0 && <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{details!.questions!.length} questions</span>}
                    </div>
                    <button onClick={() => onGenerateQuestions(lecture.id)} disabled={generating} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-bold hover:bg-muted disabled:opacity-50">
                      {generating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                      {generating ? "Generating..." : "Regenerate"}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {details?.questions?.map((q, idx) => (
                      <div key={q.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div className="flex-1 font-semibold text-sm">
                            <span className="text-muted-foreground mr-1">{idx + 1}.</span>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.question_text}</ReactMarkdown>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-1 justify-end">
                            {q.is_high_yield && <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-600">HIGH YIELD</span>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {(["A", "B", "C", "D"] as const).map(opt => {
                            const key = `option_${opt.toLowerCase()}` as keyof Question;
                            const text = q[key] as string;
                            if (!text) return null;
                            const isCorrect = (q.correct_option ?? "").toUpperCase() === opt;
                            return (
                              <div key={opt} className={cn("flex gap-3 rounded-xl border p-3 text-sm", isCorrect ? "border-emerald-500 bg-emerald-500/10" : "bg-muted/30")}>
                                {isCorrect && <Check className="mt-0.5 shrink-0 text-emerald-500" size={16} />}
                                <span className="font-bold">{opt}.</span>
                                <div className="prose prose-sm dark:prose-invert"><ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {!details?.questions?.length && (
                      <div className="rounded-2xl border border-dashed p-8 text-center">
                        <p className="mb-4 text-muted-foreground">No questions generated yet.</p>
                        <button onClick={() => onGenerateQuestions(lecture.id)} disabled={generating} className="rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground">Generate Now</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {tab === "summary" && (
                <div className="flex-1 overflow-y-auto p-8 text-base leading-loose text-muted-foreground">
                  {details?.summary ? <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{details.summary}</ReactMarkdown></div> : <div className="rounded-xl border border-dashed p-8 text-center">No summary available.</div>}
                </div>
              )}
              {tab === "study-aids" && (
                <div className="flex-1 overflow-hidden">
                  {details ? <StudyAidsPanel lecture={{ ...lecture, ...details } as Lecture} /> : null}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center justify-end gap-3 border-t bg-muted/10 p-4">
          <button onClick={onClose} className="rounded-full px-6 py-2 font-bold hover:bg-muted">Close</button>
          <a href={`/quiz?noteIds=${lecture.id}&n=10`} className={cn("flex items-center gap-2 rounded-full bg-primary px-6 py-2 font-bold text-primary-foreground hover:bg-primary/90", !details?.questions?.length ? "opacity-50 pointer-events-none" : "")}>
            <PlayCircle size={18} /> Start Quiz
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Lecture Card ───────────────────────────────────────────────

function LectureCard({ lecture, isSelected, onSelect, onDelete, onViewDetails }: {
  lecture: Lecture; isSelected: boolean; onSelect: (l: Lecture) => void;
  onDelete: (l: Lecture) => void; onViewDetails: (l: Lecture) => void;
}) {
  const color = subjectToColor(lecture.subject);
  return (
    <div
      onClick={() => onSelect(lecture)}
      className={cn("group cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300", isSelected ? "bg-primary/5 shadow-md" : "border-border bg-card hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg")}
      style={{ borderColor: isSelected ? color : undefined }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${color}ee 0%, ${color} 100%)` }}>
          <FileText size={24} />
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <h4 className="truncate font-bold text-foreground mb-1">{lecture.title}</h4>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-md px-2 py-0.5 text-white shadow-sm" style={{ backgroundColor: color }}>{lecture.subject ?? "General"}</span>
            <span className="flex items-center gap-1 text-muted-foreground"><CalendarDays size={12} /> {new Date(lecture.created_at).toLocaleDateString()}</span>
            <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-600 border border-emerald-500/20"><Check size={12} /> Processed</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={e => e.stopPropagation()}>
          <button onClick={() => onViewDetails(lecture)} className="rounded p-2 text-primary hover:bg-primary/10 transition-colors" title="View Details"><Maximize size={16} /></button>
          <button onClick={() => onDelete(lecture)} className="rounded p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  );
}

// ── Upload Panel ───────────────────────────────────────────────

function UploadPanel({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [uploadTab, setUploadTab] = useState("upload");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((files: File[]) => { if (files[0]) setPdfFile(files[0]); }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "application/pdf": [".pdf"] }, multiple: false });

  const handleUpload = async () => {
    if (!title.trim()) return;
    setUploading(true); setError("");
    try {
      if (uploadTab === "text") {
        await api.post("upload-note/", { title, content });
      } else {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("file", pdfFile!);
        await api.post("upload-pdf/", undefined, { formData: fd });
      }
      setTitle(""); setContent(""); setPdfFile(null);
      setShowSuccess(true); setTimeout(() => setShowSuccess(false), 4000);
      onUploadSuccess();
    } catch (err: unknown) {
      const e = err as { error?: string };
      setError(e?.error ?? "Upload failed. Please try again.");
    } finally { setUploading(false); }
  };

  const isDisabled = uploading || !title.trim() || (uploadTab === "text" && !content.trim()) || (uploadTab === "upload" && !pdfFile);

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex gap-2 rounded-xl bg-muted/50 p-1">
        {[["upload", "Upload PDF"], ["text", "Paste Text"]].map(([k, l]) => (
          <button key={k} onClick={() => setUploadTab(k)} className={cn("flex-1 rounded-lg py-2 text-sm font-bold transition-all", uploadTab === k ? "bg-background shadow text-foreground" : "text-muted-foreground hover:bg-muted")}>{l}</button>
        ))}
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-bold text-muted-foreground">Lecture Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="e.g. Intro to Biology" />
        </div>
        {uploadTab === "text" ? (
          <div>
            <label className="mb-1 block text-sm font-bold text-muted-foreground">Content</label>
            <textarea rows={7} value={content} onChange={e => setContent(e.target.value)} className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary resize-none" placeholder="Paste your lecture notes here..." />
          </div>
        ) : (
          <div {...getRootProps()} className={cn("flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors", isDragActive ? "border-primary bg-primary/5" : pdfFile ? "border-emerald-500 bg-emerald-500/5" : "border-border hover:border-primary/50 hover:bg-muted/30")}>
            <input {...getInputProps()} />
            {pdfFile ? (
              <><Check size={40} className="mb-2 text-emerald-500" /><p className="font-bold text-emerald-600">{pdfFile.name}</p><p className="text-xs text-muted-foreground">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p></>
            ) : (
              <><UploadCloud size={40} className="mb-2 text-muted-foreground" /><p className="font-bold text-muted-foreground">{isDragActive ? "Drop here!" : "Click or drag PDF"}</p><p className="text-xs text-muted-foreground opacity-70">Max 25MB</p></>
            )}
          </div>
        )}
      </div>
      <button onClick={handleUpload} disabled={isDisabled} className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 flex items-center justify-center gap-2">
        {uploading ? <><Loader2 className="animate-spin" size={18} /> Processing…</> : "Generate Content"}
      </button>
      {showSuccess && <div className="rounded-xl bg-emerald-500/10 p-4 text-sm font-bold text-emerald-600 border border-emerald-500/20 text-center">Uploaded successfully! Processing your material…</div>}
      {error && <div className="rounded-xl bg-red-500/10 p-4 text-sm font-bold text-red-600 border border-red-500/20 text-center">{error}</div>}
    </div>
  );
}

// ── Main Lectures Page ─────────────────────────────────────────

export default function LecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLecture, setDetailsLecture] = useState<Lecture | null>(null);
  const [detailsData, setDetailsData] = useState<LectureDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchLectures = useCallback(async () => {
    try {
      const data = await api.get<Lecture[]>("lectures/");
      const list = Array.isArray(data) ? data : [];
      setLectures(list);
      setSelectedLecture(prev => prev ?? (list[0] ?? null));
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLectures(); }, [fetchLectures]);

  const filtered = lectures.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const grouped = filtered.reduce<Record<string, Lecture[]>>((acc, l) => {
    const s = l.subject ?? "General";
    if (!acc[s]) acc[s] = [];
    acc[s].push(l);
    return acc;
  }, {});

  const handleViewDetails = async (lecture: Lecture) => {
    setDetailsLecture(lecture); setDetailsOpen(true); setLoadingDetails(true); setDetailsData(null);
    try {
      const res = await api.get<LectureDetails & Lecture>(`lectures/${lecture.id}/`);
      setDetailsData(res);
    } catch { } finally { setLoadingDetails(false); }
  };

  const handleGenerateQuestions = async (noteId: number) => {
    setGenerating(true);
    try {
      await api.post("generate-mcqs/", { note_id: noteId, count: 10 });
      const res = await api.get<LectureDetails & Lecture>(`lectures/${noteId}/`);
      setDetailsData(res);
    } catch { } finally { setGenerating(false); }
  };

  const handleDeleteClick = (lecture: Lecture) => { setLectureToDelete(lecture); setDeleteError(""); setDeleteDialogOpen(true); };

  const confirmDelete = async () => {
    if (!lectureToDelete) return;
    setDeleting(true); setDeleteError("");
    try {
      await api.delete(`lectures/${lectureToDelete.id}/`);
      setLectures(prev => prev.filter(l => l.id !== lectureToDelete.id));
      if (selectedLecture?.id === lectureToDelete.id) setSelectedLecture(null);
      setDeleteDialogOpen(false); setLectureToDelete(null);
    } catch (err: unknown) {
      const e = err as { error?: string };
      setDeleteError(e?.error ?? "Failed to delete lecture.");
    } finally { setDeleting(false); }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] min-h-[600px] flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6 flex shrink-0 items-end justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Lecture Library</h1>
          <p className="font-medium text-muted-foreground mt-1">Organized by subject for seamless studying.</p>
        </div>
        <button onClick={() => setUploadDialogOpen(true)} className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
          <Plus size={18} /> Add Material
        </button>
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        {/* Sidebar */}
        <div className="flex w-[320px] shrink-0 flex-col rounded-3xl border bg-card shadow-sm overflow-hidden">
          <div className="border-b p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input type="text" placeholder="Search lectures..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full rounded-xl bg-muted/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-colors focus:bg-background focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p className="font-bold">No lectures found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([subject, lecs]) => (
                  <div key={subject}>
                    <div className="mb-3 flex items-center gap-2 px-1">
                      <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: subjectToColor(subject) }} />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{subject}</h3>
                      <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-bold">{lecs.length}</span>
                    </div>
                    <div className="space-y-3">
                      {lecs.map(lec => (
                        <LectureCard key={lec.id} lecture={lec} isSelected={selectedLecture?.id === lec.id} onSelect={setSelectedLecture} onDelete={handleDeleteClick} onViewDetails={handleViewDetails} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Viewer */}
        <div className="flex min-w-0 flex-1 gap-6">
          {selectedLecture ? (
            <>
              <div className="flex flex-[2] flex-col overflow-hidden rounded-3xl border bg-card shadow-sm relative">
                <div className="absolute inset-0 z-0"><FileViewer lecture={selectedLecture} /></div>
              </div>
              <div className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-3xl border bg-card shadow-sm">
                <NotesSidebar lectureId={selectedLecture.id} />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed bg-card/50 text-muted-foreground shadow-inner">
              <BookOpen size={80} className="mb-6 opacity-20" />
              <h2 className="text-2xl font-bold">No Lecture Selected</h2>
              <p className="mt-2 font-medium">Select a lecture from the library to view it here.</p>
            </div>
          )}
        </div>
      </div>

      <LectureDetailsModal open={detailsOpen} onClose={() => setDetailsOpen(false)} lecture={detailsLecture} details={detailsData} loading={loadingDetails} onGenerateQuestions={handleGenerateQuestions} generating={generating} />

      {/* Upload Dialog */}
      {uploadDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">Add New Material</h2>
              <button onClick={() => setUploadDialogOpen(false)} className="rounded-full p-2 hover:bg-muted text-muted-foreground"><X size={20} /></button>
            </div>
            <UploadPanel onUploadSuccess={() => { fetchLectures(); setUploadDialogOpen(false); }} />
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500"><Trash2 size={32} /></div>
            <h2 className="text-xl font-black mb-2">Delete Lecture?</h2>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete <strong>"{lectureToDelete?.title}"</strong>? This cannot be undone.</p>
            {deleteError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 text-left dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{deleteError}</div>}
            <div className="flex gap-3">
              <button disabled={deleting} onClick={() => { setDeleteDialogOpen(false); setDeleteError(""); }} className="flex-1 rounded-full bg-muted py-3 font-bold text-muted-foreground hover:bg-muted/80 disabled:opacity-50">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 rounded-full bg-red-500 py-3 font-bold text-white hover:bg-red-600 shadow-lg shadow-red-500/20 disabled:opacity-60 flex items-center justify-center gap-2">
                {deleting ? <><Loader2 size={16} className="animate-spin" /> Deleting…</> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
