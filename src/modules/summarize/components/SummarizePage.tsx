"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BookMarked,
  GitMerge,
  Zap,
  AlertTriangle,
} from "lucide-react";
import mermaid from "mermaid";
import { fetchSummarizeLectures, fetchLectureSummary } from "../api";
import type { SummarizeLecture, LectureSummary } from "../types";

mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "strict", fontFamily: "Inter, sans-serif" });

const MermaidDiagram = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!chart) return;
    const render = async () => {
      try {
        setError(false);
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch {
        setError(true);
      }
    };
    render();
  }, [chart]);

  if (error) return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
      <div className="flex items-center gap-2 mb-2 text-amber-600">
        <AlertTriangle size={18} /> <span className="font-bold text-sm">Flowchart rendering error</span>
      </div>
      <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto">{chart}</pre>
    </div>
  );

  if (!svg) return (
    <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
  );

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#1e1e2e]">
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {["-", "Reset", "+"].map((label, i) => (
          <button key={label} onClick={() => setZoom(i === 0 ? (z) => Math.max(0.5, z - 0.2) : i === 2 ? (z) => Math.min(3, z + 0.2) : () => 1)}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-colors">
            {label}
          </button>
        ))}
      </div>
      <div className="overflow-auto p-6 cursor-grab active:cursor-grabbing" style={{ minHeight: 300 }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.2s ease" }}
          dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
    </div>
  );
};

const importanceDot = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

const AccordionItem = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 px-6 text-left font-bold hover:bg-muted/30 transition-colors">
        <span>{title}</span>
        {open ? <ChevronUp size={18} className="text-muted-foreground shrink-0" /> : <ChevronDown size={18} className="text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">{children}</div>}
    </div>
  );
};

export default function SummarizePage() {
  const [lectures, setLectures] = useState<SummarizeLecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<LectureSummary | null>(null);
  const [lecturesLoading, setLecturesLoading] = useState(true);

  useEffect(() => {
    fetchSummarizeLectures()
      .then((r) => setLectures(r || []))
      .catch(() => setError("Failed to fetch lectures"))
      .finally(() => setLecturesLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!selectedLecture) { setError("Please select a lecture"); return; }
    setLoading(true); setError(""); setSummary(null);
    try {
      const res = await fetchLectureSummary(selectedLecture);
      setSummary(res.summary);
    } catch (err: unknown) {
      const e = err as { message?: string; error?: string };
      setError(e.error || e.message || "Failed to generate summary. Please try again.");
    } finally { setLoading(false); }
  };

  const selectedTitle = lectures.find((l) => String(l.id) === selectedLecture)?.title;

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b pb-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
            <Sparkles size={14} /> AI Summarizer
          </div>
          <h1 className="text-4xl font-black tracking-tight">Lecture Summarizer</h1>
          <p className="mt-3 text-lg font-medium text-muted-foreground">
            Get structured summaries, key concepts, definitions, and visual flowcharts from any lecture.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative flex-1 sm:flex-none sm:min-w-[240px]">
            <select
              value={selectedLecture}
              onChange={(e) => { setSelectedLecture(e.target.value); setSummary(null); }}
              className="h-12 w-full appearance-none rounded-xl border bg-background px-4 pr-10 text-sm font-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              disabled={lecturesLoading}
            >
              <option value="">{lecturesLoading ? "Loading..." : "Select a lecture"}</option>
              {lectures.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedLecture}
            className="flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-[1.02] hover:shadow-primary/50 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 whitespace-nowrap"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            {loading ? "Summarizing..." : "Generate"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm font-semibold text-red-500 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 font-bold text-xs">Dismiss</button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 size={56} className="animate-spin text-primary mb-6" />
          <h3 className="text-xl font-bold mb-2">Analysing lecture content...</h3>
          <p className="text-sm">This may take 15–30 seconds while the AI processes your material.</p>
        </div>
      )}

      {!summary && !loading && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-24 text-center text-muted-foreground">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <Sparkles size={40} />
          </div>
          <h2 className="text-2xl font-black mb-3">AI-Powered Summaries</h2>
          <p className="text-base max-w-md leading-relaxed">
            Select a lecture and click <strong>Generate</strong> to get key concepts, definitions, relationships, and a visual flowchart.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[{ label: "Key Concepts", color: "bg-blue-500/10 text-blue-600" }, { label: "Definitions", color: "bg-violet-500/10 text-violet-600" }, { label: "Visual Flowchart", color: "bg-cyan-500/10 text-cyan-600" }, { label: "Exam Bullets", color: "bg-amber-500/10 text-amber-600" }].map(({ label, color }) => (
              <span key={label} className={`rounded-full px-4 py-1.5 text-sm font-bold ${color}`}>{label}</span>
            ))}
          </div>
        </div>
      )}

      {summary && !loading && (
        <div className="flex flex-col gap-8">
          {/* Banner */}
          <div className="flex items-center gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Summary Generated</p>
              <h2 className="text-xl font-black">{selectedTitle}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {summary.key_concepts?.length || 0} concepts · {summary.definitions?.length || 0} definitions
              </p>
            </div>
          </div>

          {/* Overview */}
          <div className="rounded-3xl border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"><BookOpen size={20} /></div>
              <h3 className="text-xl font-black">Overview & TL;DR</h3>
            </div>
            {summary.tldr && (
              <div className="mb-5 rounded-2xl border-l-4 border-emerald-500 bg-emerald-500/10 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-2">TL;DR</p>
                <p className="text-sm font-semibold leading-relaxed">{summary.tldr}</p>
              </div>
            )}
            <p className="text-base leading-relaxed text-muted-foreground">{summary.overview}</p>
          </div>

          {/* Key Concepts */}
          {summary.key_concepts && summary.key_concepts.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500"><Lightbulb size={20} /></div>
                <h3 className="text-xl font-black">Key Concepts</h3>
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-600">{summary.key_concepts.length} concepts</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {summary.key_concepts.map((concept, idx) => {
                  const dot = importanceDot[concept.importance as keyof typeof importanceDot] || importanceDot.medium;
                  return (
                    <div key={idx} className="group relative rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md overflow-hidden">
                      <div className="absolute left-0 inset-y-0 w-1 rounded-l-2xl" style={{ backgroundColor: dot }} />
                      <div className="flex items-start justify-between mb-3 pl-3">
                        <h4 className="font-black text-sm leading-snug pr-2 flex-1">{concept.name}</h4>
                        <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-black" style={{ backgroundColor: `${dot}18`, color: dot }}>
                          {concept.importance?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground pl-3">{concept.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Definitions */}
          {summary.definitions && summary.definitions.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500"><BookMarked size={20} /></div>
                <h3 className="text-xl font-black">Important Definitions</h3>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-600">{summary.definitions.length} terms</span>
              </div>
              <div className="rounded-3xl border bg-card shadow-sm overflow-hidden divide-y divide-border">
                {summary.definitions.map((def, idx) => (
                  <AccordionItem key={idx} title={<span className="text-primary font-black">{def.term}</span>}>
                    {def.definition}
                  </AccordionItem>
                ))}
              </div>
            </div>
          )}

          {/* Relationships */}
          {summary.relationships && (
            <div className="rounded-3xl border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500"><GitMerge size={20} /></div>
                <h3 className="text-xl font-black">Concept Relationships</h3>
              </div>
              <p className="text-base leading-relaxed text-muted-foreground">{summary.relationships}</p>
            </div>
          )}

          {/* Exam bullets & Memory anchors */}
          {((summary.exam_bullets?.length ?? 0) > 0 || (summary.memory_anchors?.length ?? 0) > 0) && (
            <div className="grid gap-6 md:grid-cols-2">
              {Boolean(summary.exam_bullets?.length) && (
                <div className="rounded-3xl border bg-card p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500"><Zap size={20} /></div>
                    <h3 className="text-lg font-black">High-Yield Exam Bullets</h3>
                  </div>
                  <ul className="space-y-3">
                    {summary.exam_bullets?.map((b, i) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                        <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Boolean(summary.memory_anchors?.length) && (
                <div className="rounded-3xl border bg-card p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500"><Lightbulb size={20} /></div>
                    <h3 className="text-lg font-black">Memory Anchors</h3>
                  </div>
                  <ul className="space-y-3">
                    {summary.memory_anchors?.map((a, i) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                        <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Flowchart */}
          {summary.flowchart && (
            <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 border-b px-8 py-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><GitMerge size={20} /></div>
                <h3 className="text-xl font-black">Concept Flowchart</h3>
                <span className="ml-auto rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-black text-primary">Visual</span>
              </div>
              <div className="p-8">
                <MermaidDiagram chart={summary.flowchart} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
